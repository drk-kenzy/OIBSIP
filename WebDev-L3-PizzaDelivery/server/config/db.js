const mongoose = require('mongoose');

async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
    uri = memoryServer.getUri();
    console.log('MONGODB_URI absent : instance MongoDB locale en memoire demarree pour le developpement.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connecte.');
}

module.exports = connectDB;
