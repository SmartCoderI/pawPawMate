/*
Defines HTTP endpoints related to pet-related places.
Handles creation, listing, and details of locations.
*/

const express = require("express");
const placeRouter = express.Router();
const { createPlace, getAllPlaces, getPlaceById } = require("../controllers/placeController");

// Create a new place
placeRouter.post("/", createPlace);

// Get all places with optional filters
placeRouter.get("/", getAllPlaces);

// Get a place by ID
placeRouter.get("/:id", getPlaceById);

module.exports = placeRouter;
