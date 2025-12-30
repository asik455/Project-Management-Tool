const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Asik:asik1087@cluster0.bighr.mongodb.net/projecthub?retryWrites=true&w=majority&tls=true';

async function printUser(email) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user);
  }
  process.exit(0);
}

printUser('kasik7868@gmail.com'); 