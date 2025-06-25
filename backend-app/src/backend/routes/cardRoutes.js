/*
Defines HTTP endpoints related to memory cards.
Cards are generated from visits to places and pet activity.
*/

const express = require("express");
const cardRouter = express.Router();
const { createCard, getCards, getCardsByUser, getCardById } = require("../controllers/cardController");
const verifyToken = require("../middleware/auth");

// Create a new card
cardRouter.post("/", createCard); //dev only
// cardRouter.post("/", verifyToken, createCard);

// Get all cards
cardRouter.get("/", getCards); //dev only
// cardRouter.get("/", verifyToken, getCards);

// Get cards by user ID
cardRouter.get("/user/:userId", getCardsByUser); //dev only
// cardRouter.get("/user/:userId", verifyToken, getCardsByUser);

// Get a card by ID
cardRouter.get("/:id", getCardById); //dev only
// cardRouter.get("/:id", verifyToken, getCardById);

module.exports = cardRouter;
