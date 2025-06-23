const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["dog park", "vet", "pet store", "other"], required: true }, //to be updated
  coordinates: {
    lat: Number,
    lng: Number,
  },
  tags: [String], // e.g. ["has pool", "quiet", "fire hydrant"]
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Place", placeSchema);
