const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["manual", "google", "both"],
      default: "manual",
    },
    // ! Admin role field
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Password reset fields
    resetPasswordCode: {
      type: String,
      length: 6,
    },
    resetPasswordCodeExpires: {
      type: Date,
    },
    passwordLastChangedAt: {
      type: Date,
      default: Date.now,
    },
    // Verification fields
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationCode: {
      type: String,
      length: 6,
    },
    verificationCodeExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Store theme
    theme: {
      type: String,
      default: "Default Navy",
    },
    deletionCode: {
      type: String,
      length: 6,
    },
    deletionCodeExpires: {
      type: Date,
    },
    lastDeletionRequestedAt: {
      type: Date,
      default: null,
    },
    // User coins
    coins: {
      type: Number,
      default: 0,
    },
    // Hint usage tracking
    hintUsage: {
      daily: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
    // NEW: App tutorial tracking
    appTutorial: {
      home: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
      speech: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
      translate: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
      scan: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
      games: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
      pronounce: {
        hasSeen: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        completedAt: { type: Date, default: null },
      },
    },
  },
  { timestamps: true }
);

// Add method to mark tutorial as seen
userSchema.methods.markTutorialAsSeen = function (tutorialName, version = 1) {
  if (!this.appTutorial) {
    this.appTutorial = {};
  }

  if (!this.appTutorial[tutorialName]) {
    this.appTutorial[tutorialName] = {};
  }

  this.appTutorial[tutorialName].hasSeen = true;
  this.appTutorial[tutorialName].version = version;
  this.appTutorial[tutorialName].completedAt = new Date();

  return this.save();
};

// Add method to check if tutorial needs to be shown
userSchema.methods.shouldShowTutorial = function (tutorialName, currentVersion = 1) {
  if (!this.appTutorial || !this.appTutorial[tutorialName]) {
    return true; // Show tutorial if not tracked yet
  }

  const tutorial = this.appTutorial[tutorialName];

  // Show if user hasn't seen it or if version is newer
  return !tutorial.hasSeen || tutorial.version < currentVersion;
};

// Add method to get tutorial status
userSchema.methods.getTutorialStatus = function () {
  const tutorialNames = ['home', 'speech', 'translate', 'scan', 'games', 'pronounce'];
  const status = {};

  tutorialNames.forEach(name => {
    if (this.appTutorial && this.appTutorial[name]) {
      status[name] = {
        hasSeen: this.appTutorial[name].hasSeen,
        version: this.appTutorial[name].version,
        completedAt: this.appTutorial[name].completedAt,
      };
    } else {
      status[name] = {
        hasSeen: false,
        version: 1,
        completedAt: null,
      };
    }
  });

  return status;
};

// Add method to generate verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Add method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  return token;
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
