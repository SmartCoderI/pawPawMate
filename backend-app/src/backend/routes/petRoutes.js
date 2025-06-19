/*
Defines HTTP endpoints related to pets.
Routes incoming requests to the corresponding controller functions.
*/

const express = require("express");
const petRouter = express.Router();
const {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
  uploadPetPhoto,
} = require("../controllers/petController");
const upload = require("../utils/upload");
const verifyToken = require("../middleware/auth");

// Create a new pet
petRouter.post("/", createPet); //dev only
// petRouter.post("/", verifyToken, createPet);

// Get all pets for the authenticated user
petRouter.get("/", getAllPets); //dev only
// petRouter.get("/", verifyToken, getAllPets);

// Get a specific pet by ID
petRouter.get("/:id", getPetById); //dev only
// petRouter.get("/:id", verifyToken, getPetById);

// Update a pet
petRouter.put("/:id", updatePet); //dev only
// petRouter.put("/:id", verifyToken, updatePet);

// Delete a pet
petRouter.delete("/:id", deletePet); //dev only
// petRouter.delete("/:id", verifyToken, deletePet);

// Upload photos
petRouter.post("/upload-photo", upload.single("photo"), uploadPetPhoto);

module.exports = petRouter;
