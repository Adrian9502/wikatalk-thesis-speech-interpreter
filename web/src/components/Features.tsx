import React from "react";
import { COLORS, FEATURE_COLORS } from "../constants/colors";
import { IoGameController } from "react-icons/io5";
import { FaMicrophone, FaVolumeHigh } from "react-icons/fa6";
import { RiTranslate2 } from "react-icons/ri";
import { FaCamera } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";

const Features: React.FC = () => {
  const features = [
    {
      icon: FaMicrophone,
      title: "Voice Translation",
      description:
        "Speak naturally and get instant translations across Filipino dialects. Your words are captured, converted, and played back in the chosen language.",
      gradient: FEATURE_COLORS.speech.gradient,
      details: [
        "Translate spoken words in real-time",
        "Accurate speech-to-text conversion",
        "Playback translations for clarity",
      ],
    },
    {
      icon: RiTranslate2,
      title: "Text Translation",
      description:
        "Translate written text quickly across multiple Filipino dialects, with results that maintain context and meaning.",
      gradient: FEATURE_COLORS.translate.gradient,
      details: [
        "Supports over 10 dialects",
        "Context-aware translation",
        "View and manage translation history",
      ],
    },
    {
      icon: FaCamera,
      title: "Camera Translation",
      description:
        "Use your camera to scan and translate text from signs, menus, or documents instantly.",
      gradient: FEATURE_COLORS.scan.gradient,
      details: [
        "Optical character recognition (OCR)",
        "Convert images into text",
        "Immediate translation output",
      ],
    },
    {
      icon: IoGameController,
      title: "Interactive Learning",
      description:
        "Improve your language skills with games, quizzes, and challenges that make learning fun and rewarding.",
      gradient: FEATURE_COLORS.games.gradient,
      details: [
        "Multiple game modes: Multiple Choice, Fill in the Blank, Identification",
        "Track level progression and difficulty",
        "Earn coins, hints, and daily rewards",
      ],
    },
    {
      icon: FaVolumeHigh,
      title: "Pronunciation Practice",
      description:
        "Hear and practice correct pronunciation with instant feedback to improve your speaking skills.",
      gradient: FEATURE_COLORS.pronounce.gradient,
      details: [
        "Listen to correct pronunciation via speech playback",
        "Compare your pronunciation with examples",
        "Practice speaking along with audio prompts",
      ],
    },
    {
      icon: GiProgression,
      title: "Learning Progress",
      description:
        "Monitor your performance and progress in games and challenges with detailed statistics and insights.",
      gradient: FEATURE_COLORS.progress.gradient,
      details: [
        "Track overall progress and completion rates in each game mode",
        "See detailed performance by difficulty level",
        "Track your ranking and view total time spent learning",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primary.blue} 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Powerful Features for
            <span
              className="block bg-gradient-to-r bg-clip-text text-transparent leading-tight pb-1"
              style={{
                backgroundImage: `linear-gradient(
                  90deg, 
                  ${COLORS.primary.blue}, 
                  ${COLORS.primary.red} , 
                  ${COLORS.primary.yellow} , 
                  ${COLORS.primary.white} 
                )`,
              }}
            >
              Language Learning
            </span>
          </h2>
          <p
            className="text-md md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Discover a comprehensive suite of tools designed to make learning
            Filipino language engaging, effective, and enjoyable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  backgroundColor: COLORS.background.light,
                  borderColor: `${COLORS.primary.blue}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${COLORS.primary.blue}30`;
                }}
              >
                {/* Background Gradient */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: feature.gradient }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Title - Side by side on small devices, stacked on larger */}
                  <div className="flex items-center gap-4 mb-4 sm:flex-col sm:items-start md:flex-row md:items-center">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: feature.gradient }}
                    >
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg md:text-xl font-bold"
                      style={{ color: COLORS.text.primary }}
                    >
                      {feature.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm sm:text-md mb-4 leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {feature.description}
                  </p>

                  {/* Feature Details */}
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mr-3"
                          style={{ backgroundColor: COLORS.text.yellow }}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
