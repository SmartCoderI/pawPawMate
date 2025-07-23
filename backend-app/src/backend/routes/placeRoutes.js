/*
Defines HTTP endpoints related to pet-related places.
Handles creation, listing, and details of locations.
*/

const express = require("express");
const placeRouter = express.Router();
const { createPlace, getAllPlaces, getPlaceById, deletePlace } = require("../controllers/placeController");
const verifyToken = require("../middleware/auth");

// Create a new place (no authentication required - frontend handles login check)
placeRouter.post("/", createPlace);

// Get all places with optional filters
placeRouter.get("/", getAllPlaces);

// Get a place by ID
placeRouter.get("/:id", getPlaceById);

// Delete a place by ID (only by creator)
placeRouter.delete("/:id", deletePlace);

module.exports = placeRouter;
