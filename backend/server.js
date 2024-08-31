// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import router from "./router/router.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import Spreadsheet from './models/Spreadsheet.js';
import connectDB from './db.js';
connectDB();
const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/",router);
// MongoDB connection

// Save data endpoint


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
