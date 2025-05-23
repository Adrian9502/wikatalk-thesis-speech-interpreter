const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB on startup:", err);
});

// Base route
app.get("/", (req, res) => {
  res.send("WikaTalk API is running");
});

// Import routes
const userRoutes = require("./routes/user.routes");
const translationRoutes = require("./routes/translation.routes");
const themeRoutes = require("./routes/theme.routes");
const pronunciationRoutes = require("./routes/pronunciation.routes");


app.use("/api/users", userRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/users/theme", themeRoutes);
app.use("/api/pronunciations", pronunciationRoutes);
// Test route
app.get("/api/users/test", (req, res) => {
  res.send("WikaTalk API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
