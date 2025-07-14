const express = require('express');
const router = express.Router();
const { 
  getCandidateNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  toggleHighlight 
} = require('../controllers/noteController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get notes for a candidate
router.get('/candidate/:candidateId', getCandidateNotes);

// Create note
router.post('/', createNote);

// Update note
router.put('/:noteId', updateNote);

// Delete note
router.delete('/:noteId', deleteNote);

// Toggle note highlight
router.patch('/:noteId/highlight', toggleHighlight);

module.exports = router; 