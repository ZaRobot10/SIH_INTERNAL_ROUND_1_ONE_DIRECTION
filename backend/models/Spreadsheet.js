// backend/models/Spreadsheet.js
import mongoose from 'mongoose';

const SpreadsheetSchema = new mongoose.Schema({
  data:Array,
  id:Number,
});

export default mongoose.model("Spreadsheet", SpreadsheetSchema);
