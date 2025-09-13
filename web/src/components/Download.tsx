import React from "react";
import { COLORS } from "../constants/colors";

const Download: React.FC = () => {
  const downloadLinks = [
    {
      platform: "Android",
      icon: "📱",
      description: "Download from Google Play Store",
      url: "#", // Replace with actual Google Play Store link
      badge:
        "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
    },
    {
      platform: "iOS",
      icon: "📱",
      description: "Download from Apple App Store",
      url: "#", // Replace with actual App Store link
      badge:
        "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
    },
  ];

  const systemRequirements = [
    {
      platform: "Android",
      requirements: [
        "Android 8.0 or later",
        "2GB RAM minimum",
        "500MB storage space",
        "Camera access for scanning",
        "Microphone access for speech",
      ],
    },
    {
      platform: "iOS",
      requirements: [
        "iOS 12.0 or later",
        "iPhone 6s or newer",
        "500MB storage space",
        "Camera access for scanning",
        "Microphone access for speech",
      ],
    },
  ];

  return (
    <section id="download" className="py-20 relative">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.primary} 50%, ${COLORS.background.light} 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Download
            <span
              className="bg-gradient-to-r bg-clip-text text-transparent ml-3"
              style={{
                backgroundImage: `linear-gradient(45deg, ${COLORS.text.accent}, ${COLORS.primary.blue})`,
              }}
            >
              WikaTalk
            </span>
          </h2>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Start your Filipino dialect learning journey today. Download
            WikaTalk for free and join thousands of users already exploring
            Philippine languages.
          </p>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {downloadLinks.map((link, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: COLORS.background.light,
                borderColor: `${COLORS.primary.blue}40`,
              }}
            >
              {/* Platform Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto"
                style={{ background: COLORS.gradients.secondary }}
              >
                {link.icon}
              </div>

              {/* Platform Info */}
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                {link.platform}
              </h3>
              <p className="mb-6" style={{ color: COLORS.text.secondary }}>
                {link.description}
              </p>

              {/* Download Button */}
              <a
                href={link.url}
                className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: COLORS.gradients.primary,
                  color: COLORS.text.primary,
                  textDecoration: "none",
                }}
              >
                Download for {link.platform}
              </a>

              {/* Coming Soon Badge (if needed) */}
              <div className="mt-4">
                <span
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${COLORS.text.accent}20`,
                    color: COLORS.text.accent,
                  }}
                >
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* System Requirements */}
        <div
          className="bg-opacity-50 rounded-2xl p-8"
          style={{ backgroundColor: COLORS.background.light }}
        >
          <h3
            className="text-2xl font-bold text-center mb-8"
            style={{ color: COLORS.text.primary }}
          >
            System Requirements
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {systemRequirements.map((system, index) => (
              <div key={index}>
                <h4
                  className="text-lg font-bold mb-4 flex items-center"
                  style={{ color: COLORS.text.accent }}
                >
                  <span className="mr-2">
                    {system.platform === "Android" ? "🤖" : "🍎"}
                  </span>
                  {system.platform}
                </h4>
                <ul className="space-y-2">
                  {system.requirements.map((req, reqIndex) => (
                    <li
                      key={reqIndex}
                      className="flex items-center"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mr-3"
                        style={{ backgroundColor: COLORS.primary.blue }}
                      />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-lg mb-4" style={{ color: COLORS.text.secondary }}>
            🎉 WikaTalk is completely free to download and use!
          </p>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            No subscription fees, no hidden charges. Start learning Filipino
            dialects today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Download;
