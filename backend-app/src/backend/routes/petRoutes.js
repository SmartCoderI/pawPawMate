import express from 'express';
import { registerPet, findNearbyPets } from '../controllers/petController.js';


/*
defines HTTP endpoints related to pets and their memory pages.
Route incoming requests to the corresponding controller functions.
 */

const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const verifyToken = require('../middleware/auth');
const upload = require('../utils/upload');

// Memory generation via AI (authenticated)
//calls Gemini to generate a story from notes and photos
router.post('/generate-memory', verifyToken, petController.generateMemoryStory);

// Upload pet photo (authenticated)
//upload a photo to AWS S3 using multer and returns a URL
router.post('/upload-photo', verifyToken, upload.single('photo'), petController.uploadPhoto);

// Create a memory page entry
//stores the memory record in MongoDB
router.post('/create', verifyToken, petController.createMemory);

// Get all memory pages for a user
// get all stored memory pages for the current user
router.get('/memories', verifyToken, petController.getUserMemories);

module.exports = router;

