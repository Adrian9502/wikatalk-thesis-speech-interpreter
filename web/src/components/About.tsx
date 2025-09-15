import React from "react";
import { COLORS, FEATURE_COLORS } from "../constants/colors";
import { IoGameController } from "react-icons/io5";
import { GrLanguage } from "react-icons/gr";
import { FaCheckCircle } from "react-icons/fa";
import {
  FaPlaneDeparture,
  FaGraduationCap,
  FaUsers,
  FaMicroscope,
  FaRobot,
} from "react-icons/fa6";

const About: React.FC = () => {
  const highlights = [
    {
      title: "Advanced NLP Technology",
      description:
        "Powered by natural language processing algorithms for real-time speech-to-speech interpretation with confidence scoring.",
      icon: FaRobot,
      gradient: FEATURE_COLORS.translate.gradient,
    },
    {
      title: "Gamified Learning Experience",
      description:
        "Interactive quizzes, daily challenges, level progression, and rewards system to make dialect learning engaging and fun.",
      icon: IoGameController,
      gradient: FEATURE_COLORS.games.gradient,
    },
    {
      title: "Cultural Bridge",
      description:
        "Promoting respect and inclusivity among Filipino dialect speakers while preserving linguistic diversity.",
      icon: GrLanguage,
      gradient: FEATURE_COLORS.speech.gradient,
    },
    {
      title: "ISO 25010 Compliant",
      description:
        "Built with international standards ensuring functionality, usability, reliability, maintainability, and security.",
      icon: FaCheckCircle,
      gradient: FEATURE_COLORS.white.gradient,
      iconColor: "text-emerald-600",
    },
  ];

  const beneficiaries = [
    {
      title: "Tourists",
      description:
        "Seamless communication with locals across different parts of the Philippines, ensuring worry-free travel experiences.",
      icon: FaPlaneDeparture,

      gradient: FEATURE_COLORS.games.gradient,
    },
    {
      title: "Learners",
      description:
        "Interactive platform for learning Filipino dialects through engaging games and vocabulary expansion.",
      icon: FaGraduationCap,
      gradient: FEATURE_COLORS.translate.gradient,
    },
    {
      title: "Community",
      description:
        "Breaking language barriers and promoting understanding between speakers of different Filipino dialects.",
      icon: FaUsers,
      gradient: FEATURE_COLORS.speech.gradient,
    },
    {
      title: "Researchers",
      description:
        "Advancing research in mobile translation technology and natural language processing for local languages.",
      icon: FaMicroscope,
      gradient: FEATURE_COLORS.games.gradient,
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
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
          >
            About {"  "}
            <span style={{ color: COLORS.text.yellow }}>Wika</span>
            <span style={{ color: COLORS.text.primary }}>Talk</span>
          </h2>
          <p
            className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            A comprehensive mobile application designed for smooth and efficient
            speech-to-speech interpretation of Filipino languages, serving as a
            communication tool that bridges language barriers and promotes
            cultural understanding through innovative technology and gamified
            learning experiences.
          </p>
        </div>

        {/* Research Objectives Section */}
        <div className="mb-16">
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: COLORS.text.primary }}
          >
            Research Objectives & Innovation
          </h3>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left Content - General Objective */}
            <div>
              <h4
                className="text-lg md:text-xl font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                Our Mission
              </h4>
              <p
                className="text-sm md:text-base leading-relaxed mb-6"
                style={{ color: COLORS.text.secondary }}
              >
                WikaTalk addresses communication challenges between different
                Filipino dialect speakers by providing real-time interpretation
                of the top 10 languages in the Philippines. Our goal is to
                enable efficient communication while allowing users to immerse
                themselves in Filipino culture through seamless language
                translation.
              </p>
            </div>

            {/* Right Content - Key Features */}
            <div>
              <h4
                className="text-lg md:text-xl font-bold mb-6"
                style={{ color: COLORS.text.primary }}
              >
                Core Features
              </h4>
              <div className="space-y-4">
                {[
                  "Real-time speech-to-speech translation",
                  "Camera-based OCR text translation",
                  "Multiple game modes: Multiple Choice, Fill in the Blank, Identification",
                  "Level progression with coins, hints, and rewards system",
                  "Daily challenges and pronunciation practice",
                  "10 Filipino languages support (Tagalog, Cebuano, Hiligaynon, etc.)",
                  "Confidence scoring for translation accuracy",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS.text.yellow }}
                    />
                    <span
                      className="text-sm md:text-base"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Innovation */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl border transition-all duration-300 hover:scale-105 items-center"
                style={{
                  backgroundColor: COLORS.background.light,
                  borderColor: `${COLORS.primary.blue}30`,
                }}
              >
                <div className="flex items-center gap-4 mb-4 sm:flex-col sm:items-start md:flex-row md:items-center ">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ background: highlight.gradient }}
                  >
                    <IconComponent
                      className={highlight.iconColor || "text-white"}
                      size={24}
                    />
                  </div>
                  <h4
                    className="text-xl font-bold mb-3"
                    style={{ color: COLORS.text.primary }}
                  >
                    {highlight.title}
                  </h4>
                </div>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                >
                  {highlight.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Beneficiaries Section */}
        <div>
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: COLORS.text.primary }}
          >
            Who Benefits from{" "}
            <span style={{ color: COLORS.text.yellow }}>Wika</span>
            <span style={{ color: COLORS.text.primary }}>Talk</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficiaries.map((beneficiary, index) => {
              const IconComponent = beneficiary.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center hover:scale-105"
                  style={{
                    backgroundColor: COLORS.background.light,
                    borderColor: `${COLORS.primary.blue}30`,
                  }}
                >
                  <div
                    className="text-4xl w-16 h-16 rounded-xl mb-4 flex items-center justify-center"
                    style={{
                      backgroundImage: beneficiary.gradient,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <IconComponent className={`text-white text-4xl mx-auto`} />
                  </div>
                  <h4
                    className="text-lg font-bold mb-3"
                    style={{ color: COLORS.text.primary }}
                  >
                    {beneficiary.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {beneficiary.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Statement */}
        <div className="mt-16 text-center">
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
              Breaking Language Barriers, Building Cultural Bridges
            </h4>
            <p
              className="text-sm md:text-lg leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              WikaTalk addresses the challenge where Filipino languages are
              sometimes misunderstood or mocked due to language barriers. By
              facilitating understanding across different languages and
              promoting respect among dialect speakers, we're building a more
              inclusive Philippines where linguistic diversity is celebrated and
              preserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
