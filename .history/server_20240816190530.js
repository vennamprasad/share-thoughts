const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const findFreePort = require('find-free-port');

// Load environment variables from .env file
dotenv.config();
// console.log
console.log(`PORT from .env: ${process.env.PORT}`);

const app = express();

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
findFreePort(defaultPort, (err, freePort) => {
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

