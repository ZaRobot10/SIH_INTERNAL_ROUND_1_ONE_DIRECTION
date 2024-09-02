import express from 'express';
import router from "./router/router.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import { createServer } from 'http';
import { Server } from 'socket.io'; 

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// In-memory store for sheet data (consider using a database for persistence)
const sheetDataStore = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for the event where a client joins a specific sheet
  socket.on('join-sheet', (sheetId) => {
    if (sheetId) {
      socket.join(sheetId);
      console.log(`User ${socket.id} joined sheet ${sheetId}`);
    } else {
      console.log('Sheet ID is undefined in join-sheet event');
    }
  });

  // Listen for cell updates and broadcast them within the same room
  socket.on('cell-update', ({ sheetId, row, col, value }) => {
    if (sheetId) {
      // Broadcast the change to all clients in the same room
      socket.to(sheetId).emit('cell-update', { row, col, value });
      console.log(`Sheet ${sheetId} - Cell updated: Row ${row}, Col ${col}, Value: ${value}`);
    } else {
      console.log('Sheet ID is undefined in cell-update event');
    }
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
