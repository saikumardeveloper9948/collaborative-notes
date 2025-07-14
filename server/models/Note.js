const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate ID is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
noteSchema.index({ candidateId: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ mentions: 1 });
noteSchema.index({ isHighlighted: 1 });

// Virtual for replies
noteSchema.virtual('replies', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'parentNote'
});

// Ensure virtuals are serialized
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema); 