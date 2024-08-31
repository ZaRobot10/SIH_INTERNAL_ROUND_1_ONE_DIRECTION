// backend/models/Spreadsheet.js
import mongoose from 'mongoose';

const SpreadsheetSchema = new mongoose.Schema({
  data: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Spreadsheet', SpreadsheetSchema);
