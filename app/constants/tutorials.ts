import { TutorialConfig } from "@/context/TutorialContext";

export const HOME_TUTORIAL: TutorialConfig = {
  id: "home_tutorial",
  name: "Home Page Tutorial",
  autoStart: true,
  steps: [
    {
      id: "welcome",
      text: "Welcome to WikaTalk! Let me show you around your dashboard.",
      order: 1,
      placement: "center",
    },
    {
      id: "header",
      text: "This is your profile section. You can view your stats and access settings here.",
      target: "home-header",
      order: 2,
      placement: "bottom",
    },
    {
      id: "explore",
      text: "Explore different features. Tap 'Speech' for speech-to-speech translation, 'Text' for text translation, and more.",
      target: "explore-section",
      order: 3,
      placement: "bottom",
    },
    {
      id: "word-of-day",
      text: "Check out the Word of the Day to learn new vocabulary and practice pronunciation every day!",
      target: "word-of-day",
      order: 4,
      placement: "bottom",
    },
    {
      id: "history",
      text: "View your translation history here.",
      target: "translation-history",
      order: 5,
      placement: "top",
    },
    {
      id: "complete",
      text: "Great! You're ready to start translating. Explore the tabs below to discover more features!",
      order: 6,
      placement: "center",
    },
  ],
};

// Export other tutorial configurations as you create them
export const SPEECH_TUTORIAL: TutorialConfig = {
  id: "speech_tutorial",
  name: "Speech Translation Tutorial",
  steps: [
    // Will be implemented next
  ],
};

export const TRANSLATE_TUTORIAL: TutorialConfig = {
  id: "translate_tutorial",
  name: "Text Translation Tutorial",
  steps: [
    // Will be implemented next
  ],
};
