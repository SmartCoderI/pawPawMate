const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase/Cognito user id
  name: String,
  email: String,
  profileImage: String,
  joinedAt: { type: Date, default: Date.now },
  favoritePlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
  collectedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
  hasSeenWelcomeModal: { type: Boolean, default: false },

  lastLoginLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
});

module.exports = mongoose.model("User", userSchema);
