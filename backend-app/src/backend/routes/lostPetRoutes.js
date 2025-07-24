const express = require("express");
const lostPetRouter = express.Router();
const {
  createLostPetReport,
  getAllLostPets,
  getLostPetById,
  addSightingReport,
  updateLostPetStatus,
  deleteLostPetReport,
  getLostPetStats
} = require("../controllers/lostPetController");
const verifyToken = require("../middleware/auth");

// Get all lost pets with optional filtering
// Query params: status, species, bounds, dateRange, limit
lostPetRouter.get("/", getAllLostPets);

// Get lost pets statistics
lostPetRouter.get("/stats", getLostPetStats);

// Get a specific lost pet by ID
lostPetRouter.get("/:id", getLostPetById);

// Create a new lost pet report
lostPetRouter.post("/", createLostPetReport);

// Add a sighting report to an existing lost pet
lostPetRouter.post("/:id/sightings", addSightingReport);

// Update lost pet status (mark as found, etc.)
lostPetRouter.put("/:id/status", updateLostPetStatus);

// Delete a lost pet report
lostPetRouter.delete("/:id", deleteLostPetReport);

module.exports = lostPetRouter; 