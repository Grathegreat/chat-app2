const socket = io();

let username = '';

function joinChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('joinScreen').style.display = 'none';
        document.getElementById('chatScreen').style.display = 'flex';
        socket.emit('user joined', username);
    }
}

function sendMessage() {
    const message = document.getElementById('messageInput').value.trim();
    if (message) {
        socket.emit('chat message', `${username}: ${message}`);
        document.getElementById('messageInput').value = '';
    }
}

socket.on('chat message', (msg) => {
    addMessage(msg);
});

socket.on('user joined', (username) => {
    addNotification(`${username} joined the chat room.`);
});

function addMessage(msg) {
    const chatBox = document.getElementById('chatBox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerText = msg;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addNotification(notification) {
    const chatBox = document.getElementById('chatBox');
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.innerText = notification;
    chatBox.appendChild(notificationElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}