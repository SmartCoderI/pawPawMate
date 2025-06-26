/*
Defines HTTP endpoints related to reviews of places.
Handles posting and retrieving reviews.
*/

const express = require("express");
const reviewRouter = express.Router();
const { addReview, getReviewsForPlace, getDogParkReviewStats } = require("../controllers/reviewController");
const verifyToken = require("../middleware/auth");

// Add a new review to a place (no authentication required - frontend handles login check)
reviewRouter.post("/", addReview);

// Get all reviews for a place
reviewRouter.get("/:placeId", getReviewsForPlace);

// Get dog park specific review statistics
reviewRouter.get("/:placeId/dog-park-stats", getDogParkReviewStats);

module.exports = reviewRouter;
