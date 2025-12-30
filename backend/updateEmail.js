const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Asik:asik1087@cluster0.bighr.mongodb.net/projecthub?retryWrites=true&w=majority&tls=true';

async function updateEmail(userId, newEmail) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findById(userId);
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  user.email = newEmail;
  await user.save();
  console.log('Email updated successfully!');
  process.exit(0);
}

// Replace with your user ID and new email
updateEmail('6825615b5c4718f2fc0042aa', 'kasik7868@gmail.com'); 