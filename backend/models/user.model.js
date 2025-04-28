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
      enum: ["local", "google"],
      default: "local",
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

    // Verification fields (keep these for email verification)
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
      default: "Default Navy", // Default theme name
    },
  },
  { timestamps: true }
);

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
