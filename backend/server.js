const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const debugMiddleware = require("./middleware/debug.middleware");

require("dotenv").config();

const app = express();

// CORS should be first
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Then body parsers
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Debug middleware for development
app.use(debugMiddleware);

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB on startup:", err);
});

// Import routes
const userRoutes = require("./routes/user.routes");
const translationRoutes = require("./routes/translation.routes");
const themeRoutes = require("./routes/theme.routes");
const pronunciationRoutes = require("./routes/pronunciation.routes");
const quizRoutes = require("./routes/quiz.routes");
const rewardsRoutes = require("./routes/rewards.routes");
const userProgressRoutes = require("./routes/userProgress.routes");
const wordOfDayRoutes = require("./routes/wordOfDay.routes")
const rankingRoutes = require('./routes/ranking.routes');
const hintRoutes = require('./routes/hints.routes')
const tutorialRoutes = require("./routes/tutorial.routes");

// !Admin Specific route
const adminRoutes = require("./routes/admin.routes");

// Base route
app.get("/", (req, res) => {
  res.send("WikaTalk API is running");
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "WikaTalk API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      quiz: "/api/quiz",
      users: "/api/users",
      userProgress: "/api/userprogress",
    },
  });
});

// API routes 
app.use("/api/users", userRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/users/theme", themeRoutes);
app.use("/api/pronunciations", pronunciationRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/userprogress", userProgressRoutes);
app.use("/api/word-of-day", wordOfDayRoutes);
app.use('/api/rankings', rankingRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/tutorial", tutorialRoutes);
// !Admin
app.use("/api/admin", adminRoutes);

// Explicitly listen on all network interfaces
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server available on local network at http://192.168.18.82:${PORT}`);
});

console.log('SMTP_USER:', process.env.GMAIL_USER);
console.log('SMTP_PASS:', process.env.GMAIL_APP_PASSWORD ? '***' : 'MISSING');


// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle undefined routes 
app.use("*", (req, res) => {
  console.log(`[NOT FOUND] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
