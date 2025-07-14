const Candidate = require('../models/Candidate');

// Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { candidates }
    });
  } catch (error) {
    console.error('Get all candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single candidate
const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.userId 
    });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    res.json({
      success: true,
      data: { candidate }
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create candidate
const createCandidate = async (req, res) => {
  try {
    const { name, email, phone, position, status = 'active', notes } = req.body;
    
    const candidate = new Candidate({
      name,
      email,
      phone,
      position,
      status,
      notes: notes || '',
      createdBy: req.user.userId
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update candidate
const updateCandidate = async (req, res) => {
  try {
    const { name, email, phone, position, status, notes } = req.body;
    
    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { name, email, phone, position, status, notes },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.userId 
    });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate
}; 