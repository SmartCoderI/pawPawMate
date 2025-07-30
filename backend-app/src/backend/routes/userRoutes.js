/*
Defines HTTP endpoints related to users.
Routes incoming requests to the corresponding controller functions.
*/

const express = require("express");
const router = express.Router();
const {
  createUser,
  getUserById,
  getUserByFirebaseUid,
  updateUser,
  deleteUser,
  uploadUserPhoto,
  markWelcomeModalSeen,
} = require("../controllers/userController");
const { userImageUpload } = require("../utils/upload");

// Create a new user
router.post("/", createUser);

// Get user by Firebase UID
router.get("/firebase/:uid", getUserByFirebaseUid);

// Get user by ID
router.get("/:userId", getUserById);

// Update user by ID
router.put("/:userId", updateUser);

// Delete user by ID
router.delete("/:userId", deleteUser);

// Upload user profile photo
router.post("/upload-photo", userImageUpload, uploadUserPhoto);

// Route to mark the welcome modal as seen
router.put("/:userId/viewed-welcome-modal", markWelcomeModalSeen);

module.exports = router;
