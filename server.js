const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Object to store usernames
const inappropriateWords = ['admin', 'moderator', 'root', 'author']; // Example list of inappropriate words

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
        if (!isUsernameAvailable(username)) {
            socket.emit('username taken', username);
            return;
        }

        if (isInappropriateUsername(username)) {
            socket.emit('the admin not allow to use this username!', username);
            return;
        }

        users[socket.id] = username;
        io.emit('user joined', username);
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

function isInappropriateUsername(username) {
    const lowerUsername = username.toLowerCase();
    for (let word of inappropriateWords) {
        if (lowerUsername.includes(word)) {
            return true;
        }
    }
    return false;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
