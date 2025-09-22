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
      text: "Select target language from dropdown. Detected text appears with audio playback, copy, and clear options. Translation results show below with audio playback, copy, and accuracy info icons.",
      target: "scan-translation-section",
      order: 2,
      placement: "top",
    },
  ],
};

export const GAMES_TUTORIAL: TutorialConfig = {
  id: "games_tutorial",
  name: "Games & Learning Tutorial",
  steps: [
    {
      id: "word-of-day-section",
      text: "Learn new vocabulary every day! Tap the card to hear pronunciation and collect your daily coins.",
      target: "games-word-of-day-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "game-modes-section",
      text: "Practice Filipino languages through fun games! Choose from 3 game modes: Multiple Choice, Word Identification, and Fill in the Blank. Use your coins to buy hints and check your progress here.",
      target: "games-modes-section",
      order: 2,
      placement: "top",
    },
  ],
};

export const PRONOUNCE_TUTORIAL: TutorialConfig = {
  id: "pronounce_tutorial",
  name: "Pronunciation Guide Tutorial",
  steps: [
    {
      id: "search-bar",
      text: "Use this search bar to quickly find specific words or phrases. Type any English word, translation, or pronunciation guide to filter the vocabulary list instantly.",
      target: "pronounce-search-bar",
      order: 1,
      placement: "bottom",
    },
    {
      id: "language-dropdown",
      text: "Select your target Filipino language here. Choose from various dialects like Cebuano, Tagalog, Ilocano, and more to access their specific vocabulary and pronunciation guides.",
      target: "pronounce-language-dropdown",
      order: 2,
      placement: "bottom",
    },
    {
      id: "pronunciation-card",
      text: "Each card shows an English word with its translation and pronunciation guide. Press the play button to hear the correct pronunciation. The card highlights when audio is playing, helping you learn proper dialect pronunciation.",
      target: "pronounce-pronunciation-card",
      order: 3,
      placement: "top",
    },
  ],
};
