//test update
// import dataJSON from "./draft.json"

let http = require('http');
// let https = require('https');
// let fs = require('fs');
let express = require('express');
let app = express();
let server = http.createServer(app);

//SETUP SOCKETS
let PORT = process.env.PORT || 4000;
app.use('/', express.static('public'));

//SETUP DB
require('dotenv').config()
const mongoDB = require('mongodb')
const { MongoClient } = require('mongodb');
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

//DATABASE FUNCTIONS
//Create
const newComment = async (data) => {
  //Add to DB
  const newCommentResult = await client.db("farvel").collection("comments").insertOne(data);
  console.log(`New listing created with the following ID: ${newCommentResult.insertedId}`)
  return data;

};

//Read
const getData = async (sceneURL) => {
  //Get data by sceneURL
  console.log('grabbing data for: ' + sceneURL)
  const readResult = await client.db("farvel").collection("comments").find({sceneURL : sceneURL})
  const results = await readResult.toArray();
  if (results) {
    console.log(results);
    return results;
  } else {
    console.log(`Could not find any data for this scene: ${sceneURL}`);
  }
}

//Update
const adminEdit = async (data) => {
  //Write DB{sceneID: data.sceneURL}, { $set : {"listComments.$[elem]": data.comment}}, { arrayFilters: [{"elem.commentID" : data.comment.commentID}], upsert: true}
  const updateResult = await client.db("farvel").collection("comments").findOneAndUpdate({commID : data.commID}, {$set : data}, {returnDocument: "after"});
  console.log(updateResult);
  //console.log("updated " + updateResult.modifiedCount + " documents")
  return updateResult.value;
};

//Delete
const adminDelete = async (data) => {
  const delResult = await client.db("farvel").collection("comments").findOneAndDelete({commID : data.commID});
  console.log(delResult.value);
  return delResult.value;
}

//SOCKET SETUP
//Initialize
let io = require('socket.io')(server);
const generalServer = io.of('/general');

//For handle new connections
generalServer.on('connection', (socket) => {
    console.log('new general connection at ' + socket.id);

    //Set up listeners
    //CREATE
    socket.on('newComment', async (comData) => {
      //Insert into DB
      const newCom = await newComment(comData);

      //Relay to other connected users
      generalServer.emit("reflector", newCom);
    });

    //READ
    socket.on('getData', async (sceneURL) => {
      //Read DB
      const data = await getData(sceneURL);

      //Return data to individual connection
      generalServer.to(socket.id).emit("getDataResp", data);
    });

    //UPDATE
    socket.on('adminEdit', async (comData) => {
      //Update DB
      const updatedCom = await adminEdit(comData);

      //Relay to other connected users
      generalServer.emit("reflector", updatedCom)
    });

    socket.on('adminDelete', async (comData) => {
      //Update DB
      const deletedCom = await adminDelete(comData);
      deletedCom.deleted = true;
      //Relay to other connected users
      generalServer.emit("reflector", deletedCom);
    });
});

//SERVER LISTENING
server.listen(process.env.PORT || PORT, () => {
  console.log("Express server listening on port", PORT);
});
