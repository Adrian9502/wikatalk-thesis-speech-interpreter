import React from "react";
import { BUTTON_GRADIENTS, COLORS } from "../constants/colors";
import { FaApple, FaAndroid } from "react-icons/fa6";

const Download: React.FC = () => {
  const downloadLinks = [
    {
      platform: "Android",
      icon: FaAndroid,
      iconColor: "text-green-600",
      description: "Direct APK download",
      url: "https://github.com/Adrian9502/wikatalk-thesis-speech-interpreter/releases/download/v1.3.0/wikatalk-v1.3.0.apk",
      available: true,
      buttonText: "Download for Android",
    },
    {
      platform: "iOS",
      icon: FaApple,
      iconColor: "text-black",
      description: "iOS version coming soon",
      url: "#",
      available: false,
      buttonText: "Coming Soon",
    },
  ];

  // Handle download click
  const handleDownload = (url: string, filename?: string) => {
    if (url === "#") return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "wikatalk-v1.3.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="download" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-5"
          style={{ background: COLORS.primary.yellow }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-5"
          style={{ background: COLORS.primary.red }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Download {"  "}
            <span style={{ color: COLORS.text.yellow }}>Wika</span>
            <span style={{ color: COLORS.text.primary }}>Talk</span>
          </h2>
          <p
            className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Start your Filipino languages learning journey today. Download
            WikaTalk for free and experience comprehensive speech-to-speech
            translation, gamified learning, and cultural immersion through
            innovative technology.
          </p>
        </div>

        {/* Download Section */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {downloadLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl border transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: COLORS.background.light,
                    borderColor: `${COLORS.primary.blue}40`,
                  }}
                >
                  {/* Platform Icon */}
                  <div className="w-20 h-20 rounded-2xl flex items-center bg-white justify-center text-4xl mb-6 mx-auto">
                    <IconComponent className={link.iconColor} size={40} />
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

                  {/* Download Button - FIXED VERSION */}
                  {link.available ? (
                    <button
                      onClick={() =>
                        handleDownload(
                          link.url,
                          `wikatalk-${link.platform.toLowerCase()}.apk`
                        )
                      }
                      className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                      style={{
                        background: BUTTON_GRADIENTS.redToBlue,
                        color: COLORS.text.primary,
                      }}
                    >
                      {link.buttonText}
                    </button>
                  ) : (
                    <button
                      className="inline-block px-8 py-4 rounded-full font-semibold text-lg cursor-not-allowed opacity-60"
                      style={{
                        background: `${COLORS.text.secondary}40`,
                        color: COLORS.text.secondary,
                      }}
                      disabled
                    >
                      {link.buttonText}
                    </button>
                  )}

                  {/* Status Badge */}
                  {!link.available && (
                    <div className="mt-4">
                      <span
                        className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${COLORS.text.yellow}20`,
                          color: COLORS.text.yellow,
                        }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div
            className="max-w-4xl mx-auto p-8 rounded-2xl border"
            style={{
              backgroundColor: COLORS.background.light,
              borderColor: `${COLORS.primary.blue}30`,
            }}
          >
            <h4
              className="text-lg md:text-xl font-bold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Start Your Journey in Learning Filipino Languages
            </h4>
            <p
              className="text-sm md:text-lg leading-relaxed mb-6"
              style={{ color: COLORS.text.secondary }}
            >
              WikaTalk is completely free to download and use. No subscription
              fees, no hidden charges. Start breaking language barriers and
              building cultural bridges today through innovative translation
              technology and gamified learning.
            </p>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              Available now on Android • iOS coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
