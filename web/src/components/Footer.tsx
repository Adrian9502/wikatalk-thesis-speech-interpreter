import React from "react";
import { COLORS } from "../constants/colors";

const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Download", href: "#download" },
      { name: "System Requirements", href: "#download" },
      { name: "Privacy Policy", href: "#privacy" },
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "Bug Report", href: "#bug-report" },
      { name: "Feedback", href: "#feedback" },
    ],
    about: [
      { name: "About WikaTalk", href: "#about" },
      { name: "Our Mission", href: "#about" },
      { name: "Filipino Culture", href: "#culture" },
      { name: "Open Source", href: "#opensource" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: "💻", href: "#github" },
    { name: "Facebook", icon: "📘", href: "#facebook" },
    { name: "Twitter", icon: "🐦", href: "#twitter" },
    { name: "Email", icon: "📧", href: "mailto:bontojohnadrian@gmail.com" },
  ];

  return (
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
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl"
                style={{ background: COLORS.gradients.secondary }}
              >
                W
              </div>
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.text.yellow }}
              >
                WikaTalk
              </span>
            </div>
            <p
              className="mb-6 leading-relaxed max-w-md"
              style={{ color: COLORS.text.secondary }}
            >
              Bridging Filipino communities through technology. Learn,
              translate, and connect with Philippine dialects through our
              comprehensive language learning platform.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
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
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
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
                    className="transition-colors duration-200 hover:underline"
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
                  <a
                    href={link.href}
                    className="transition-colors duration-200 hover:underline"
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
              About
            </h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="transition-colors duration-200 hover:underline"
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
            © {new Date().getFullYear()} WikaTalk. All rights reserved. Made
            with ❤️ for Filipino culture.
          </p>
          <div className="flex space-x-6 text-sm">
            <a
              href="#privacy"
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
            </a>
            <a
              href="#terms"
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
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
