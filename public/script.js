const socket = io();
let currentUsername = '';
let selectedPhoto = null;
let profilePicture = null;
let mediaRecorder;
let recordedChunks = [];

function selectProfilePicture() {
    document.getElementById('profile-picture-input').click();
}

function joinChat() {
    const username = document.getElementById('username').value;
    const profileInput = document.getElementById('profile-picture-input');
    const file = profileInput.files[0];

    if (username && file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profilePicture = e.target.result;
            currentUsername = username;
            socket.emit('join', { username, profilePicture });
            document.getElementById('login').classList.add('hidden');
            document.getElementById('chat').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function changeName() {
    document.getElementById('new-username').classList.remove('hidden');
    document.getElementById('confirm-change').classList.remove('hidden');
}

function confirmChangeName() {
    const newUsername = document.getElementById('new-username').value;
    if (newUsername) {
        currentUsername = newUsername;
        socket.emit('change name', newUsername);
        document.getElementById('new-username').classList.add('hidden');
        document.getElementById('confirm-change').classList.add('hidden');
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message) {
        socket.emit('chat message', message);
        messageInput.value = '';
    }

    if (selectedPhoto) {
        const reader = new FileReader();
        reader.onload = function (e) {
            socket.emit('chat photo', e.target.result);
            selectedPhoto = null;
            document.getElementById('photo-input').value = ''; // Clear the file input
        };
        reader.readAsDataURL(selectedPhoto);
    }
}

function addPhoto() {
    document.getElementById('photo-input').click();
}

document.getElementById('photo-input').addEventListener('change', (event) => {
    selectedPhoto = event.target.files[0];
});

socket.on('chat message', ({ username, msg, profilePicture }) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (username === currentUsername) {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('other-message');
    }
    messageDiv.innerHTML = `<img src="${profilePicture}" class="profile-picture"> <span>${username}:</span> ${msg}`;
    document.getElementById('messages').appendChild(messageDiv);
});

socket.on('chat photo', ({ username, img, profilePicture }) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (username === currentUsername) {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('other-message');
    }
    messageDiv.innerHTML = `<img src="${profilePicture}" class="profile-picture"> <span>${username}:</span> <img src="${img}">`;
    document.getElementById('messages').appendChild(messageDiv);
});

socket.on('chat voice', ({ username, audioURL, profilePicture }) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (username === currentUsername) {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('other-message');
    }
    messageDiv.innerHTML = `<img src="${profilePicture}" class="profile-picture"> <span>${username}:</span> <audio controls src="${audioURL}"></audio>`;
    document.getElementById('messages').appendChild(messageDiv);
});

socket.on('notification', (msg) => {
    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('message', 'notification-message');
    notificationDiv.innerHTML = `<span>System:</span> ${msg}`;
    document.getElementById('messages').appendChild(notificationDiv);
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start();
            document.getElementById('stop-recording').classList.remove('hidden');
        });
}

function stopRecording() {
    mediaRecorder.stop();
    document.getElementById('stop-recording').classList.add('hidden');
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        socket.emit('chat voice', audioURL);
        recordedChunks = [];
    }
        }
