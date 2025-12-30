const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Asik:asik1087@cluster0.bighr.mongodb.net/projecthub?retryWrites=true&w=majority&tls=true';

async function deleteUser(email) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await User.deleteMany({ email });
  console.log(`Deleted ${result.deletedCount} user(s) with email ${email}`);
  process.exit(0);
}

deleteUser('kasik7868@gmail.com'); 