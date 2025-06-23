/*
Defines HTTP endpoints related to users.
Routes incoming requests to the corresponding controller functions.
*/

const express = require("express");
const router = express.Router();
const { createUser, getUserById, updateUser, deleteUser } = require("../controllers/userController");

// Create a new user
router.post("/", createUser);

// Get user by ID
router.get("/:id", getUserById);

// Update user by ID
router.put("/:id", updateUser);

// Delete user by ID
router.delete("/:id", deleteUser);

module.exports = router;
