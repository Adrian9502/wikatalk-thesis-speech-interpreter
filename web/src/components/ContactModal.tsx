import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "../constants/colors";
import { FaFacebook, FaGithub } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";
import { SiGmail } from "react-icons/si";
import { IoMdClose } from "react-icons/io";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const contactMethods = [
    {
      name: "Email",
      icon: SiGmail,
      description: "Get in touch via email",
      value: "bontojohnadrian@gmail.com",
      action: () => window.open("mailto:bontojohnadrian@gmail.com", "_blank"),
      color: COLORS.primary.red,
    },
    {
      name: "Github",
      icon: FaGithub,
      description: "View the project repository",
      value: "Adrian9502",
      action: () => window.open("https://github.com/Adrian9502", "_blank"),
      color: "#5643fa",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      description: "Connect on Facebook",
      value: "John Adrian Bonto",
      action: () =>
        window.open("https://www.facebook.com/john.adrian.bonto", "_blank"),
      color: COLORS.primary.blue,
    },
  ];

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.background.primary }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: `${COLORS.primary.blue}30` }}
            >
              <div className="flex items-center space-x-3">
                <FaFacebook
                  className="w-6 h-6"
                  style={{ color: COLORS.text.yellow }}
                />
                <h2
                  className="text-md lg:text-lg font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Contact Us
                </h2>
              </div>
              {/* close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: `${COLORS.primary.blue}20`,
                  color: COLORS.text.secondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary.blue;
                  e.currentTarget.style.color = COLORS.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${COLORS.primary.blue}20`;
                  e.currentTarget.style.color = COLORS.text.secondary;
                }}
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p
                className="text-center text-sm lg:text-md mb-8 leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                Connect with us through any of these platforms. We'd love to
                hear from you!
              </p>

              {/* Contact Methods */}
              <div className="space-y-4">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={index}
                      onClick={method.action}
                      className="w-full p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg group border-transparent"
                      style={{
                        backgroundColor: COLORS.background.light,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = method.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${COLORS.primary.blue}30`;
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${method.color}` }}
                        >
                          <IconComponent
                            className="w-6 h-6"
                            color={COLORS.primary.white}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className="text-sm lg:text-base font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {method.name}
                          </h3>
                          <p
                            className="text-sm mb-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {method.description}
                          </p>
                          <p
                            className="text-sm font-medium underline"
                            style={{ color: method.color }}
                          >
                            {method.value}
                          </p>
                        </div>
                        <GoLinkExternal
                          className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{ color: COLORS.text.secondary }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Academic Context */}
              <div
                className="mt-8 p-4 rounded-lg"
                style={{ backgroundColor: `${COLORS.primary.blue}10` }}
              >
                <p
                  className="text-xs text-center leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                >
                  <strong style={{ color: COLORS.text.primary }}>
                    Academic Project:
                  </strong>
                  <br />
                  This application was developed as part of an undergraduate
                  thesis for the degree of Bachelor of Science in Computer
                  Science at City College of Calamba, Academic Year 2025–2026.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
