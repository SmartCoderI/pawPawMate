
//Endpoint for lost pets

const express = require('express');
const router = express.Router();
const lostPetController = require('../controllers/lostPetController');
const verifyToken = require('../middleware/auth');

// Report a lost pet
router.post('/report', verifyToken, lostPetController.reportLostPet);

// Get all lost pet reports (optional filter by area)
router.get('/', lostPetController.getAllReports);

// Mark a pet as found
router.patch('/:id/resolve', verifyToken, lostPetController.resolvePet);

module.exports = router;

