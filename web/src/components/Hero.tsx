import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../constants/colors";
import homeScreen from "../assets/home-screen.jpg";
import wikatalkLogo from "../assets/wikatalk-logo.png";
import { BUTTON_GRADIENTS } from "../constants/colors";

const Hero: React.FC = () => {
  // Animation variants - NO transitions in variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }, // No transition here
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: { opacity: 1, scale: 1, rotate: 0 }, // No transition here
  };

  const phoneVariants = {
    hidden: { opacity: 0, x: 100, rotate: 10 },
    visible: { opacity: 1, x: 0, rotate: 0 }, // No transition here
  };

  return (
    <section
      id="home"
      className="pt-16 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Animated Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-72 h-72 rounded-full sm:opacity-10 opacity-0"
          style={{ background: COLORS.gradients.secondary }}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: COLORS.primary.blue }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mt-10 lg:mt-0 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            className="text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* App logo */}
            <motion.div
              className="flex justify-center mb-6"
              variants={logoVariants}
              transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
            >
              <motion.img
                src={wikatalkLogo}
                alt="wikatalk logo"
                draggable="false"
                className="w-28 h-auto md:w-32 select-none pointer-events-none"
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 },
                }}
              />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            >
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
            </motion.h1>

            {/* tagline */}
            <motion.p
              className="text-sm md:text-lg mb-6 leading-relaxed"
              style={{ color: COLORS.text.secondary }}
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            >
              Speak Freely, Understand Instantly.
            </motion.p>

            {/* description */}
            <motion.h2
              className="text-lg mb-4 md:text-xl font-semibold"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            >
              Learn Philippine languages in an engaging way.
            </motion.h2>

            <motion.p
              className="text-base lg:text-lg mb-8 leading-relaxed"
              style={{ color: COLORS.text.secondary }}
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            >
              Translate instantly, play interactive games, and earn rewards as
              you explore Tagalog, Cebuano, Ilocano, and more.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            >
              <motion.a
                href="#download"
                className="px-8 py-4 rounded-full font-semibold text-md sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
                style={{
                  background: BUTTON_GRADIENTS.yellowToRed,
                  color: COLORS.text.primary,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Download Now
              </motion.a>

              <motion.a
                href="#features"
                className="px-8 py-4 rounded-full font-semibold text-md sm:text-lg border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center"
                style={{
                  borderColor: COLORS.primary.blue,
                  color: COLORS.primary.blue,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary.blue;
                  e.currentTarget.style.color = COLORS.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = COLORS.primary.blue;
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Learn More
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Content - Phone with App Image */}
          <motion.div
            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-center"
            variants={phoneVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} // Transition here
          >
            <motion.div
              className="relative mx-auto w-full rounded-lg"
              animate={{ y: [-10, 10, -10] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Phone Frame */}
              <div className="relative w-72 h-auto mx-auto">
                {/* Outer Phone Border */}
                <motion.div
                  className="w-full p-[6px] rounded-[2.5rem] shadow-2xl"
                  style={{
                    backgroundColor: COLORS.secondary.darkGray,
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Screen Content */}
                  <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                    <motion.div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: COLORS.background.dark }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.img
                        src={homeScreen}
                        alt="WikaTalk App Screenshot"
                        className="w-full h-full object-cover rounded-[2rem]"
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
