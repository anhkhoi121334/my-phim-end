import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hsdjuifsd';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();
  return { client, db };
}

// Thêm định nghĩa global
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
} 