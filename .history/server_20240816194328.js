const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const findFreePort = require('find-free-port');

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCu7ranzmEWjtzic7Gw7cCkU_lLlLKW2Dg",
  authDomain: "socket-chat-579a7.firebaseapp.com",
  projectId: "socket-chat-579a7",
  storageBucket: "socket-chat-579a7.appspot.com",
  messagingSenderId: "428257642385",
  appId: "1:428257642385:web:a4c3eeaac17d567196bc30",
  measurementId: "G-PK8ZZZ7KQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Load environment variables from .env file
dotenv.config();

// Console log to confirm the port from .env
console.log(`PORT from .env: ${process.env.PORT}`);

// Enable CORS if needed (e.g., for cross-domain clients)
app.use(cors());

// Create an HTTP server and bind it to Express
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIO(server);

// Socket.IO connection handler
io.on('connection', (client) => {
    console.log('Connection received');

    // Listen for 'new_message' event from clients
    client.on('new_message', (chat) => {
        console.log(`New message received: ${chat}`);
        // Broadcast the message to all connected clients
        io.emit('broadcast', chat);
    });

    // Handle disconnection
    client.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Simple route to confirm server is running
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Define the port to listen on, with a default fallback
const port = process.env.PORT || 4000;

findFreePort(port, (err, freePort) => {
    if (err) {
        console.error('Error finding a free port:', err);
        process.exit(1);
    }
    server.listen(freePort, () => {
        console.log(`Server running at ${freePort}...`);
    });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
    });
});
