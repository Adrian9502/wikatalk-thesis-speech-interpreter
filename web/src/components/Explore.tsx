import React, { useState, useEffect } from "react";
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

const Explore: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const appScreens = [
    {
      id: 1,
      title: "Home & Dashboard",
      description:
        "Start your learning journey with a personalized dashboard showing your progress and quick access to all features.",
      image: homeScreen,
      features: [
        "Personalized welcome & profile",
        "Track quiz levels, progress, and coins",
        "Carousel of core app features",
        "Quick access to all tools & leaderboards",
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
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % appScreens.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + appScreens.length) % appScreens.length
    );
  };

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
  }, [isAutoPlaying, currentIndex]);

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

  return (
    <section id="explore" className="py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: COLORS.gradients.primary }}
        />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: COLORS.gradients.secondary }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
          >
            Explore <span style={{ color: COLORS.text.yellow }}>Wika</span>
            <span style={{ color: COLORS.text.primary }}>Talk</span>
          </h2>
          <p
            className="text-sm md:text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Take a closer look at how WikaTalk transforms your language learning
            experience
          </p>
        </div>

        {/* Main Carousel Content */}
        <div className="lg:grid pt-6 lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content - Description */}
          <div className="lg:col-span-5 pb-24 lg:pb-0 mb-12 lg:mb-0 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: COLORS.text.primary }}
                >
                  {appScreens[currentIndex].title}
                </h3>
                <p
                  className="text-base lg:text-lg mb-6 leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                >
                  {appScreens[currentIndex].description}
                </p>

                {/* Feature List */}
                <ul className="space-y-3 mb-8">
                  {appScreens[currentIndex].features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex items-center justify-center lg:justify-start text-sm md:text-base"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: COLORS.text.yellow }}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Screen Counter */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {currentIndex + 1} of {appScreens.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Content - Phone Carousel */}
          <div className="lg:col-span-7 relative flex justify-center">
            <div className="relative flex justify-center items-center h-96 lg:h-[500px] w-full">
              {/* Navigation Buttons */}
              <button
                onClick={() => {
                  prevSlide();
                  setIsAutoPlaying(false);
                }}
                className="absolute left-4 z-20 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                style={{
                  backgroundColor: `${COLORS.background.light}cc`,
                  color: COLORS.primary.blue,
                  border: `2px solid ${COLORS.primary.blue}30`,
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  nextSlide();
                  setIsAutoPlaying(false);
                }}
                className="absolute right-4 z-20 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                style={{
                  backgroundColor: `${COLORS.background.light}cc`,
                  color: COLORS.primary.blue,
                  border: `2px solid ${COLORS.primary.blue}30`,
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

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
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.3 },
                      rotateY: { duration: 0.3 },
                    }}
                    className="absolute"
                  >
                    {/* Outer Phone Border */}
                    <div
                      className="w-72 p-[6px] rounded-[2.5rem] shadow-2xl"
                      style={{
                        backgroundColor: COLORS.secondary.darkGray,
                      }}
                    >
                      {/* Screen Content */}
                      <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS.background.dark }}
                        >
                          <img
                            src={appScreens[currentIndex].image}
                            alt={`${appScreens[currentIndex].title} Screenshot`}
                            className="w-full h-full object-cover rounded-[2rem]"
                            draggable="false"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center space-x-3 mt-12">
          {appScreens.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-125"
              style={{
                backgroundColor:
                  index === currentIndex
                    ? COLORS.primary.blue
                    : `${COLORS.primary.blue}30`,
              }}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: isAutoPlaying
                ? `${COLORS.primary.blue}20`
                : `${COLORS.secondary.darkGray}20`,
              color: COLORS.text.secondary,
              border: `1px solid ${COLORS.primary.blue}30`,
            }}
          >
            {isAutoPlaying ? "Pause Auto-play" : "Resume Auto-play"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Explore;
