const mongoose = require("mongoose");

const uri = "mongodb+srv://admin:12345@vi-try.0cq8h.mongodb.net/vi-try?retryWrites=true&w=majority"; // Including dbName in the URI

let isConnected = false; // Track connection status

const connectToMongoDB = async () => {
  if (isConnected) {
    return mongoose.connection.db;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB via Mongoose");

    return mongoose.connection.db; // Return the connection instance
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

// Function to check connection status
const checkMongoDBConnection = async () => {
  try {
    await connectToMongoDB();
  } catch (error) {
    throw error;
  }
};

module.exports = { checkMongoDBConnection };
