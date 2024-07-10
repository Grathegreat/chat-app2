const socket = io();

let username = '';

function joinChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('user joined', username);
    }
}

socket.on('user joined', (username) => {
    addNotification(`${username} joined the chat room.`);
});

socket.on('username taken', (username) => {
    alert(`Username "${username}" is already taken. Please choose a different username.`);
    // Optionally, clear the input field or prompt the user to enter a new username
});
