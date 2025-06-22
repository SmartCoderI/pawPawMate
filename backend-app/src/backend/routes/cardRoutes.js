/*
Defines HTTP endpoints related to memory cards.
Cards are generated from visits to places and pet activity.
*/

const express = require("express");
const cardRouter = express.Router();
const { createCard, getCards, getCardById } = require("../controllers/cardController");
const verifyToken = require("../middleware/auth");

// Create a new card
cardRouter.post("/", verifyToken, createCard);

// Get cards for the authenticated user or for a place
cardRouter.get("/", verifyToken, getCards);

// Get a card by ID
cardRouter.get("/:id", verifyToken, getCardById);

module.exports = cardRouter;
