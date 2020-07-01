const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const PORT = process.env.PORT || 9025
const APP_URL = process.env.APP_URL || 'localhost'

var Streamer = {}
var Receiver = {}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    /** For Chat using Socket.IO */
    console.log('Client is connected ' + socket.id)
    socket.on('userMessage', (data) => {
        io.sockets.emit('userMessage', data);
    });

    socket.on('userTyping', (data) => {
        socket.broadcast.emit('userTyping', data);
    });
    /** END Chat */

    /** Video Broadcaster using Socket.IO and Simple-Peer */
    socket.on("startConnection", () => {
        socket.broadcast.emit("startConnection")
    });

    socket.on("signal", (data) => {
        socket.broadcast.emit("signal", data);
    });
    /** END VIDEO BROADCASTER */
});


http.listen(PORT, () => {
    console.log('Listening on http://localhost:' + PORT);
});