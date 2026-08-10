import mongoose from "mongoose";

import { getEnv } from "@/lib/env";

const globalForMongoose = globalThis;

if (!globalForMongoose._mongooseConnection) {
  globalForMongoose._mongooseConnection = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (typeof window !== "undefined") {
    throw new Error("connectDB() must only be called on the server.");
  }

  const cached = globalForMongoose._mongooseConnection;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const { MONGODB_URI } = getEnv();

    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
