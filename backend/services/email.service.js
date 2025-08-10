const nodemailer = require("nodemailer");
const { emailTemplates } = require("./email.template.js");
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
    });

    // Log the connection attempt
    console.log("Attempting Gmail connection with:", {
      user: process.env.GMAIL_USER,
      host: "smtp.gmail.com",
    });

    await transporter.verify();
    console.log("Gmail connection verified successfully");
    return transporter;
  } catch (error) {
    console.error("Detailed Gmail configuration error:", error);
    throw error;
  }
};

const initializeTransporter = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const transporter = await createTransporter();
      return transporter;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

let transporter;
// Initialize transporter with retries
(async () => {
  try {
    transporter = await initializeTransporter();
  } catch (error) {
    console.error("Failed to initialize mail transporter:", error);
  }
})();

const sendVerificationEmail = async (user) => {
  try {
    console.log("Attempting to send VERIFICATION EMAIL to:", user.email);

    const { subject, html } = emailTemplates.verification(
      user.fullName,
      user.verificationCode
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Email sent successfully:", info);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (user) => {
  try {
    console.log("Attempting to send PASSWORD RESET EMAIL to:", user.email);

    const { subject, html } = emailTemplates.passwordReset(
      user.fullName,
      user.resetCode
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

const sendPasswordChangedEmail = async (user) => {
  try {
    const passwordChangedAt = user.passwordLastChangedAt || new Date();

    // Set the correct time zone for Philippines (UTC+8)
    const timeZone = "Asia/Manila";

    // Format the date with Philippines time zone
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(passwordChangedAt);

    // Format time with Philippines time zone
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    }).format(passwordChangedAt);

    console.log("Attempting to send PASSWORD CHANGED EMAIL to:", user.email);

    const { subject, html } = emailTemplates.passwordChanged(
      user.fullName,
      formattedDate,
      formattedTime
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    console.log("Sending welcome email to:", user.email);

    const { subject, html } = emailTemplates.welcome(user.fullName);

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", info);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    // Don't throw error for welcome email - non-critical
    return false;
  }
};

const sendAccountDeletionEmail = async (user) => {
  try {
    console.log("Attempting to send ACCOUNT DELETION EMAIL to:", user.email);
    const { subject, html } = emailTemplates.accountDeletion(
      user.fullName,
      user.deletionCode
    );
    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Account Deletion Email send successfully:", user.email);
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);

    throw error;
  }
};

const sendAccountDeletionConfirmationEmail = async (userData) => {
  try {
    console.log("Sending account deletion confirmation email to:", userData.email);

    // Set the correct time zone for Philippines (UTC+8)
    const now = new Date();
    const timeZone = "Asia/Manila";

    // Format the date with Philippines time zone
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(now);

    // Format time with Philippines time zone
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    }).format(now);

    const { subject, html } = emailTemplates.accountDeletionConfirmation(
      userData.fullName,
      formattedDate,
      formattedTime
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: userData.email,
      subject,
      html,
    });

    console.log("Account deletion confirmation email sent successfully to:", userData.email);
    return true;
  } catch (error) {
    console.error("Failed to send account deletion confirmation email:", error);
    return false;
  }
};

// Add to exports
module.exports = {
  sendVerificationEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
  sendAccountDeletionConfirmationEmail,
};
