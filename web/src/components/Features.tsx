import React from "react";
import { COLORS, FEATURE_COLORS } from "../constants/colors";

const Features: React.FC = () => {
  const features = [
    {
      icon: "🗣️",
      title: "Speech Recognition",
      description:
        "Convert speech to text and translate between Filipino dialects in real-time with advanced AI technology.",
      gradient: FEATURE_COLORS.speech.gradient,
      details: [
        "Real-time voice translation",
        "Pronunciation assistance",
        "Voice recording & playback",
      ],
    },
    {
      icon: "🔤",
      title: "Text Translation",
      description:
        "Instant text translation between multiple Filipino dialects with context-aware accuracy.",
      gradient: FEATURE_COLORS.translate.gradient,
      details: [
        "Multi-dialect support",
        "Context-aware translation",
        "Translation history",
      ],
    },
    {
      icon: "📷",
      title: "Camera Scan",
      description:
        "Scan text from images and translate them instantly using advanced OCR technology.",
      gradient: FEATURE_COLORS.scan.gradient,
      details: [
        "OCR text recognition",
        "Image-to-text conversion",
        "Instant translation",
      ],
    },
    {
      icon: "🎮",
      title: "Gamified Learning",
      description:
        "Learn through interactive games, quizzes, and challenges with rewards and progress tracking.",
      gradient: FEATURE_COLORS.games.gradient,
      details: [
        "Interactive quizzes",
        "Level progression",
        "Daily rewards system",
      ],
    },
    {
      icon: "🎯",
      title: "Pronunciation Guide",
      description:
        "Perfect your pronunciation with AI-powered feedback and speech analysis.",
      gradient: FEATURE_COLORS.pronounce.gradient,
      details: ["Speech analysis", "Pronunciation scoring", "Audio feedback"],
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics and achievement systems.",
      gradient: COLORS.gradients.primary,
      details: [
        "Learning analytics",
        "Achievement badges",
        "Performance insights",
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
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Powerful Features for
            <span
              className="block bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(45deg, ${COLORS.text.yellow}, ${COLORS.primary.blue})`,
              }}
            >
              Language Learning
            </span>
          </h2>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Discover a comprehensive suite of tools designed to make learning
            Filipino dialects engaging, effective, and enjoyable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: feature.gradient }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: COLORS.text.primary }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-4 leading-relaxed"
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
