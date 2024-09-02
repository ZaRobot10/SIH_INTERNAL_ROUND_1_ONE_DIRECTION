import Spreadsheet from "../models/Spreadsheet.js";
export const save = async (req, res) => {
  const { id, data } = req.body;

  try {
    const existingSheet = await Spreadsheet.findOne({ id });

    if (existingSheet) {
      // If the spreadsheet already exists, update it
      existingSheet.data = data;
      await existingSheet.save();
    
      return res
        .status(200)
        .json({ success: true, message: "Spreadsheet updated successfully." });
    } else {
      // Otherwise, create a new spreadsheet
      const newSheet = new Spreadsheet({ id, data });
      await newSheet.save();
      return res
        .status(200)
        .json({ success: true, message: "Spreadsheet saved successfully." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
