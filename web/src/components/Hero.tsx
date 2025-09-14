import React from "react";
import { COLORS } from "../constants/colors";
import homeScreen from "../assets/homepage.jpg";
import wikatalkLogo from "../assets/wikatalk-logo.png";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="pt-16 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full sm:opacity-10 opacity-0"
          style={{ background: COLORS.gradients.secondary }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: COLORS.primary.blue }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mt-10 lg:mt-0 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-center">
            {/* App logo */}
            <div className="flex justify-center mb-6">
              <img
                src={wikatalkLogo}
                alt="wikatalk logo"
                draggable="false"
                className="w-28 h-auto md:w-32 select-none pointer-events-none"
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span style={{ color: COLORS.text.yellow }}>Wika</span>
              <span style={{ color: COLORS.text.primary }}>Talk</span>
            </h1>

            {/* tagline */}
            <p
              className="text-sm md:text-lg mb-6 leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              Speak Freely, Understand Instantly.
            </p>

            {/* description */}
            <h2 className="text-lg mb-4 md:text-xl font-semibold">
              Learn Philippine languages the fun way.
            </h2>

            <p
              className="text-base lg:text-lg mb-8 leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              Translate instantly, play interactive games, and earn rewards as
              you explore Tagalog, Cebuano, Ilocano, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#download"
                className="px-8 py-4 rounded-full font-semibold text-md sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
                style={{
                  background: COLORS.gradients.secondary,
                  color: COLORS.text.primary,
                }}
              >
                Download Now
              </a>

              <a
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
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Content - Phone with App Image */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-center">
            <div className="relative mx-auto w-full rounded-lg">
              {/* Phone Frame */}
              <div className="relative w-72 h-auto mx-auto">
                {/* Outer Phone Border */}
                <div
                  className="w-full p-[6px] rounded-[2.5rem] shadow-2xl"
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
                        src={homeScreen}
                        alt="WikaTalk App Screenshot"
                        className="w-full h-full object-cover rounded-[2rem]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
