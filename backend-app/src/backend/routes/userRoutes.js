/*
Defines HTTP endpoints related to users.
Routes incoming requests to the corresponding controller functions.
*/

const express = require("express");
const router = express.Router();
const { createUser, getUserById, getUserByFirebaseUid, updateUser, deleteUser, uploadUserPhoto } = require("../controllers/userController");
const { userImageUpload } = require("../utils/upload");

// Create a new user
router.post("/", createUser);

// Get user by Firebase UID
router.get("/firebase/:uid", getUserByFirebaseUid);

// Get user by ID
router.get("/:id", getUserById);

// Update user by ID
router.put("/:id", updateUser);

// Delete user by ID
router.delete("/:id", deleteUser);

// Upload user profile photo
router.post("/upload-photo", userImageUpload, uploadUserPhoto);

module.exports = router;