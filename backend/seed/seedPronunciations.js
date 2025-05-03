const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Pronunciation = require("../models/pronunciation.model");

// Load environment variables at the very beginning
// This ensures environment variables are loaded before attempting DB connection
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  console.log("Please check your .env file in the backend directory");
  process.exit(1);
}

const seedPronunciations = async () => {
  try {
    // Connect to MongoDB directly instead of using connectDB
    console.log("Connecting to MongoDB...");
    console.log(`Using connection string: ${process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, "mongodb$1://**:**@")}`);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10,
      connectTimeoutMS: 60000,
    });

    console.log("Connected to MongoDB successfully");

    // Clear existing data
    console.log("Clearing existing pronunciation data...");
    await Pronunciation.deleteMany({});

    // Read the pronunciation data
    const filePath = path.join(__dirname, "pronunciation.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    console.log(`Found ${data.length} pronunciation entries to seed...`);

    // Insert data
    await Pronunciation.insertMany(data);

    console.log("✅ Pronunciation data seeded successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding pronunciation data:", error);
    process.exit(1);
  }
};

seedPronunciations();