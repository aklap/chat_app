var app = require('express')();
var http = require('http');
var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var url = require('url');
var WebSocket = require('ws');

//serve root
app.use('/', express.static(__dirname + '/public'));

//create a http server
var server = http.createServer(app);
server.listen(8080);

//create a ws server that mounts onto the http server
var wsServer = new WebSocketServer({server: server});

wsServer.on('connection', function connection(ws) {
    //upgrade the protocol of the request
    var location = url.parse(ws.upgradeReq.url, true);
    var username;

    ws.broadcast = function broadcast(data){
        wsServer.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    ws.on('message', function incoming(data){
        var msg = JSON.parse(data);
        console.log(msg);
        if (msg.type === "name"){
            username = msg.data;
            ws.broadcast(JSON.stringify({type: "name", data: username}));
        } else if (msg.type === "user-message") {
            ws.broadcast(JSON.stringify({type: "text", data: username +": "+ msg.data}));
        } else if (msg.type === "leave") {
            ws.broadcast(username + " left.");
        }
    });
});




