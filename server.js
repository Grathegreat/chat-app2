const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Object to store usernames
const inappropriateWords = ['bastos', 'badword', 'offensive']; // Example list of inappropriate words
const usersFilePath = 'users.txt'; // File to store active users

app.use(express.static('public'));

// Load initial list of users from file if exists
let activeUsers = [];
if (fs.existsSync(usersFilePath)) {
    activeUsers = fs.readFileSync(usersFilePath, 'utf8').trim().split('\n');
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            io.emit('user left', username);
            updateUsersFile();
        }
    });

    socket.on('chat message', (msg) => {
        if (containsInappropriateWord(msg)) {
            handleInappropriateMessage(socket);
        } else {
            io.emit('chat message', msg);
        }
    });

    socket.on('user joined', (username) => {
        if (!isUsernameAvailable(username)) {
            socket.emit('username taken', username);
            return;
        }

        if (isInappropriateUsername(username)) {
            socket.emit('inappropriate username', username);
            return;
        }

        users[socket.id] = username;
        io.emit('user joined', username);
        activeUsers.push(username);
        updateUsersFile();
    });

    // Send active users list to client when requested
    socket.on('get active users', () => {
        socket.emit('active users list', activeUsers);
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

function containsInappropriateWord(message) {
    const lowerMessage = message.toLowerCase();
    for (let word of inappropriateWords) {
        if (lowerMessage.includes(word)) {
            return true;
        }
    }
    return false;
}

function handleInappropriateMessage(socket) {
    const username = users[socket.id];
    if (username) {
        delete users[socket.id];
        socket.emit('message removed', 'Your message contained inappropriate content.');
        io.emit('user left', username);
        updateUsersFile();
    }
    socket.disconnect(true);
}

function updateUsersFile() {
    fs.writeFileSync(usersFilePath, activeUsers.join('\n'));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
