// backend/server.js
import express from 'express';
import router from "./router/router.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import { createServer } from 'http'; // Import http to create a server
import { Server } from 'socket.io'; 

// Connect to MongoDB
connectDB();

const app = express();

// Create an HTTP server
const server = createServer(app);

// Create a new instance of Socket.IO and pass the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict the origin in production
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for changes from clients
  socket.on('cell-update', async ({ row, col, value }) => {
    // Broadcast the change to other connected clients
    socket.broadcast.emit('cell-update', { row, col, value });

    // Optionally, you can save the updates to the database here
    console.log(`Cell updated: Row ${row}, Col ${col}, Value: ${value}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/", router);

// Define the port
const port = process.env.PORT || 5001;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
