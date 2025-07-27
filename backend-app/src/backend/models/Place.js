const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["dog park", "vet", "pet store", "shelter"], required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  tags: [String], // e.g. ["has pool", "quiet", "fire hydrant"]
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  creationSource: { 
    type: String, 
    enum: ["user_created", "review_auto_created", "osm_imported"], 
    default: "user_created" 
  },
  createdAt: { type: Date, default: Date.now },
  // Additional OSM fields
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  website: { type: String, default: "" },
  opening_hours: { type: String, default: "" },
  description: { type: String, default: "" },
});

module.exports = mongoose.model("Place", placeSchema);
