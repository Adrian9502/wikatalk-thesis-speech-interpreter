import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import LegalModal from "./LegalModal";
import FeedbackModal from "./FeedbackModal";
import ContactModal from "./ContactModal";
import HelpModal from "./HelpModal";
import {
  PRIVACY_POLICY_CONTENT,
  TERMS_OF_SERVICE_CONTENT,
} from "../constants/legal";

import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

const Footer: React.FC = () => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Download", href: "#download" },
    ],
    support: [
      { name: "Help Center", action: () => setHelpModalOpen(true) },
      { name: "Contact Us", action: () => setContactModalOpen(true) },
      { name: "Bug Report", action: () => setFeedbackModalOpen(true) },
      { name: "Feedback", action: () => setFeedbackModalOpen(true) },
    ],
    about: [
      { name: "About WikaTalk", href: "#about" },
      { name: "Our Mission", href: "#about" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: FaGithub, href: "https://github.com/Adrian9502" },
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "https://www.facebook.com/john.adrian.bonto",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "https://www.linkedin.com/in/john-adrian-bonto-a65704283/",
    },
    { name: "Email", icon: SiGmail, href: "mailto:bontojohnadrian@gmail.com" },
  ];

  return (
    <>
      <footer
        className="py-16 border-t"
        style={{
          backgroundColor: COLORS.background.dark,
          borderColor: `${COLORS.primary.blue}30`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 mb-2">
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.text.yellow }}
              >
                Wika
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.text.primary }}
              >
                Talk
              </span>
              <p
                className="mb-6 leading-relaxed max-w-md"
                style={{ color: COLORS.text.secondary }}
              >
                Breaking language barriers and building cultural bridges. Learn,
                translate, and connect with Filipino communities through
                innovation and gamified learning.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: `${COLORS.primary.blue}20`,
                        color: COLORS.text.secondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          COLORS.primary.blue;
                        e.currentTarget.style.color = COLORS.text.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${COLORS.primary.blue}20`;
                        e.currentTarget.style.color = COLORS.text.secondary;
                      }}
                      title={social.name}
                    >
                      <IconComponent />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h4
                className="font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                Product
              </h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:underline"
                      style={{ color: COLORS.text.secondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.text.yellow;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.text.secondary;
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                Support
              </h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={link.action}
                      className="cursor-pointer transition-colors text-sm duration-200 hover:underline text-left"
                      style={{ color: COLORS.text.secondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.text.yellow;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.text.secondary;
                      }}
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="font-bold mb-4"
                style={{ color: COLORS.text.primary }}
              >
                About
              </h4>
              <ul className="space-y-2">
                {footerLinks.about.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="transition-colors text-sm duration-200 hover:underline"
                      style={{ color: COLORS.text.secondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.text.yellow;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.text.secondary;
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div
            className="pt-8 border-t flex flex-col md:flex-row justify-between items-center"
            style={{ borderColor: `${COLORS.primary.blue}30` }}
          >
            <p
              className="text-sm mb-4 md:mb-0"
              style={{ color: COLORS.text.secondary }}
            >
              © {new Date().getFullYear()} WikaTalk. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setPrivacyModalOpen(true)}
                className="transition-colors duration-200 hover:underline"
                style={{ color: COLORS.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.text.yellow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.text.secondary;
                }}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setTermsModalOpen(true)}
                className="transition-colors duration-200 hover:underline"
                style={{ color: COLORS.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.text.yellow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.text.secondary;
                }}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* All Modals */}
      <LegalModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        type="privacy"
        content={PRIVACY_POLICY_CONTENT}
      />

      <LegalModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        type="terms"
        content={TERMS_OF_SERVICE_CONTENT}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </>
  );
};

export default Footer;
