require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node promote.js <email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`Success! ${email} has been promoted to Admin.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

main();
