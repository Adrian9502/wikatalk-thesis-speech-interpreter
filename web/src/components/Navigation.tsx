import React, { useState } from "react";
import { COLORS } from "../constants/colors";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Explore", href: "#explore" },
    { name: "About", href: "#about" },
    { name: "Download", href: "#download" },
  ];

  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur-md"
      style={{
        backgroundColor: COLORS.background.overlay,
        borderBottom: `1px solid ${COLORS.secondary.lightBlue}50`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span
              className="text-lg sm:text-xl md:text-2xl font-bold"
              style={{ color: COLORS.text.yellow }}
            >
              Wika
            </span>
            <span
              className="text-lg sm:text-xl md:text-2xl font-bold"
              style={{ color: COLORS.text.primary }}
            >
              Talk
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200  group"
                  style={{
                    color: COLORS.text.secondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.text.yellow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.text.secondary;
                  }}
                >
                  {item.name}
                  {/* Animated underline */}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 ease-out group-hover:w-full"
                    style={{ backgroundColor: COLORS.text.yellow }}
                  ></span>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md"
              style={{ color: COLORS.text.primary }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  style={{ color: COLORS.text.secondary }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
