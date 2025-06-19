/*
Defines HTTP endpoints related to reviews of places.
Handles posting and retrieving reviews.
*/

const express = require("express");
const reviewRouter = express.Router();
const { addReview, getReviewsForPlace } = require("../controllers/reviewController");
const verifyToken = require("../middleware/auth");

// Add a new review to a place
reviewRouter.post("/", verifyToken, addReview);

// Get all reviews for a place
reviewRouter.get("/:placeId", getReviewsForPlace);

module.exports = reviewRouter;
