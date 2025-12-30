const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// MongoDB connection URL from environment variables
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ProjectManagementTool';

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}, 'name email role');

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users in the database:');
      console.log('----------------------');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}
listUsers();
