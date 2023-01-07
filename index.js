/* 
Farvel Comment Server Developed by Michael Morran for Farvel August -> November 2022. This server recieves, writes, and relays data between users connected to a Farvel Room.

SERVER SETUP
Using express with Node.js deployed on Digital Ocean as App in project 'comment-server'. Editing and deployment take place from the 'main' github branch automatically. 

MESSAGING
All messaging is conducted using Socket.io with the Socket.io-client dependancy. CRUD functions accessed through individual websocket listeners.

DATA
MongoDB database deployed on Digital Ocean as Database in project 'comment-server'. 
ENV database variables deployed and configurable on Mongo DB. API keys available when configuring database on Digital Ocean.
For development, use MongoDB compass to watch data in real time. 
Data Structure:
  {
    "_id" : "from Mongo DB",
    "objectID": "either classname set from spoke entity name or NAF-id",
    "sceneURL": "window.APP.hub.scene.url",
    "dateCreated": "new Date()",
    "state": "unapproved/approved",
    "body": "userInput",
    "attr": "userDisplayName"
  }
*/

//SETUP SERVER
let http = require("http");
let express = require("express");
let app = express();
let server = http.createServer(app);

//SETUP SOCKETS
let PORT = process.env.PORT || 4000;
app.use("/", express.static("public"));

//SETUP DB
require("dotenv").config();
const mongoDB = require("mongodb");
const { MongoClient } = require("mongodb");
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

//DATABASE FUNCTIONS
//Create
const newComment = async (data) => {
  //Add to DB
  const newCommentResult = await client
    .db("farvel")
    .collection("comments")
    .insertOne(data);
  console.log(
    `New listing created with the following ID: ${newCommentResult.insertedId}`
  );
  return data;
};

//Read
const getData = async (sceneURL) => {
  //Get data by sceneURL
  const readResult = await client
    .db("farvel")
    .collection("comments")
    .find({ sceneURL: sceneURL });
  const results = await readResult.toArray();
  if (results) {
    return results;
  } else {
    console.log(`Could not find any data for this scene: ${sceneURL}`);
  }
};

//Update
const adminEdit = async (data) => {
  delete data._id;
  const updateResult = await client
    .db("farvel")
    .collection("comments")
    .findOneAndUpdate(
      { dateCreated: data.dateCreated },
      { $set: data },
      { returnDocument: "after" }
    );
  return updateResult.value;
};

//Delete
const adminDelete = async (data) => {
  const delResult = await client
    .db("farvel")
    .collection("comments")
    .findOneAndDelete({ dateCreated: data.dateCreated });
  return delResult.value;
};

//SOCKET EVEnt SETUP
//Initialize
let io = require("socket.io")(server);
const generalServer = io.of("/general");

//For handle new connections
generalServer.on("connection", (socket) => {
  //EVENT LISTENERS
  //Create
  socket.on("newComment", async (comData) => {
    //Insert into DB
    const newCom = await newComment(comData);

    //Relay to other connected users
    generalServer.emit("reflector", newCom);
  });

  //Read
  socket.on("getData", async (sceneURL) => {
    //Read DB
    const data = await getData(sceneURL);

    //Return data to individual connection
    generalServer.to(socket.id).emit("getDataResp", data);
  });

  //Update
  socket.on("adminEdit", async (comData) => {
    //Update DB
    const updatedCom = await adminEdit(comData);

    //Relay to other connected users
    generalServer.emit("reflector", updatedCom);
  });

  //Delete
  socket.on("adminDelete", async (comData) => {
    //Delete DB
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
