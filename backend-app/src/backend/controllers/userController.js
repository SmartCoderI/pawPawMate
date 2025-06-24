
const User = require("../models/User");
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
  try {
    console.log('Backend: Creating user with data:', req.body);
    const user = await User.create(req.body);
    console.log('Backend: Created user successfully:', user);
    res.status(201).json(user);
  } catch (err) {
    console.error('Backend: Error creating user:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get user by Firebase UID
exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const uid = req.params.uid.trim();
    console.log('Backend: Looking for user with Firebase UID:', uid);
    
    const user = await User.findOne({ uid: uid });
    if (!user) {
      console.log('Backend: No user found with UID:', uid);
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log('Backend: Found user:', user);
    res.json(user);
  } catch (err) {
    console.error('Backend: Error finding user by UID:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
