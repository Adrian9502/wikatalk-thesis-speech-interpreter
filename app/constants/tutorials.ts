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
      id: "explore",
      text: "Explore different features. Tap 'Speech' for speech-to-speech translation, 'Text' for text translation, and more.",
      target: "explore-section",
      order: 2,
      placement: "bottom",
    },
    {
      id: "word-of-day",
      text: "Check out the Word of the Day to learn new vocabulary and practice pronunciation every day!",
      target: "word-of-day",
      order: 3,
      placement: "bottom",
    },
    {
      id: "history",
      text: "View your translation history here.",
      target: "translation-history",
      order: 4,
      placement: "top",
    },
    {
      id: "complete",
      text: "Great! You're ready to start translating. Explore the tabs below to discover more features!",
      order: 5,
      placement: "center",
    },
  ],
};

// Export other tutorial configurations as you create them
export const SPEECH_TUTORIAL: TutorialConfig = {
  id: "speech_tutorial",
  name: "Speech Translation Tutorial",
  steps: [
    {
      id: "top-section",
      text: "This is your source language section. Select language from dropdown, use volume icon for audio playback, info icon for accuracy, copy/clear buttons, and the mic to record. Next to the mic shows phrases and cultural notes for the selected language. Your speech-to-text will appear in the center.",
      target: "speech-top-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "bottom-section",
      text: "This is your target language section. Press the mic icon to record your speech. Next to the mic shows phrases and cultural notes for the selected language. Your translation will appear in the center.",
      target: "speech-bottom-section",
      order: 2,
      placement: "top",
    },
  ],
};

export const TRANSLATE_TUTORIAL: TutorialConfig = {
  id: "translate_tutorial",
  name: "Text Translation Tutorial",
  steps: [
    // Will be implemented next
  ],
};
