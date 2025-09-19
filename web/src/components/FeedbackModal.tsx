import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "../constants/colors";
import { FaBug, FaLightbulb } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";
import { LuMessageSquare } from "react-icons/lu";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion" | "">(
    ""
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFeedbackType("");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitted(false);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !feedbackType ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/users/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedbackType,
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            source: "web",
          }),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(
        "Failed to submit feedback. Please try again or contact us directly at bontojohnadrian@gmail.com"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    {
      id: "bug" as const,
      label: "Bug Report",
      icon: FaBug,
      description: "Found an issue?",
      color: COLORS.primary.red,
    },
    {
      id: "suggestion" as const,
      label: "Feature Request",
      icon: FaLightbulb,
      description: "Share your ideas",
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
  if (isSubmitted) {
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
              className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 text-center"
              style={{ backgroundColor: COLORS.background.dark }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${COLORS.primary.blue}` }}
              >
                <BsFillSendFill
                  className="w-8 h-8"
                  style={{ color: COLORS.primary.white }}
                />
              </div>

              <h3
                className="sm:text-md lg:text-xl font-bold mb-2"
                style={{ color: COLORS.text.primary }}
              >
                Thank You!
              </h3>

              <p
                className="text-xs lg:text-sm leading-relaxed mb-4"
                style={{ color: COLORS.text.secondary }}
              >
                Your {feedbackType === "bug" ? "bug report" : "feedback"} has
                been submitted successfully. We'll review it and get back to you
                soon.
              </p>

              <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                This window will close automatically...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
            className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.background.dark }}
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
                <LuMessageSquare
                  className="w-6 h-6"
                  style={{ color: COLORS.text.yellow }}
                />
                <h2
                  className="text-md lg:text-lg font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Send Feedback
                </h2>
              </div>
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <h3
                    className="text-md lg:text-lg font-semibold mb-4"
                    style={{ color: COLORS.text.primary }}
                  >
                    Feedback Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            feedbackType === type.id
                              ? "border-opacity-100"
                              : "border-opacity-30"
                          }`}
                          style={{
                            backgroundColor:
                              feedbackType === type.id
                                ? `${type.color}20`
                                : COLORS.background.light,
                            borderColor: type.color,
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: type.color }}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                style={{ color: "white" }}
                              />
                            </div>
                            <div className="text-left">
                              <h4
                                className="text-sm lg:text-md font-semibold"
                                style={{ color: COLORS.text.primary }}
                              >
                                {type.label}
                              </h4>
                              <p
                                className="text-xs md:text-sm"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: COLORS.background.light,
                        borderColor: `${COLORS.primary.blue}30`,
                        color: COLORS.text.primary,
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: COLORS.background.light,
                        borderColor: `${COLORS.primary.blue}30`,
                        color: COLORS.text.primary,
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={
                      feedbackType === "bug"
                        ? "Brief description of the issue"
                        : "What would you like to suggest?"
                    }
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: COLORS.background.light,
                      borderColor: `${COLORS.primary.blue}30`,
                      color: COLORS.text.primary,
                    }}
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.text.primary }}
                  >
                    {feedbackType === "bug" ? "Bug Details" : "Description"} *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === "bug"
                        ? "Describe the bug: what happened, expected behavior, steps to reproduce..."
                        : "Describe your feature request in detail..."
                    }
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: COLORS.background.light,
                      borderColor: `${COLORS.primary.blue}30`,
                      color: COLORS.text.primary,
                    }}
                    required
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {message.length}/1000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 text-sm py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: `${COLORS.secondary.gray}20`,
                      color: COLORS.text.secondary,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !feedbackType ||
                      !name.trim() ||
                      !email.trim() ||
                      !subject.trim() ||
                      !message.trim() ||
                      isSubmitting
                    }
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{
                      background: COLORS.primary.blue,
                      color: COLORS.text.primary,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <BsFillSendFill className="w-4 h-4" />
                        <span className="text-sm">
                          Submit{" "}
                          {feedbackType === "bug" ? "Bug Report" : "Feedback"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
