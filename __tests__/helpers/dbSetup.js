const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedChallenges = require('../../src/config/seedChallenges');

// WSL + NTFS is slow — give MongoMemoryServer time to start
jest.setTimeout(30000);

let mongoServer;

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await seedChallenges();
}

async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  // Re-seed challenges after clearing
  await seedChallenges();
}

async function closeDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectDB, clearDB, closeDB };
