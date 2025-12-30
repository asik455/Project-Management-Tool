const mongoose = require('mongoose');
const crypto = require('crypto');

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  accessCode: { 
    type: String, 
    unique: true,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Generate unique team access code
teamSchema.statics.generateAccessCode = function() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Verify team access code
teamSchema.statics.verifyAccessCode = async function(accessCode) {
  const team = await this.findOne({ accessCode });
  return team ? team : null;
};

module.exports = mongoose.model('Team', teamSchema);
