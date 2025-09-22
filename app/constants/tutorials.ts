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
    {
      id: "language-selection",
      text: "Select your languages here. Left dropdown is source language, right dropdown is target language. Use the swap button in the middle to quickly switch between them.",
      target: "translate-language-selection",
      order: 1,
      placement: "bottom",
    },
    {
      id: "quick-phrases",
      text: "Use these quick phrases for common translations. Tap any phrase to instantly translate it and save time on typing.",
      target: "translate-quick-phrases",
      order: 2,
      placement: "bottom",
    },
    {
      id: "source-text-area",
      text: "This is your source text area. Type or paste text here to translate. Use volume icon for audio playback, info icon for accuracy details, and copy/clear buttons.",
      target: "translate-source-area",
      order: 3,
      placement: "bottom",
    },
    {
      id: "target-text-area",
      text: "Your translation appears here. Use volume icon to hear the translation, info icon for accuracy details, and copy button to save the translated text.",
      target: "translate-target-area",
      order: 4,
      placement: "top",
    },
  ],
};

export const SCAN_TUTORIAL: TutorialConfig = {
  id: "scan_tutorial",
  name: "Camera Scan Tutorial",
  steps: [
    {
      id: "camera-section",
      text: "This is the camera section. Capture text clearly for better results. Press the camera icon to take a photo or the image icon to choose from your gallery.",
      target: "scan-camera-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "translation-section",
      text: "Translation section: Select target language from dropdown. Detected text appears with audio playback, copy, and clear options. Translation results show below with audio playback, copy, and accuracy info icons.",
      target: "scan-translation-section",
      order: 2,
      placement: "top",
    },
  ],
};
