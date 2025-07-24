/*
Defines HTTP endpoints related to reviews of places.
Handles posting and retrieving reviews.
*/

const express = require("express");
const reviewRouter = express.Router();
const {
  addReview,
  getReviewsForPlace,
  getReviewsByUser,
  getDogParkReviewStats,
  getVetClinicReviewStats,
  getPetStoreReviewStats,
  getAnimalShelterReviewStats,
  uploadReviewImages,
  deleteReview,
  likeReview,
  getReviewLikeStatus,
} = require("../controllers/reviewController");
const { reviewImageUpload } = require("../utils/upload");
const verifyToken = require("../middleware/auth");

// Upload review images (must be before /:placeId routes to avoid conflict)
reviewRouter.post(
  "/upload-images",
  (req, res, next) => {
    console.log("Upload images route hit");
    reviewImageUpload(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size too large. Maximum 5MB per image." });
        } else if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({ error: "Too many files. Maximum 5 images allowed." });
        } else if (err.message && err.message.includes("Only JPEG, PNG, GIF, and WebP")) {
          return res.status(400).json({ error: err.message });
        } else {
          return res.status(500).json({
            error: "Upload failed",
            details: err.message,
            code: err.code,
          });
        }
      }
      next();
    });
  },
  uploadReviewImages
);

// Add a new review to a place (no authentication required - frontend handles login check)
reviewRouter.post("/", addReview);

// Get all reviews for a place
reviewRouter.get("/:placeId", getReviewsForPlace);

// Get all reviews by a specific user
reviewRouter.get("/user/:userId", getReviewsByUser);

// Delete a review by ID (only by author)
reviewRouter.delete("/:reviewId", deleteReview);

// Get dog park specific review statistics
reviewRouter.get("/:placeId/dog-park-stats", getDogParkReviewStats);

// Get vet clinic specific review statistics
reviewRouter.get("/:placeId/vet-clinic-stats", getVetClinicReviewStats);

// Get pet store specific review statistics
reviewRouter.get("/:placeId/pet-store-stats", getPetStoreReviewStats);

// Get animal shelter specific review statistics
reviewRouter.get("/:placeId/animal-shelter-stats", getAnimalShelterReviewStats);

// Like or unlike a review
reviewRouter.post("/:reviewId/like", likeReview);

// Get like status for a review by a specific user
reviewRouter.get("/:reviewId/like-status", getReviewLikeStatus);

module.exports = reviewRouter;
