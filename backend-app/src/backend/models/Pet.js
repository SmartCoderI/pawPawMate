const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  species: { type: String, enum: ["dog", "cat", "other"], default: "dog" },
  breed: String,
  gender: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
  birthDate: Date,
  profileImage: String,
  personalityTraits: [String], // e.g. ["playful", "shy", "friendly"]
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pet", petSchema);
