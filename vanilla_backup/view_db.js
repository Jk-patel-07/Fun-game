require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fun';

// Define schema matching server.js
const userSchema = new mongoose.Schema({
  name: String,
  mark: Number,
  feedback: String,
  time: Date
}, { collection: 'user', versionKey: false });

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    console.log(`Connecting to database at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { dbName: 'fun', serverSelectionTimeoutMS: 3000 });
    console.log('Connected successfully!\n');

    const users = await User.find().sort({ time: -1 });
    console.log(`Found ${users.length} record(s) in collection "user":`);
    console.log('='.repeat(50));

    if (users.length === 0) {
      console.log('(No records found yet. Submit some data from the website!)');
    } else {
      users.forEach((user, index) => {
        console.log(`[Record #${index + 1}]`);
        console.log(`Name:      ${user.name}`);
        console.log(`Mark:      ${user.mark !== undefined ? user.mark : 'N/A'}`);
        console.log(`Feedback:  ${user.feedback || '(No message)'}`);
        console.log(`Time:      ${user.time}`);
        console.log('-'.repeat(50));
      });
    }
  } catch (err) {
    console.error('\nError connecting to MongoDB:', err.message);
    console.log('\nMake sure MongoDB is running on your system first!');
  } finally {
    await mongoose.disconnect();
  }
}

main();
