import Spreadsheet from "../models/Spreadsheet.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import createsecrettoken from "./token.js";
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: true, message: "data required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user does not exist" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "incorrect password or email" });
    }
    const token = createsecrettoken(user._id);
    res.status(201).json({
      token: token,
      username:user.username,
      message: "user logged in successfully",
      success: true,
      userid: user._id,
    });
    next();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
export const signup = async (req, res, next) => {
  try {
    const { email, password,username } = req.body;
    if (!password || !email||!username) {
      return res.json({ success: false, message: "user data required" });
    }
    const ispresent = await User.findOne({ email });
    if (ispresent) {
      return res.json({ success: false, message: "user already exist" });
    }
    const user = await User.create({ email, password,username });
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    const token = createsecrettoken(user._id);
    res.status(201).json({
      token: token,
      message: "User signed up successfully",
      success: true,
      user,
    });
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};
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
