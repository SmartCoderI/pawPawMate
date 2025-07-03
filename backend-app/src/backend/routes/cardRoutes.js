const express = require("express");
const router = express.Router();
const { getUserCards, getAllCards, updateHelpfulCount } = require("../controllers/cardController");

// Get all cards for a specific user (reward cards)
router.get("/user/:userId", getUserCards);

// Get all cards (for exploration/leaderboard)
router.get("/all", getAllCards);

// Update helpful count for a card
router.patch("/:cardId/helpful", updateHelpfulCount);

module.exports = router; 