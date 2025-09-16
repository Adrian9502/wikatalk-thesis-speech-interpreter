import React from "react";
import { motion } from "framer-motion";
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
      title: "Speech Translation",
      description:
        "Speak naturally and get instant translations across Filipino languages. Your words are captured, converted, and played back in the chosen language.",
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
        "Translate written text quickly across multiple Filipino languages, with results that maintain context and meaning.",
      gradient: FEATURE_COLORS.translate.gradient,
      details: [
        "Supports over 10 languages",
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

  // Animation variants - NO transitions in variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }, // No transition here
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 }, // No transition here
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0 }, // No transition here
  };

  const detailVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }, // No transition here
  };

  return (
    <section id="features" className="py-20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primary.blue} 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
        >
          <motion.h2
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Powerful Features for
            <motion.span
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
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Language Learning
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-md md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Discover a comprehensive suite of tools designed to make learning
            Filipino language engaging, effective, and enjoyable.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                className="group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  backgroundColor: COLORS.background.light,
                  borderColor: `${COLORS.primary.blue}30`,
                }}
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${COLORS.primary.blue}30`;
                }}
              >
                {/* Animated Background Gradient */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: feature.gradient }}
                  whileHover={{
                    opacity: 0.1,
                    scale: 1.02,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Title - Side by side on small devices, stacked on larger */}
                  <div className="flex items-center gap-4 mb-4 sm:flex-col sm:items-start md:flex-row md:items-center">
                    {/* Animated Icon */}
                    <motion.div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: feature.gradient }}
                      variants={iconVariants}
                      transition={{
                        type: "spring" as const,
                        stiffness: 200,
                        damping: 15,
                      }} // Transition here
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.1,
                        transition: { duration: 0.5 }, // Hover transition inline
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring" as const, stiffness: 300 }}
                      >
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                      </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      className="text-lg md:text-xl font-bold"
                      style={{ color: COLORS.text.primary }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.title}
                    </motion.h3>
                  </div>

                  {/* Description */}
                  <motion.p
                    className="text-sm sm:text-md mb-4 leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>

                  {/* Feature Details */}
                  <motion.ul
                    className="space-y-2"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {feature.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        className="flex items-center text-sm"
                        style={{ color: COLORS.text.secondary }}
                        variants={detailVariants}
                        transition={{ duration: 0.4 }} // Transition here
                        whileHover={{
                          x: 5,
                          color: COLORS.text.primary,
                          transition: { duration: 0.2 }, // Hover transition inline
                        }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full mr-3"
                          style={{ backgroundColor: COLORS.text.yellow }}
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: detailIndex * 0.2,
                          }}
                        />
                        {detail}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
