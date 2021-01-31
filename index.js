const WebSocket = require('ws')
const { WinstonLogger } = require('./dist/Logger');
const { Router } = require("./dist/Router");
require('dotenv').config();

const port = 8201;
const wss = new WebSocket.Server({ port: port })

console.log("Listening on port " + port);

var connections = {};
var connectionCounter = 0;

wss.on('connection', function (socket) {

    socket.id = generateGuid();
    connections[connectionCounter++] = socket;
    console.log("Connection established");
    socket.on('message', async function (message) {

        try {
            const body = JSON.parse(message);
            Router.routeChat(socket.id, body.action, body.room, body, socket);
        } catch (e) {
            const wl = new WinstonLogger();
            wl.error(e);
            wl.flush();
        }
    })

});

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function generateGuid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();;
}