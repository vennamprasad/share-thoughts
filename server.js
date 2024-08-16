const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin SDK with Firestore
const serviceAccount = require(path.join(__dirname, './config/serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // No need to include the databaseURL for Firestore
});
// Reference to Firestore
const db = admin.firestore();
const messagesCollection = db.collection('messages');
// Reference to Firestore
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (client) => {
    console.log('Connection received');

    client.on('new_message', async (chat) => {
        console.log(`New message received: ${chat}`);

        try {
            await messagesCollection.add({
                message: chat,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Message stored in Firestore');
        } catch (error) {
            console.error('Error storing message in Firestore:', error);
        }

        io.emit('broadcast', chat);
    });

    client.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Set a fixed port
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// Enhanced shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down server...`);

    server.close(() => {
        console.log('HTTP server closed.');
        io.close(() => {
            console.log('Socket.IO connections closed.');
            process.exit(0);
        });
    });

    setTimeout(() => {
        console.error('Forcing shutdown due to timeout...');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));