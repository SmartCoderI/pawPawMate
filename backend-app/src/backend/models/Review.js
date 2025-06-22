const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  tags: [String], // e.g. ["low cost", "clean", "gentle vet"]
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
