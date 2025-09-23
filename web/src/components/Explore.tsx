import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "../constants/colors";
import { ChevronLeft, ChevronRight } from "lucide-react";

//  app screenshots
import homeScreen from "../assets/home-screen.jpg";
import speechScreen from "../assets/speech-screen.jpg";
import translateScreen from "../assets/translate-screen.jpg";
import scanScreen from "../assets/scan-screen.jpg";
import gamesScreen from "../assets/game-screen.jpg";
import pronounceScreen from "../assets/pronounce-screen.jpg";
import tutorialEnglishScreen from "../assets/tutorial-screen-english.jpg";

const Explore: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const appScreens = [
    {
      id: 1,
      title: "Home & Dashboard",
      description:
        "Your personalized learning hub with daily words, translation history, and instant access to all WikaTalk features.",
      image: homeScreen,
      features: [
        "Personalized welcome with profile & settings",
        "Quick Access Toolbar for Speech, Translate, Scan, and More",
        "Daily Word of the Day with pronunciation",
        "Translation history with timestamps",
      ],
    },
    {
      id: 2,
      title: "Speech Translation",
      description:
        "Instantly translate spoken words across 10 Filipino languages with dynamic visuals and seamless switching.",
      image: speechScreen,
      features: [
        "One-tap speech-to-speech translation",
        "Dynamic backgrounds per selected language",
        "Info icon for translation accuracy details",
        "Quick language switch & audio playback",
      ],
    },
    {
      id: 3,
      title: "Text Translation",
      description:
        "Translate text between Filipino languages with quick phrases and detailed accuracy info.",
      image: translateScreen,
      features: [
        "Select source & target languages",
        "Instant text translation",
        "Quick phrases for common terms",
        "Info icon for translation accuracy",
      ],
    },
    {
      id: 4,
      title: "Camera Translation",
      description:
        "Scan and translate printed or handwritten text instantly using OCR with dynamic backgrounds.",
      image: scanScreen,
      features: [
        "Real-time OCR scanning",
        "Translate captured or live text",
        "Dynamic backgrounds per language",
        "Info icon for translation accuracy",
      ],
    },

    {
      id: 5,
      title: "Interactive Learning",
      description:
        "Master Filipino languages through fun quizzes, daily rewards, and leaderboards.",
      image: gamesScreen,
      features: [
        "Word of the Day with audio",
        "Earn coins & use hints",
        "Multiple Choice, Identification & Fill in the Blank",
        "Track progress & view leaderboards",
      ],
    },
    {
      id: 6,
      title: "Pronunciation Practice",
      description:
        "Learn how to say words correctly with clear examples and easy-to-follow guides.",
      image: pronounceScreen,
      features: [
        "Search words and phrases",
        "See simple pronunciation tips",
        "Listen to clear audio examples",
        "Build confidence speaking different dialects",
      ],
    },
    {
      id: 7,
      title: "Interactive Tutorial (English or Tagalog)",
      description:
        "Get started with WikaTalk using our interactive step-by-step tutorial available in English or Tagalog.",
      image: tutorialEnglishScreen,
      features: [
        "Step-by-step guided walkthrough",
        "Explore all app features interactively",
        "Skip or jump between tutorial steps",
        "Complete the tutorial in your preferred language",
        "Replay the tutorial anytime in settings",
      ],
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % appScreens.length);
  }, [appScreens.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + appScreens.length) % appScreens.length
    );
  }, [appScreens.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Enhanced animation variants - NO transitions in variants
  const phoneVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? -45 : 45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? -45 : 45,
    }),
  };

  const contentVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }, // No transition here
  };

  const buttonHoverVariants = {
    hover: { scale: 1.1, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }, // No transition here
    tap: { scale: 0.95 },
  };

  const dotVariants = {
    inactive: { scale: 1, opacity: 0.5 },
    active: { scale: 1.3, opacity: 1 }, // No transition here
  };

  return (
    <section id="explore" className="py-20 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: COLORS.gradients.primary }}
        />
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: COLORS.gradients.secondary }}
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
            Explore{" "}
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
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Take a closer look at how WikaTalk transforms your language learning
            experience
          </motion.p>
        </motion.div>

        {/* Main Carousel Content */}
        <div className="lg:grid pt-6 pb-24 lg:pb-0  lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content - Description */}
          <div className="lg:col-span-5 pb-24 lg:pb-0 mb-12 lg:mb-0 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: COLORS.text.primary }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {appScreens[currentIndex].title}
                </motion.h3>
                <motion.p
                  className="text-base lg:text-lg mb-6 leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {appScreens[currentIndex].description}
                </motion.p>

                {/* Feature List */}
                <ul className="space-y-3 mb-8">
                  {appScreens[currentIndex].features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.1 + 0.4,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className="flex items-center justify-center lg:justify-start text-sm md:text-base"
                      style={{ color: COLORS.text.secondary }}
                      whileHover={{
                        x: 5,
                        color: COLORS.text.primary,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: COLORS.text.yellow }}
                        animate={{
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Screen Counter */}
                <motion.div
                  className="flex items-center justify-center lg:justify-start gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {currentIndex + 1} of {appScreens.length}
                  </span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Content - Enhanced Phone Carousel */}
          <div className="lg:col-span-7 relative flex justify-center">
            <motion.div
              className="relative flex justify-center items-center h-96 lg:h-[500px] w-full"
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Enhanced Navigation Buttons */}
              <motion.button
                onClick={() => {
                  prevSlide();
                  setIsAutoPlaying(false);
                }}
                className="absolute -left-2 lg:left-4 z-20 p-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: `${COLORS.background.light}cc`,
                  color: COLORS.primary.blue,
                  border: `2px solid ${COLORS.primary.blue}30`,
                }}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{
                  type: "spring" as const,
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                onClick={() => {
                  nextSlide();
                  setIsAutoPlaying(false);
                }}
                className="absolute -right-2 lg:right-4 z-20 p-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: `${COLORS.background.light}cc`,
                  color: COLORS.primary.blue,
                  border: `2px solid ${COLORS.primary.blue}30`,
                }}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{
                  type: "spring" as const,
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>

              {/* Phone Frame Container */}
              <div className="relative w-72 h-[500px] flex justify-center items-center">
                <AnimatePresence mode="wait" custom={1}>
                  <motion.div
                    key={currentIndex}
                    custom={1}
                    variants={phoneVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.4 },
                      rotateY: { duration: 0.4 },
                    }}
                    className="absolute"
                  >
                    {/* Enhanced Outer Phone Border */}
                    <motion.div
                      className="w-72 p-[6px] rounded-[2.5rem] shadow-2xl"
                      style={{
                        backgroundColor: COLORS.secondary.darkGray,
                      }}
                      whileHover={{
                        scale: 1.02,
                        rotateY: 5,
                        boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Screen Content */}
                      <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                        <motion.div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS.background.dark }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <motion.img
                            src={appScreens[currentIndex].image}
                            alt={`${appScreens[currentIndex].title} Screenshot`}
                            className="w-full h-full object-cover rounded-[2rem]"
                            draggable="false"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Dot Indicators */}
        <motion.div
          className="flex justify-center space-x-3 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {appScreens.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  index === currentIndex
                    ? COLORS.primary.blue
                    : `${COLORS.primary.blue}30`,
              }}
              variants={dotVariants}
              animate={index === currentIndex ? "active" : "inactive"}
              transition={{
                type: "spring" as const,
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>

        {/* Enhanced Auto-play Control */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: isAutoPlaying
                ? `${COLORS.primary.blue}20`
                : `${COLORS.secondary.darkGray}20`,
              color: COLORS.text.secondary,
              border: `1px solid ${COLORS.primary.blue}30`,
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: isAutoPlaying
                ? `${COLORS.primary.blue}30`
                : `${COLORS.secondary.darkGray}30`,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {isAutoPlaying ? "Pause Auto-play" : "Resume Auto-play"}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Explore;
