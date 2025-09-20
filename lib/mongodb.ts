// lib/mongodb.ts
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose connection function
export const connectMongoDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return mongoose.connections[0];
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB with Mongoose");
    return mongoose.connections[0];
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default clientPromise;
