const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: String, // AI-generated image or uploaded
  caption: String, // summary or AI-generated description
  helpfulCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Card", cardSchema);
