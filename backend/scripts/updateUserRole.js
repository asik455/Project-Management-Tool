const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// MongoDB connection URL from environment variables
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ProjectManagementTool';

// User email to update
const USER_EMAIL = 'mohammedasik.a2023@gmail.com';

// New role (either 'admin' or 'manager')
const NEW_ROLE = 'manager';

async function updateUserRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { email: USER_EMAIL },
      { $set: { role: NEW_ROLE } },
      { new: true }
    );

    if (!updatedUser) {
      console.error('User not found with email:', USER_EMAIL);
      process.exit(1);
    }

    console.log('User role updated successfully:');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`New Role: ${updatedUser.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

// Run the function
updateUserRole();
