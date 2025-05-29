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
const quizRoutes = require("./routes/quiz.routes");

app.use("/api/users", userRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/users/theme", themeRoutes);
app.use("/api/pronunciations", pronunciationRoutes);
app.use("/api/quiz", quizRoutes);

// Explicitly listen on all network interfaces
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server available on local network at http://192.168.18.82:${PORT}`);
});

// Add a more robust debug endpoint
app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "WikaTalk API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      quiz: "/api/quiz",
      users: "/api/users",
    },
  });
});

// Add proper CORS handling for mobile apps
app.use(
  cors({
    origin: "*", // In production you'd restrict this
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Add a small delay before processing requests (can help mobile connections)
app.use((req, res, next) => {
  setTimeout(next, 0);
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

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
