const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Asik:asik1087@cluster0.bighr.mongodb.net/projecthub?retryWrites=true&w=majority&tls=true';

async function testPassword(email, plainPassword) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  const isMatch = await bcrypt.compare(plainPassword, user.password);
  console.log('Password match:', isMatch);
  process.exit(0);
}

testPassword('kasik7868@gmail.com', 'asik1087'); 