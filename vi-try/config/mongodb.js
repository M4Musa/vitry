import mongoose from "mongoose";

const uri = "mongodb+srv://admin:12345@vi-try.0cq8h.mongodb.net/myDatabase";

export const connectMongoDB = async () => {
  try {
 
    await mongoose.connect(uri, {
      dbName: "myDatabase" 
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
