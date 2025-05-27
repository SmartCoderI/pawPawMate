


const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const verifyToken = require('../middleware/auth');

// Add a new pet-friendly location
router.post('/add', verifyToken, resourceController.createResource);

// Get all resources, optionally filtered
router.get('/', resourceController.getResources);

// Rate or review a location
router.post('/:id/review', verifyToken, resourceController.addReview);

module.exports = router;

