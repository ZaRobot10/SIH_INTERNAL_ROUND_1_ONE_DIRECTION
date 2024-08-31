// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Spreadsheet from './models/Spreadsheet.js';

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/socialcalc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Save data endpoint
app.post('/save', async (req, res) => {
  const spreadsheetData = req.body;

  try {
    const newSpreadsheet = new Spreadsheet({ data: spreadsheetData });
    await newSpreadsheet.save();
    res.status(200).json({ message: 'Spreadsheet data saved!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save spreadsheet data', error });
  }
});

// Load data endpoint
app.get('/load/:id', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findById(req.params.id);
    if (!spreadsheet) {
      return res.status(404).json({ message: 'Spreadsheet not found' });
    }
    res.status(200).json(spreadsheet.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load spreadsheet data', error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
