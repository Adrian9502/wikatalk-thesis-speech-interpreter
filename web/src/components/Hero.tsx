import React from "react";
import { COLORS } from "../constants/colors";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="pt-16 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: COLORS.gradients.secondary }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: COLORS.primary.blue }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span style={{ color: COLORS.text.primary }}>Learn Filipino</span>
              <br />
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${COLORS.text.accent}, ${COLORS.primary.blue})`,
                }}
              >
                Dialects
              </span>
              <br />
              <span style={{ color: COLORS.text.primary }}>with WikaTalk</span>
            </h1>

            <p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              Master Filipino dialects through interactive translation, speech
              recognition, gamified learning, and real-time conversations. Your
              journey to multilingual fluency starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#download"
                className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
                style={{
                  background: COLORS.gradients.secondary,
                  color: COLORS.text.primary,
                }}
              >
                Download Now
              </a>
              <a
                href="#features"
                className="px-8 py-4 rounded-full font-semibold text-lg border-2 transition-all duration-300 hover:scale-105 text-center"
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

          {/* Right Content - App Preview */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg lg:max-w-md">
              {/* Phone Frame */}
              <div
                className="relative w-64 h-[500px] mx-auto rounded-[2.5rem] border-8 shadow-2xl"
                style={{
                  borderColor: COLORS.secondary.darkGray,
                  backgroundColor: COLORS.background.dark,
                }}
              >
                {/* Screen Content */}
                <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative">
                  {/* Mock App Interface */}
                  <div
                    className="w-full h-full flex flex-col"
                    style={{ background: COLORS.gradients.primary }}
                  >
                    {/* Status Bar */}
                    <div className="h-8 flex justify-between items-center px-6 pt-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: COLORS.text.primary }}
                      >
                        9:41
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                        <div className="w-6 h-2 bg-white rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="flex-1 p-4 flex flex-col justify-center items-center text-center">
                      <div
                        className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center text-2xl font-bold"
                        style={{ background: COLORS.gradients.secondary }}
                      >
                        W
                      </div>
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ color: COLORS.text.primary }}
                      >
                        WikaTalk
                      </h3>
                      <p
                        className="text-sm mb-6"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Filipino Dialect Interpreter
                      </p>

                      {/* Feature Icons */}
                      <div className="grid grid-cols-2 gap-3 w-full max-w-32">
                        {[
                          { icon: "🗣️", name: "Speech" },
                          { icon: "🔤", name: "Translate" },
                          { icon: "📷", name: "Scan" },
                          { icon: "🎮", name: "Games" },
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg text-center"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div className="text-lg mb-1">{feature.icon}</div>
                            <div
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {feature.name}
                            </div>
                          </div>
                        ))}
                      </div>
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
