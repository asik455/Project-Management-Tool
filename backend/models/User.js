const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// List of authorized manager emails
const AUTHORIZED_MANAGER_EMAILS = [
  'manager@projecthub.com',
  'admin@projecthub.com'
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['member', 'manager', 'admin'],
    default: 'member'
  },
  teamCode: { type: String },
  teamName: { type: String },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  isTeamMember: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Static method to check if an email is authorized for manager role
userSchema.statics.isAuthorizedManager = function(email) {
  return AUTHORIZED_MANAGER_EMAILS.includes(email.toLowerCase());
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 