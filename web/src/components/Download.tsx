import React from "react";
import { motion } from "framer-motion";
import { BUTTON_GRADIENTS, COLORS } from "../constants/colors";
import { FaApple, FaAndroid } from "react-icons/fa6";

const Download: React.FC = () => {
  const downloadLinks = [
    {
      platform: "Android",
      icon: FaAndroid,
      iconColor: "text-green-600",
      description: "Direct APK download",
      // v1.6.0 - last build - Oct 10 2025
      url: "https://github.com/Adrian9502/wikatalk-thesis-speech-interpreter/releases/download/v1.6.0/wikatalk-v1.6.0.apk",
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

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "wikatalk-v1.3.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
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

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }, // No transition here
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }, // No transition here
  };

  return (
    <motion.section
      id="download"
      className="py-20 relative"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
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
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
        >
          <motion.h2
            className="text-2xl md:text-3xl lg:text-5xl font-bold pb-2 mb-6"
            style={{ color: COLORS.text.primary }}
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
          >
            Download {"  "}
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
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
          >
            Start your Filipino languages learning journey today. Download
            WikaTalk for free and experience comprehensive speech-to-speech
            translation, gamified learning, and cultural immersion through
            innovative technology.
          </motion.p>
        </motion.div>

        {/* Enhanced Download Section */}
        <motion.div
          className="mb-16"
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
        >
          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {downloadLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center p-8 rounded-2xl border transition-all duration-300"
                  style={{
                    backgroundColor: COLORS.background.light,
                    borderColor: `${COLORS.primary.blue}40`,
                  }}
                  variants={cardVariants}
                  transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    borderColor: COLORS.primary.blue,
                  }}
                >
                  {/* Enhanced Platform Icon */}
                  <motion.div
                    className="w-20 h-20 rounded-2xl flex items-center bg-white justify-center text-4xl mb-6 mx-auto"
                    variants={iconVariants}
                    transition={{
                      type: "spring" as const,
                      stiffness: 200,
                      damping: 15,
                    }} // Transition here
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                      transition: { duration: 0.5 },
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring" as const, stiffness: 300 }}
                    >
                      <IconComponent className={link.iconColor} size={40} />
                    </motion.div>
                  </motion.div>

                  {/* Platform Info with animations */}
                  <motion.h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: COLORS.text.primary }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {link.platform}
                  </motion.h3>
                  <motion.p
                    className="mb-6"
                    style={{ color: COLORS.text.secondary }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  >
                    {link.description}
                  </motion.p>

                  {/* Enhanced Download Button */}
                  {link.available ? (
                    <motion.button
                      onClick={() =>
                        handleDownload(
                          link.url,
                          `wikatalk-${link.platform.toLowerCase()}.apk`
                        )
                      }
                      className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 cursor-pointer"
                      style={{
                        background: BUTTON_GRADIENTS.redToBlue,
                        color: COLORS.text.primary,
                      }}
                      variants={buttonVariants}
                      transition={{ duration: 0.5, ease: "easeOut" }} // Transition here
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.buttonText}
                    </motion.button>
                  ) : (
                    <motion.button
                      className="inline-block px-8 py-4 rounded-full font-semibold text-lg cursor-not-allowed opacity-60"
                      style={{
                        background: `${COLORS.text.secondary}40`,
                        color: COLORS.text.secondary,
                      }}
                      disabled
                      variants={buttonVariants}
                      transition={{ duration: 0.5, ease: "easeOut" }} // Transition here
                    >
                      {link.buttonText}
                    </motion.button>
                  )}

                  {/* Enhanced Status Badge */}
                  {!link.available && (
                    <motion.div
                      className="mt-4"
                      variants={badgeVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.5,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                    >
                      <motion.span
                        className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${COLORS.text.yellow}20`,
                          color: COLORS.text.yellow,
                        }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        Coming Soon
                      </motion.span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          className="text-center"
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut" }} // Transition here
        >
          <motion.div
            className="max-w-4xl mx-auto p-8 rounded-2xl border"
            style={{
              backgroundColor: COLORS.background.light,
              borderColor: `${COLORS.primary.blue}30`,
            }}
            variants={cardVariants}
            transition={{ duration: 0.6, ease: "easeOut" }} // Transition here
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              borderColor: COLORS.primary.blue,
              transition: { duration: 0.3 },
            }}
          >
            <motion.h4
              className="text-lg md:text-xl font-bold mb-4"
              style={{ color: COLORS.text.primary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Start Your Journey in Learning Filipino Languages
            </motion.h4>
            <motion.p
              className="text-sm md:text-lg leading-relaxed mb-6"
              style={{ color: COLORS.text.secondary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              WikaTalk is completely free to download and use. No subscription
              fees, no hidden charges. Start breaking language barriers and
              building cultural bridges today through innovative translation
              technology and gamified learning.
            </motion.p>
            <motion.p
              className="text-sm"
              style={{ color: COLORS.text.secondary }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Available now on Android • iOS coming soon
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Download;
