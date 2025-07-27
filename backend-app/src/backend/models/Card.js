const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  petImage: { type: String, required: true }, // URL to the pet image
  caption: { type: String, required: true },
  helpfulCount: { type: Number, default: 0 },
  earnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contributionType: { 
    type: String, 
    enum: [
      "first_review", 
      "community_approval", 
      "milestone_achievement",
      "milestone_3_reviews",
      "milestone_6_reviews", 
      "milestone_9_reviews",
      "milestone_12_reviews",
      "milestone_15_reviews",
      "popular_review"
    ], 
    required: true 
  },
  placeId: { type: String, required: true }, // Reference to the place
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Card", cardSchema);
