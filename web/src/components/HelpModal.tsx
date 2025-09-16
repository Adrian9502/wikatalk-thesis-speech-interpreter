import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, ChevronDown, ChevronRight, Search } from "lucide-react";
import { COLORS } from "../constants/colors";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  // FAQ Data based on your app's functionality
  const faqData: FAQItem[] = [
    // Getting Started
    {
      id: 1,
      category: "getting-started",
      question: "How do I install WikaTalk?",
      answer:
        "Download the APK file from our website and install it on your Android device. iOS version is coming soon. Make sure to enable 'Install from unknown sources' in your device settings.",
    },
    {
      id: 2,
      category: "getting-started",
      question: "How do I create an account?",
      answer:
        "You can register with an email address (requires Gmail verification) or sign in directly using your Google account for quick and convenient access.",
    },
    {
      id: 3,
      category: "getting-started",
      question: "What languages does WikaTalk support?",
      answer:
        "WikaTalk supports 10 Filipino languages: Tagalog, Cebuano, Hiligaynon, Ilocano, Bikol, Waray, Pangasinan, Maranao, Kapampangan, and Bisaya.",
    },

    // Core Features
    {
      id: 4,
      category: "features",
      question: "How does speech translation work?",
      answer:
        "Speak naturally into your microphone, select source and target languages, and get instant speech-to-speech translation. Your words are captured, converted, and played back in the chosen language.",
    },
    {
      id: 5,
      category: "features",
      question: "Can I translate text from images?",
      answer:
        "Yes! Use the Camera Translation feature to scan text from signs, menus, or documents. The app uses OCR (Optical Character Recognition) to convert images into text, then translates it instantly.",
    },
    {
      id: 6,
      category: "features",
      question: "What games are available?",
      answer:
        "WikaTalk offers Multiple Choice, Fill in the Blank, and Identification games. Each game has different difficulty levels and you can earn coins, use hints, and track your progress.",
    },

    // Accounts & Progress
    {
      id: 7,
      category: "account",
      question: "How do coins work?",
      answer:
        "Coins are virtual currency earned through gameplay and daily login rewards. Use coins to purchase hints during games or unlock special features. Coins have no real-world monetary value.",
    },
    {
      id: 8,
      category: "account",
      question: "How is my progress tracked?",
      answer:
        "The app tracks your quiz completion rates, difficulty levels, total time spent learning, coins earned, and ranking on leaderboards. View detailed statistics in your profile.",
    },
    {
      id: 9,
      category: "account",
      question: "Can I reset my password?",
      answer:
        "Yes, use the 'Forgot Password' option on the login screen. The app will send password reset instructions to your registered email address.",
    },

    // Translation & Accuracy
    {
      id: 10,
      category: "translation",
      question: "How accurate are the translations?",
      answer:
        "Translation accuracy varies by language. We use trained NLP models with accuracy rates ranging from 85-95% for most Filipino languages. Always verify important translations with native speakers.",
    },
    {
      id: 11,
      category: "translation",
      question: "Can I save my translation history?",
      answer:
        "Translation history is stored locally on your device. You can access recent translations in the app, but they're not synced across devices for privacy reasons.",
    },
    {
      id: 12,
      category: "translation",
      question: "Does the app work offline?",
      answer:
        "Some basic features work offline, but translation services require internet connectivity for the best accuracy and latest language models.",
    },

    // Troubleshooting
    {
      id: 13,
      category: "troubleshooting",
      question: "The app won't recognize my voice. What should I do?",
      answer:
        "Check your microphone permissions, ensure you're in a quiet environment, speak clearly, and make sure your internet connection is stable. Try restarting the app if issues persist.",
    },
    {
      id: 14,
      category: "troubleshooting",
      question: "Camera translation isn't working. How can I fix this?",
      answer:
        "Ensure camera permissions are enabled, clean your camera lens, provide good lighting, and hold the device steady. The text should be clear and well-lit for best OCR results.",
    },
    {
      id: 15,
      category: "troubleshooting",
      question: "The app crashes or freezes. What should I do?",
      answer:
        "Try restarting the app, clearing the app cache, ensuring you have the latest version installed, and checking that your device has sufficient storage space.",
    },

    // Privacy & Data
    {
      id: 16,
      category: "privacy",
      question: "Is my voice data stored?",
      answer:
        "Voice recordings are processed in real-time for translation and immediately deleted. We do not permanently store your audio recordings for privacy protection.",
    },
    {
      id: 17,
      category: "privacy",
      question: "How is my personal data protected?",
      answer:
        "We use encryption for data transmission, store minimal personal information, and follow strict privacy guidelines. Review our Privacy Policy for complete details.",
    },
  ];

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "getting-started", label: "Getting Started" },
    { id: "features", label: "Features" },
    { id: "account", label: "Account & Progress" },
    { id: "translation", label: "Translation" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "privacy", label: "Privacy & Data" },
  ];

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
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
                <HelpCircle
                  className="w-6 h-6"
                  style={{ color: COLORS.text.yellow }}
                />
                <h2
                  className="text-md lg:text-lg font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Help Center
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
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div
              className="p-6 border-b"
              style={{ borderColor: `${COLORS.primary.blue}30` }}
            >
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: COLORS.text.secondary }}
                />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: COLORS.background.light,
                    borderColor: `${COLORS.primary.blue}30`,
                    color: COLORS.text.primary,
                  }}
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      selectedCategory === category.id
                        ? "opacity-100"
                        : "opacity-70"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? COLORS.primary.blue
                          : `${COLORS.primary.blue}20`,
                      color: COLORS.text.primary,
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle
                    className="w-12 h-12 mx-auto mb-4 opacity-50"
                    style={{ color: COLORS.text.secondary }}
                  />
                  <p style={{ color: COLORS.text.secondary }}>
                    No help topics found. Try different search terms or
                    categories.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: COLORS.background.light,
                        borderColor: `${COLORS.primary.blue}20`,
                      }}
                    >
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-all duration-200"
                      >
                        <h3
                          className="font-semibold pr-4"
                          style={{ color: COLORS.text.primary }}
                        >
                          {item.question}
                        </h3>
                        {expandedItems.includes(item.id) ? (
                          <ChevronDown
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: COLORS.text.secondary }}
                          />
                        ) : (
                          <ChevronRight
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: COLORS.text.secondary }}
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedItems.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="px-6 pb-4 border-t"
                              style={{
                                borderColor: `${COLORS.primary.blue}20`,
                              }}
                            >
                              <p
                                className="text-sm leading-relaxed mt-4"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* Additional Help */}
              <div
                className="mt-8 p-6 rounded-lg text-center"
                style={{ backgroundColor: `${COLORS.primary.blue}10` }}
              >
                <h4
                  className="font-semibold mb-2"
                  style={{ color: COLORS.text.primary }}
                >
                  Still need help?
                </h4>
                <p
                  className="text-sm mb-4"
                  style={{ color: COLORS.text.secondary }}
                >
                  Can't find what you're looking for? Contact us directly and
                  we'll be happy to help.
                </p>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Email:{" "}
                  <span style={{ color: COLORS.primary.blue }}>
                    bontojohnadrian@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
