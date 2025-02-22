const nodemailer = require("nodemailer");
const { emailTemplates } = require("./email.template.js");
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
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
    console.log("Attempting to send verification email to:", user.email);

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
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${user.resetPasswordToken}`;
    const { subject, html } = emailTemplates.passwordReset(resetUrl);

    await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Email sending failed");
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

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
