const express = require('express');
const router = express.Router();
const { 
  getAllCandidates, 
  getCandidate, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate 
} = require('../controllers/candidateController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all candidates
router.get('/', getAllCandidates);

// Get single candidate
router.get('/:id', getCandidate);

// Create candidate
router.post('/', createCandidate);

// Update candidate
router.put('/:id', updateCandidate);

// Delete candidate
router.delete('/:id', deleteCandidate);

module.exports = router; 