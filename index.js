//test update
import dataJSON from "./draft.json"

let http = require('http');
// let https = require('https');
// let fs = require('fs');
let express = require('express');
let app = express();
let server = http.createServer(app);

//SETUP SOCKETS
let io = require('socket.io')(server);
let PORT = process.env.PORT || 4000;
app.use('/', express.static('public'));

//GENERAL SOCKET BEGINS HERE:
//Initialize
const generalServer = io.of('/general');

//For handle new connections
generalServer.on('connection', (socket) => {
    console.log('new general connection at ' + socket.id);
    initData(socket.id);

    //Set up listeners
    socket.on('newComment', newComment);

    socket.on('adminEdit', adminEdit);

    socket.on('regCheck', regCheck);
});

const newComment = (data) => {
  //Get data state from for Scene and Identifier

  //Write DB

  //Relay Data
  console.log(data);
};

const adminEdit = (data) => {
  //Get data state from for Scene and Identifier

  //Write DB

  //Relay Data
  console.log(data);
}

const regCheck = (data) => {
  //Get data state from for Scene and Identifier

  //Return data
  console.log(data);
}

const initData = (id) => {
  //Get data state from DB
  console.log(id);

  //Send data
  generalServer.to(id).emit("initData", dataJSON);
}

//LISTEN
server.listen(process.env.PORT || PORT, () => {
  console.log("Express server listening on port", PORT);
});

