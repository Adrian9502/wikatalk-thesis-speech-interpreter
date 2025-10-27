const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
require("dotenv").config();

// ? to run this script: node backend/scripts/createAdmin.js

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log("Creating admin with:");
    console.log("Email:", adminEmail);
    console.log("Password length:", adminPassword ? adminPassword.length : 0);
    console.log("Password:", adminPassword); // Debug: see full password

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists");
      console.log("Existing admin role:", existingAdmin.role);

      // Optional: Update password if needed
      console.log("\nDo you want to update the password? (This will hash the new password)");
      // For now, just exit
      process.exit(0);
    }

    // Validate password
    if (!adminPassword || adminPassword.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      process.exit(1);
    }

    // Hash password - The User model will automatically hash it in pre-save hook
    // So we DON'T need to manually hash here

    // Create admin user
    const admin = await User.create({
      fullName: "System Administrator",
      username: "admin",
      email: adminEmail,
      password: adminPassword, // Let the model hash it
      role: "superadmin",
      isAdmin: true,
      isVerified: true,
      authProvider: "manual",
    });

    console.log("\n✅ Admin created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();