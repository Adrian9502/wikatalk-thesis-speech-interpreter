import React from "react";
import { motion } from "framer-motion";
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

  // Animation variants WITHOUT transitions (transitions go in components)
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

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }, // No transition here
  };

  const impactVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }, // No transition here
  };

  return (
    <section id="about" className="py-20 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-5"
          style={{ background: COLORS.primary.yellow }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-5"
          style={{ background: COLORS.primary.red }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
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
            About {"  "}
            <motion.span
              style={{ color: COLORS.text.yellow }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Wika
            </motion.span>
            <motion.span
              style={{ color: COLORS.text.primary }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Talk
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            A comprehensive mobile application designed for smooth and efficient
            speech-to-speech interpretation of Filipino languages, serving as a
            communication tool that bridges language barriers and promotes
            cultural understanding through innovative technology and gamified
            learning experiences.
          </motion.p>
        </motion.div>

        {/* Research Objectives Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: COLORS.text.primary }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Research Objectives & Innovation
          </motion.h3>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            {/* Left Content - General Objective */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <h4
                className="text-lg md:text-xl font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                Our Mission
              </h4>
              <motion.p
                className="text-sm md:text-base leading-relaxed mb-6"
                style={{ color: COLORS.text.secondary }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              >
                WikaTalk addresses communication challenges between different
                Filipino dialect speakers by providing real-time interpretation
                of the top 10 languages in the Philippines. Our goal is to
                enable efficient communication while allowing users to immerse
                themselves in Filipino culture through seamless language
                translation.
              </motion.p>
            </motion.div>

            {/* Right Content - Key Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <h4
                className="text-lg md:text-xl font-bold mb-6"
                style={{ color: COLORS.text.primary }}
              >
                Core Features
              </h4>
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  "Real-time speech-to-speech translation",
                  "Camera-based OCR text translation",
                  "Multiple game modes: Multiple Choice, Fill in the Blank, Identification",
                  "Level progression with coins, hints, and rewards system",
                  "Daily challenges and pronunciation practice",
                  "10 Filipino languages support (Tagalog, Cebuano, Hiligaynon, etc.)",
                  "Confidence scoring for translation accuracy",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    variants={featureVariants}
                    transition={{ duration: 0.4, ease: "easeOut" }} // Transition here
                    whileHover={{
                      x: 10,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS.text.yellow }}
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                    <span
                      className="text-sm md:text-base"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Technical Innovation */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {highlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <motion.div
                key={index}
                className="p-6 rounded-2xl border transition-all duration-300 items-center"
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
                  borderColor: COLORS.primary.blue,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              >
                <div className="flex items-center gap-4 mb-4 sm:flex-col sm:items-start md:flex-row md:items-center">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ background: highlight.gradient }}
                    variants={iconVariants}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }} // Transition here
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                      transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        transition: { type: "spring", stiffness: 300 },
                      }}
                    >
                      <IconComponent
                        className={highlight.iconColor || "text-white"}
                        size={24}
                      />
                    </motion.div>
                  </motion.div>
                  <motion.h4
                    className="text-xl font-bold mb-3"
                    style={{ color: COLORS.text.primary }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    {highlight.title}
                  </motion.h4>
                </div>
                <motion.p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1 + 0.3,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  {highlight.description}
                </motion.p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Beneficiaries Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: COLORS.text.primary }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Who Benefits from{" "}
            <motion.span
              style={{ color: COLORS.text.yellow }}
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              Wika
            </motion.span>
            <motion.span
              style={{ color: COLORS.text.primary }}
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              Talk
            </motion.span>
          </motion.h3>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {beneficiaries.map((beneficiary, index) => {
              const IconComponent = beneficiary.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: COLORS.background.light,
                    borderColor: `${COLORS.primary.blue}30`,
                  }}
                  variants={cardVariants}
                  transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                    borderColor: COLORS.primary.blue,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                >
                  <motion.div
                    className="text-4xl w-16 h-16 rounded-xl mb-4 flex items-center justify-center"
                    style={{
                      backgroundImage: beneficiary.gradient,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    variants={iconVariants}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }} // Transition here
                    whileHover={{
                      rotate: [0, 10, -10, 0],
                      scale: 1.1,
                      transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        transition: { type: "spring", stiffness: 300 },
                      }}
                    >
                      <IconComponent className="text-white text-4xl mx-auto" />
                    </motion.div>
                  </motion.div>
                  <motion.h4
                    className="text-lg font-bold mb-3"
                    style={{ color: COLORS.text.primary }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    {beneficiary.title}
                  </motion.h4>
                  <motion.p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1 + 0.4,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    {beneficiary.description}
                  </motion.p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Enhanced Impact Statement */}
        <motion.div
          className="mt-16 text-center"
          variants={impactVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
        >
          <motion.div
            className="max-w-4xl mx-auto p-8 rounded-2xl border"
            style={{
              backgroundColor: COLORS.background.light,
              borderColor: `${COLORS.primary.blue}30`,
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              borderColor: COLORS.primary.blue,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <motion.h4
              className="text-lg md:text-xl font-bold mb-4"
              style={{ color: COLORS.text.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              Breaking Language Barriers, Building Cultural Bridges
            </motion.h4>
            <motion.p
              className="text-sm md:text-lg leading-relaxed"
              style={{ color: COLORS.text.secondary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            >
              WikaTalk addresses the challenge where Filipino languages are
              sometimes misunderstood or mocked due to language barriers. By
              facilitating understanding across different languages and
              promoting respect among dialect speakers, we're building a more
              inclusive Philippines where linguistic diversity is celebrated and
              preserved.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
