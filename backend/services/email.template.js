const emailTemplates = {
  verification: (name, verificationCode) => ({
    subject: "Verify Your Email",
    html: `
   <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <title>Verify Your Email</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Arial", sans-serif;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <!-- Main Email Container -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            class="email-container"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>

                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->

                <h2
                  style="
                    color: #fff;
                    font-size: 23px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Verify Your Email Address
                </h2>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 500;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  Hi <b>${name}</b>!
                </p>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  Welcome to WikaTalk! To complete your registration and ensure
                  the security of your account, please verify your email address
                  by entering the following verification code in the app:
                </p>

                <!-- Verification Code -->
                <div
                  style="
                    background-color: #ffffff;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <p
                    style="
                      font-size: 40px;
                      letter-spacing: 10px;
                      font-weight: bold;
                     color: #ff3d3d;
                      margin: 0;
                      font-family: monospace;
                    "
                  >
                    ${verificationCode}
                  </p>
                </div>

                <p style="color: #fff; font-size: 14px; margin: 20px 0">
                  This verification code will expire in 15 minutes. If you
                  didn't create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; margin: 20px auto 0"
          >
            <tr>
              <td style="text-align: center; padding: 0 20px">
                <p style="color: #999999; font-size: 12px; margin: 0">
                  This is an automated message, please do not reply to this
                  email.<br />
                  You're receiving this email because you recently created a new
                  WikaTalk account or added a new email address.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }),
  welcome: (name) => ({
    subject: "Welcome to WikaTalk!",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to WikaTalk</title>
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <style type="text/css">
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Arial", sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>

                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->
                <h2
                  style="
                    color: #fff;
                    font-size: 20px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Welcome to Your Language Journey
                </h2>
                <p
                  style="
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 500;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  Mabuhay, <b>${name}</b>!
                </p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 400;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  Thank you for joining WikaTalk! We're excited to help you
                  break down language barriers across the Philippines. Explore
                  translation tools and gamified learning across 10 Filipino
                  dialects:
                </p>

                <!-- Supported Dialects -->
                <p
                  style="
                    color: #ffdc04;
                    font-size: 14px;
                    font-weight: 500;
                    margin: 20px 0;
                    text-align: center;
                  "
                >
                  Tagalog • Cebuano • Hiligaynon • Ilocano • Bicol<br />
                  Waray • Pangasinan • Maguindanao • Kapampangan • Bisaya
                </p>

                <!-- Features List -->
                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  style="width: 100%; margin: 30px 0"
                >
                  <tr>
                    <td
                      style="
                        padding: 25px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                      "
                    >
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        style="width: 100%"
                      >
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    1
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    Speech-to-Speech Translation
                                  </h3>
                                  <p
                                    style="
                                      color: #333;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Instantly translate spoken words between
                                    Filipino languages with real-time
                                    pronunciation guides.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    2
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    Text Translation
                                  </h3>
                                  <p
                                    style="
                                      color: #222;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Translate written text between multiple
                                    Philippine languages.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    3
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    OCR Text Scanning
                                  </h3>
                                  <p
                                    style="
                                      color: #222;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Scan and translate text from images or
                                    documents instantly using your camera.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    4
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    Gamified Learning
                                  </h3>
                                  <p
                                    style="
                                      color: #222;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Learn through 3 exciting game modes:
                                    Multiple Choice, Identification, and Fill in
                                    the Blanks with 150 levels across Easy,
                                    Medium, and Hard difficulties.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    5
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    Virtual Coins & Rewards
                                  </h3>
                                  <p
                                    style="
                                      color: #222;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Earn virtual coins, compete on leaderboards,
                                    track your progress, and claim daily rewards
                                    for consistent learning.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: #1f51ff;
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    6
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: #ff3b30;
                                      margin: 0 0 8px;
                                      font-size: 18px;
                                      font-weight: 700;
                                    "
                                  >
                                    Translation History & Profile
                                  </h3>
                                  <p
                                    style="
                                      color: #222;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Access your recent translations anytime,
                                    customize themes, and manage your profile
                                    with Google Sign-In integration.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="color: #fff; font-size: 14px; margin: 20px 0">
                  Together, let's make communication easier across our beautiful
                  archipelago!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  For support or feedback, please contact our team. We're here
                  to help!
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; margin: 20px auto 0"
          >
            <tr>
              <td style="text-align: center; padding: 0 20px">
                <p style="color: #999999; font-size: 12px; margin: 0">
                  You're receiving this email because you've created a WikaTalk
                  account.<br />
                  Want to learn more about WikaTalk? Visit our website or
                  download our app.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }),
  passwordReset: (name, resetCode) => ({
    subject: "Password Reset Request",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <title>Password Reset Code - WikaTalk</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Poppins", sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>

                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->
                <h2
                  style="
                    color: #fff;
                    font-size: 23px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Password Reset
                </h2>

                <p style="color: #fff; font-size: 20px">Hi <b>${name}</b>,</p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  We received a request to reset your password. Use the
                  following code to complete the process:
                </p>

                <!-- Verification Code -->
                <div
                  style="
                    background-color: #ffffff;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <p
                    style="
                      font-size: 40px;
                      letter-spacing: 10px;
                      font-weight: bold;
                      color: #ff3d3d;
                      margin: 0;
                      font-family: monospace;
                    "
                  >
                    ${resetCode}
                  </p>
                </div>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  This code will expire in 30 minutes.
                </p>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  If you didn’t request a password reset, no action is required,
                  and you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }),
  passwordChanged: (name, formattedDate, formattedTime) => ({
    subject: "Password Changed Successfully",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <title>Your Password Has Been Successfully Changed</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Poppins", sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>

                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->

                <h2
                  style="
                    color: #fff;
                    font-size: 23px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Your Password Has Been Changed
                </h2>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: left;
                  "
                >
                  Hi ${name}, <br />
                  We wanted to let you know that your password was successfully
                  changed on
                  <span
                    style="color: #ffdc04; font-weight: 600; font-size: 18px"
                    >${formattedDate}, ${formattedTime}</span
                  >. If you made this change, no further action is needed.
                  However, if you did not request this password change, please
                  reset your password immediately and contact our support team.
                  <br /><br />
                  For your security, we recommend using a strong and unique
                  password.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }),
  accountDeletion: (name, deletionCode) => ({
    subject: "Account Deletion Request",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <title>Account Deletion Confirmation - WikaTalk</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Poppins", sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>
                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->
                <h2
                  style="
                    color: #fff;
                    font-size: 23px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Account Deletion Request
                </h2>

                <p style="color: #fff; font-size: 20px">Hi <b>${name}</b>,</p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  We received a request to delete your WikaTalk account. To
                  confirm this action, please use the following verification
                  code:
                </p>

                <!-- Verification Code -->
                <div
                  style="
                    background-color: #fff;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <p
                    style="
                      font-size: 40px;
                      letter-spacing: 10px;
                      font-weight: bold;
                      color: #ff3d3d;
                      margin: 0;
                      font-family: monospace;
                    "
                  >
                    ${deletionCode}
                  </p>
                </div>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  This code will expire in 5 minutes.
                </p>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: center;
                  "
                >
                  Please note that this action is permanent and will remove all
                  your data from our system. If you didn't request to delete
                  your account, please ignore this email and secure your account
                  immediately.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

    `
  }),
  accountDeletionConfirmation: (name, formattedDate, formattedTime) => ({
    subject: "Account Deletion Successful",
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- POPPINS FONT-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <title>Account Deletion Confirmation - WikaTalk</title>
    <style type="text/css">
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: "Poppins", sans-serif;
        line-height: 1.5;
      }
      .social-icon {
        display: inline-block;
        margin: 0 8px;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #0a0f28;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  style="
                    background: transparent;
                    background-color: transparent;
                    width: 90px;
                    height: auto;
                    pointer-events: none;
                  "
                  src="https://res.cloudinary.com/dnhb0sy9z/image/upload/v1756455311/WikaTalk-logo_ko6c14.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #ffdc04;
                    margin: 0;
                    font-size: 30px;
                    font-weight: 700;
                    word-spacing: -15px;
                  "
                >
                  Wika<span
                    style="font-size: 30px; font-weight: 700; color: #fff"
                    >Talk</span
                  >
                </h1>
                <h2
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 500;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->
                <h2
                  style="
                    color: #fff;
                    font-size: 23px;
                    font-weight: 600;
                    margin: 10;
                  "
                >
                  Account Successfully Deleted
                </h2>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 10px 0 20px;
                    text-align: left;
                  "
                >
                  Hi ${name}, <br />
                  We're confirming that your WikaTalk account has been
                  successfully deleted on
                  <span
                    style="color: #ffdc04; font-weight: 600; font-size: 18px"
                    >${formattedDate}, ${formattedTime}</span
                  >.
                </p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 20px 0;
                    text-align: left;
                  "
                >
                  All your personal data and information have been permanently
                  removed from our systems as requested. We're sorry to see you
                  go, but we respect your decision.
                </p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 20px 0;
                    text-align: left;
                  "
                >
                  If you deleted your account by mistake or wish to use WikaTalk
                  again in the future, you'll need to create a new account.
                </p>

                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 300;
                    margin: 20px 0;
                    text-align: left;
                  "
                >
                  Thank you for being part of our community. We appreciate the
                  time you spent with us.
                </p>

                <div style="margin-top: 30px; text-align: center">
                  <p style="color: #ffffff; font-size: 16px; font-weight: 300">
                    Follow us on social media:
                  </p>
                  <div style="margin: 15px 0">
                    <a
                      target="_blank"
                      href="https://www.facebook.com/john.adrian.bonto"
                      class="social-icon"
                      style="text-decoration: none"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                        alt="Facebook"
                        width="32"
                        height="32"
                      />
                    </a>
                    <a
                      target="_blank"
                      href="https://github.com/Adrian9502"
                      class="social-icon"
                      style="text-decoration: none"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/733/733553.png"
                        alt="GitHub"
                        width="32"
                        height="32"
                      />
                    </a>
                    <a
                      target="_blank"
                      href="mailto:bontojohnadrian@gmail.com"
                      class="social-icon"
                      style="text-decoration: none"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/5968/5968534.png"
                        alt="Gmail"
                        width="32"
                        height="32"
                      />
                    </a>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
  }),
};

module.exports = { emailTemplates };


