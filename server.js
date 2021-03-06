var app = require('express')();
    http = require('http'),
    WebSocketServer = require('ws').Server,
    express = require('express'),
    path = require('path'),
    url = require('url'),
    WebSocket = require('ws');

//serve root
app.use('/', express.static(__dirname + '/public'));

//create an http server
var server = http.createServer(app);
server.listen(8080);

//create a ws server that mounts onto the http server
var wsServer = new WebSocketServer({server: server});

//collections to hold state regardless of ws
var activeMembers = [];
var allMsgs = [];
var connections = [];

wsServer.on('connection', function connection(ws) {
    location = url.parse(ws.upgradeReq.url, true);

    var user = {};
    //default user
    user.username = "Guest";
    user.id;
    user.connection;
    //create a broadcast function
    ws.broadcast = function broadcast(data){
        wsServer.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    //broadcast num of users connected as users join the chat
    var numUsers = ws.broadcast(JSON.stringify({type: "numUsers", data: wsServer.clients.length}));
    
    //all loggedin users in chat
    var updateMembers = ws.broadcast(JSON.stringify({type: "loggedIn", data: activeMembers}));
    
    //send all previous messages in chat room to new user
    ws.send(JSON.stringify({type:"chatHistory", data: allMsgs}));

    //send initial user obj back
    ws.send(JSON.stringify({type:"user", data: user}));

    //handle incoming messages to server
    ws.on('message', function incoming(data) {
        var msg = JSON.parse(data);
        switch(msg.type) {
            case "name":
                user.username = msg.data;
                activeMembers.push(user);
                connections.push(ws);
                ws.send(JSON.stringify({type: "name", data: user.username}));
                ws.broadcast(JSON.stringify({type:"loggedIn", data: activeMembers}));
                break;
            case "user-message":
                allMsgs.push(JSON.stringify({id: user.id, username: user.username, msg: msg.data}));
                ws.broadcast(JSON.stringify({type: "msgs", data: user.username +": "+ msg.data}));
                break;
            case "leave":
                //remove user from activeMembers
                var find = activeMembers.indexOf(user.id);
                activeMembers.splice(find, 1);
                //tell users user left
                ws.broadcast(JSON.stringify({type: "exit", data: user.username + " left."}));
                //update based on leaving user
                user.username = "Guest";
                ws.broadcast(JSON.stringify({type:"loggedIn", data: activeMembers}));
                ws.send(JSON.stringify({type:"name", data: user.username}));
                updateMembers;
                break;
            case "typing":
                ws.broadcast(JSON.stringify({type: msg.type, data: user.username}));
                break;
            case "not typing":
                ws.broadcast(JSON.stringify({type: msg.type, data: user.username}));
                break;
            case "private message":
                // console.log(msg);
                for (var i = 0; i< activeMembers.length; i++) {
                    if (activeMembers[i].username === msg.data.who) { 
                        console.log(i);
                        connections[i].send(JSON.stringify({type: "private message", to: msg.data.who, from: user.username, text: msg.data.body}));
                    }
                };
            break;
        }
    });

    ws.on('close', function() {
        var find = activeMembers.indexOf(user.id);
        activeMembers.splice(find, 1);
        ws.broadcast(JSON.stringify({type: "numUsers", data: wsServer.clients.length}));
        ws.broadcast(JSON.stringify({type:"loggedIn", data: activeMembers}));
    });
});



