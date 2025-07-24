const mongoose = require("mongoose");

const lostPetSchema = new mongoose.Schema({
  // Basic pet information
  petName: { type: String, required: true },
  species: { 
    type: String, 
    enum: ["dog", "cat", "other"], 
    required: true 
  },
  breed: { type: String, default: "" },
  color: { type: String, required: true },
  size: { 
    type: String, 
    enum: ["small", "medium", "large"], 
    required: true 
  },
  features: { type: String, default: "" }, // Distinguishing features
  
  // Status and location
  status: { 
    type: String, 
    enum: ["missing", "seen", "found"], 
    default: "missing",
    required: true 
  },
  lastSeenLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: "" }
  },
  lastSeenTime: { type: Date, required: true },
  
  // Contact information (for the owner who reported missing)
  ownerContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  
  // Optional information
  microchip: { type: String, default: "" },
  collar: { type: String, default: "" },
  favoritePlaces: [{ type: String }], // Places the pet might go
  reward: { type: String, default: "" },
  
  // Photos
  photos: [{ type: String }], // Array of photo URLs
  
  // Reporter information (who originally reported this)
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Sighting reports from community members
  sightings: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" }
    },
    sightingTime: { type: Date, required: true },
    description: { type: String, default: "" },
    photos: [{ type: String }],
    reportedAt: { type: Date, default: Date.now }
  }],
  
  // Reunion information (when found)
  reunionInfo: {
    foundAt: { type: Date },
    foundLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, default: "" }
    },
    reunionNote: { type: String, default: "" },
    reunionPhoto: { type: String, default: "" }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
lostPetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for geospatial queries
lostPetSchema.index({ "lastSeenLocation.lat": 1, "lastSeenLocation.lng": 1 });
lostPetSchema.index({ status: 1 });
lostPetSchema.index({ species: 1 });
lostPetSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LostPet", lostPetSchema); 