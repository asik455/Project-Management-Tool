const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Asik:asik1087@cluster0.bighr.mongodb.net/projecthub?retryWrites=true&w=majority&tls=true';

async function updatePassword(userId, newPassword) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findById(userId);
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  console.log('Password updated successfully!');
  process.exit(0);
}

// Update password for the user with this ObjectId
updatePassword('682421af9b00689c94d35829', 'asik1087'); 