const Card = require("../models/Card");
const Review = require("../models/Review");
const User = require("../models/User");
const Place = require("../models/Place");

// Generate a reward card for a user
const generateRewardCard = async (userId, reviewId, placeId, locationName, contributionType) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's pets (correct relationship)
    const Pet = require("../models/Pet");
    const userPets = await Pet.find({ owner: userId });

    // Get a random pet image from user's pets, or use a default
    let petImage = "/default-pet.png"; // fallback image
    if (userPets && userPets.length > 0) {
      const randomPet = userPets[Math.floor(Math.random() * userPets.length)];
      petImage = randomPet.profileImage || "/default-pet.png";
    }

    // Generate a fun caption based on contribution type and location
    const captions = {
      "first_review": [
        `${user.name}'s first adventure at ${locationName}! 🎉`,
        `Welcome to the community! First stop: ${locationName}`,
        `${user.name} discovered ${locationName} - what a great start!`
      ],
      "community_approval": [
        `The community loves ${user.name}'s review of ${locationName}! 👍`,
        `Popular opinion: ${user.name} knows good spots like ${locationName}`,
        `${user.name}'s ${locationName} review is community approved!`
      ],
      "milestone_achievement": [
        `${user.name} is becoming a ${locationName} expert! 🏆`,
        `Milestone reached! ${user.name} explored ${locationName}`,
        `${user.name} is on a roll - now featuring ${locationName}!`
      ]
    };

    const captionOptions = captions[contributionType] || captions["first_review"];
    const caption = captionOptions[Math.floor(Math.random() * captionOptions.length)];

    // Create the card
    const card = new Card({
      locationName,
      petImage,
      caption,
      helpfulCount: 0,
      earnedBy: userId,
      contributionType,
      placeId,
      reviewId,
    });

    await card.save();
    console.log(`✅ Generated reward card for user ${userId} at ${locationName}`);
    return card;
  } catch (error) {
    console.error("Error generating reward card:", error);
    throw error;
  }
};

// Get all cards for a specific user
const getUserCards = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching cards for user ID:", userId);
    
    // Ensure we're using the correct ObjectId format for the query
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const cards = await Card.find({ earnedBy: userObjectId })
      .populate('earnedBy', 'name profileImage')
      .populate('reviewId', 'rating comment createdAt')
      .sort({ createdAt: -1 });

    console.log(`Found ${cards.length} cards for user ${userId}`);
    res.json(cards);
  } catch (error) {
    console.error("Error fetching user cards:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};

// Get all cards (for leaderboard or exploration)
const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find()
      .populate('earnedBy', 'name profileImage')
      .populate('reviewId', 'rating comment createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(cards);
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};

// Update helpful count for a card
const updateHelpfulCount = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { increment } = req.body; // true to increment, false to decrement

    const updateValue = increment ? 1 : -1;
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $inc: { helpfulCount: updateValue } },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    console.error("Error updating helpful count:", error);
    res.status(500).json({ error: "Failed to update helpful count" });
  }
};

module.exports = {
  generateRewardCard,
  getUserCards,
  getAllCards,
  updateHelpfulCount,
};
