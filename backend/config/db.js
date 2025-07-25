const mongoose = require("mongoose");

// Cache the database connection
let cachedConnection = null;

const connectDB = async () => {
  // If connection exists, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 60000, // Give more time for serverless cold starts
      socketTimeoutMS: 60000, // Close sockets after 45 seconds of inactivity
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10, // Maintain up to 10 socket connections
      connectTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    cachedConnection = connection;
    console.log("MongoDB connected successfully");

    // Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      // Don't exit process - attempt reconnection instead
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit process in serverless environment
    throw error;
  }
};

module.exports = connectDB;
