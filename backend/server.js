import express from 'express';
import router from "./router/router.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import { createServer } from 'http';
import { Server } from 'socket.io'; 

// Connect to MongoDB
connectDB();
const frontendUrl = process.env.FRONTEND_URL;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// In-memory store for sheet data (consider using a database for persistence)
const activeUsers = {}; // Object to keep track of active users in each sheet

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for the event where a client joins a specific sheet
  socket.on('join-sheet', ({ sheetId, user }) => {
    if (sheetId) {
      // Join the specified sheet room
      socket.join(sheetId);
      console.log(`User ${socket.id} joined sheet ${sheetId}`);

      // Add user to the active users list for the sheet
      if (!activeUsers[sheetId]) {
        activeUsers[sheetId] = [];
      }
      activeUsers[sheetId].push(user);

      // Broadcast the updated list of active users to all clients in the sheet
      io.to(sheetId).emit('active-users', activeUsers[sheetId]);
    } else {
      console.log('Sheet ID is undefined in join-sheet event');
    }
  });

  // Listen for cell updates and broadcast them within the same room
  socket.on('cell-update', ({ sheetId, row, col, value, user }) => {
    if (sheetId) {
      // Broadcast the change to all clients in the same room, including the user who made the change
      socket.to(sheetId).emit('cell-update', { row, col, value, user });
      console.log(`Sheet ${sheetId} - Cell updated: Row ${row}, Col ${col}, Value: ${value}`);
    } else {
      console.log('Sheet ID is undefined in cell-update event');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the user from the active users list in all sheets they were part of
    for (const sheetId in activeUsers) {
      activeUsers[sheetId] = activeUsers[sheetId].filter(
        (user) => user.socketId !== socket.id
      );
      io.to(sheetId).emit('active-users', activeUsers[sheetId]); // Broadcast updated users list
    }
  });
});

// Middleware
app.use(
  cors({
    origin:frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use("/", router);

// Define the port
const port = process.env.PORT || 5001;

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
