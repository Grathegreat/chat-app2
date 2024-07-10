const socket = io();

let username = '';

function joinChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('user joined', username);
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', message);
        messageInput.value = ''; // Clear the input field after sending message
    }
}

socket.on('user joined', (username) => {
    addNotification(`${username} joined the chat room.`);
});

socket.on('username taken', (username) => {
    alert(`Username "${username}" is already taken. Please choose a different username.`);
    // Optionally, clear the input field or prompt the user to enter a new username
    // Example: document.getElementById('username').value = '';
});

socket.on('user left', (username) => {
    addNotification(`${username} left the chat room.`);
});

// Example function to request and display active users list
function displayActiveUsers() {
    socket.emit('get active users');
}

socket.on('active users list', (users) => {
    console.log('Active users:', users);
    // Display or update UI with active users list
});

function addNotification(message) {
    const chatBox = document.getElementById('chatBox');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    chatBox.appendChild(notification);
}
