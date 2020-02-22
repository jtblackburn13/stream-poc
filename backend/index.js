const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on("connection", (socket) => {
    console.log("client connected!");

    socket.on('play', playSound => {
        io.emit('play', playSound)
    });

    socket.on('stop', msg => {
        io.emit('stop', msg)
    });
});

// app.get('/', (req, res) => {
//     console.log(`Inbound Stream Request from IP ${req.ip}`);
//     res.sendFile(__dirname + '/index.html')
// });



server.listen(3001, () => {
    console.log('server is listening on port 3001.')
});