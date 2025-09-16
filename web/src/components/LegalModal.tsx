import React, { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, FileText, Shield } from "lucide-react";
import { COLORS } from "../constants/colors";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms";
  content: string;
}

const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  type,
  content,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
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

  const formatContent = (content: string) => {
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Check if it's a header (starts with **)
      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
        const headerText = paragraph.replace(/\*\*/g, "");
        return (
          <h3
            key={index}
            className="text-sm md:text-md font-bold mb-4 mt-6 first:mt-0"
            style={{ color: COLORS.text.primary }}
          >
            {headerText}
          </h3>
        );
      }

      // Check if it's a list item (starts with •)
      if (paragraph.includes("•")) {
        const items = paragraph.split("•").filter((item) => item.trim());
        return (
          <ul key={index} className="space-y-2 mb-4">
            {items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="flex lg:text-sm items-start text-sm md:text-base leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ backgroundColor: COLORS.text.yellow }}
                />
                {item.trim()}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p
          key={index}
          className="text-xs lg:text-sm md:text-base leading-relaxed mb-4 text-justify"
          style={{ color: COLORS.text.secondary }}
        >
          {paragraph}
        </p>
      );
    });
  };

  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut", // This would also work with proper import
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn", // This would also work with proper import
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={onClose}
          />

          {/* Modal */}
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
                {type === "privacy" ? (
                  <Shield
                    className="w-6 h-6"
                    style={{ color: COLORS.text.yellow }}
                  />
                ) : (
                  <FileText
                    className="w-6 h-6"
                    style={{ color: COLORS.text.yellow }}
                  />
                )}
                <h2
                  className="text-md lg:text-lg  font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
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

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                {formatContent(content)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
