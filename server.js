const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Object to store usernames

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            io.emit('user left', username);
        }
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('user joined', (username) => {
        if (isUsernameAvailable(username)) {
            users[socket.id] = username;
            io.emit('user joined', username);
        } else {
            socket.emit('username taken', username);
        }
    });
});

function isUsernameAvailable(username) {
    for (let socketId in users) {
        if (users[socketId] === username) {
            return false;
        }
    }
    return true;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
