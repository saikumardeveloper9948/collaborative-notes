const User = require('../models/User');

// Get all users (for @mention autocomplete)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers
}; 