import React from "react";
import { COLORS, FEATURE_COLORS } from "../constants/colors";

const About: React.FC = () => {
  const stats = [
    { number: "28+", label: "Theme Colors", icon: "🎨" },
    { number: "5+", label: "Game Modes", icon: "🎮" },
    { number: "4+", label: "Filipino Dialects", icon: "🗣️" },
    { number: "100%", label: "Free to Use", icon: "💎" },
  ];

  const highlights = [
    {
      title: "Advanced AI Technology",
      description:
        "Powered by cutting-edge machine learning algorithms for accurate translation and speech recognition.",
      icon: "🤖",
      gradient: FEATURE_COLORS.translate.gradient,
    },
    {
      title: "Gamified Experience",
      description:
        "Learn through interactive quizzes, daily rewards, and competitive ranking systems.",
      icon: "🏆",
      gradient: FEATURE_COLORS.games.gradient,
    },
    {
      title: "Cultural Preservation",
      description:
        "Supporting the preservation and promotion of Filipino dialects and cultural heritage.",
      icon: "🏛️",
      gradient: FEATURE_COLORS.speech.gradient,
    },
    {
      title: "Accessibility First",
      description:
        "Designed to be inclusive and accessible for learners of all ages and skill levels.",
      icon: "♿",
      gradient: FEATURE_COLORS.pronounce.gradient,
    },
  ];

  return (
    <section id="about" className="py-20 relative">
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
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: COLORS.text.primary }}
          >
            About
            <span
              className="bg-gradient-to-r bg-clip-text text-transparent ml-3"
              style={{
                backgroundImage: `linear-gradient(45deg, ${COLORS.text.yellow}, ${COLORS.primary.blue})`,
              }}
            >
              WikaTalk
            </span>
          </h2>
          <p
            className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            WikaTalk is a comprehensive Filipino dialect interpreter designed to
            bridge communication gaps and promote cultural understanding through
            innovative technology and gamified learning experiences.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: COLORS.background.light,
                borderColor: `${COLORS.primary.blue}30`,
              }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: COLORS.text.yellow }}
              >
                {stat.number}
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: COLORS.text.secondary }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center mb-16">
          {/* Left Content */}
          <div>
            <h3
              className="text-2xl md:text-3xl font-bold mb-6"
              style={{ color: COLORS.text.primary }}
            >
              Bridging Filipino Communities Through Technology
            </h3>
            <div
              className="space-y-4 text-lg leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              <p>
                WikaTalk was created to address the communication challenges
                between different Filipino dialect speakers. Our mission is to
                preserve and promote the rich linguistic diversity of the
                Philippines while making it accessible to everyone.
              </p>
              <p>
                Through advanced AI technology, we provide real-time
                translation, speech recognition, and interactive learning
                experiences that make dialect learning engaging and effective.
              </p>
              <p>
                Whether you're a Filipino wanting to connect with your roots, a
                student learning about Philippine culture, or someone interested
                in linguistic diversity, WikaTalk is designed for you.
              </p>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="mt-12 lg:mt-0">
            <h4
              className="text-xl font-bold mb-6"
              style={{ color: COLORS.text.primary }}
            >
              What Makes WikaTalk Special
            </h4>
            <div className="space-y-4">
              {[
                "Real-time speech-to-text translation",
                "Camera-based text recognition and translation",
                "Interactive quiz games with rewards",
                "Daily challenges and progress tracking",
                "Comprehensive pronunciation guides",
                "User-friendly interface with 28 theme options",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.text.yellow }}
                  />
                  <span style={{ color: COLORS.text.secondary }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: COLORS.background.light,
                borderColor: `${COLORS.primary.blue}30`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: highlight.gradient }}
              >
                {highlight.icon}
              </div>
              <h4
                className="text-xl font-bold mb-3"
                style={{ color: COLORS.text.primary }}
              >
                {highlight.title}
              </h4>
              <p
                className="leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
