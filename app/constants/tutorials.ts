import { TutorialConfig } from "@/context/TutorialContext";

export const HOME_TUTORIAL: TutorialConfig = {
  id: "home_tutorial",
  name: "Home Page Tutorial",
  autoStart: true,
  steps: [
    {
      id: "welcome",
      text: "Welcome to WikaTalk! Let me show you around your dashboard.",
      tagalogText:
        "Maligayang pagdating sa WikaTalk! Ipapakita ko sa iyo ang inyong dashboard.",
      order: 1,
      placement: "center",
    },
    {
      id: "explore",
      text: "Explore different features. Tap 'Speech' for speech-to-speech translation, 'Text' for text translation, and more.",
      tagalogText:
        "Tuklasin ang iba't ibang feature. I-tap ang 'Speech' para sa speech-to-speech translation, 'Text' para sa text translation, at iba pa.",
      target: "explore-section",
      order: 2,
      placement: "bottom",
    },
    {
      id: "word-of-day",
      text: "Check out the Word of the Day to learn new vocabulary and practice pronunciation every day!",
      tagalogText:
        "Tingnan ang Word of the Day para matuto ng bagong vocabulary at mag-practice ng pronunciation araw-araw!",
      target: "word-of-day",
      order: 3,
      placement: "bottom",
    },
    {
      id: "history",
      text: "View your translation history here.",
      tagalogText: "Tingnan ang inyong translation history dito.",
      target: "translation-history",
      order: 4,
      placement: "top",
    },
    {
      id: "complete",
      text: "Great! You're ready to start translating. Let's explore the Speech tab to learn speech-to-speech translation!",
      tagalogText:
        "Magaling! Handa ka na magsimula mag-translate. I-explore natin ang Speech tab para matuto ng speech-to-speech translation!",
      order: 5,
      placement: "center",
      // NEW: Navigate to Speech tab and start its tutorial
      navigationAction: {
        type: "navigate_tab",
        tabName: "Speech",
        startTutorial: "speech_tutorial",
      },
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
      tagalogText:
        "Ito ang inyong source language section. Piliin ang language sa dropdown, gamitin ang volume icon para sa audio playback, info icon para sa accuracy, copy/clear buttons, at ang mic para mag-record. Sa tabi ng mic makikita ang mga phrases at cultural notes para sa napiling language. Ang inyong speech-to-text ay lalabas sa gitna.",
      target: "speech-top-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "bottom-section",
      text: "This is your target language section. Press the mic icon to record your speech. Next to the mic shows phrases and cultural notes for the selected language. Now let's explore text translation in the Translate tab!",
      tagalogText:
        "Ito ang inyong target language section. I-press ang mic icon para mag-record ng inyong speech. Sa tabi ng mic makikita ang mga phrases at cultural notes para sa napiling language. Ngayon i-explore natin ang text translation sa Translate tab!",
      target: "speech-bottom-section",
      order: 2,
      placement: "top",
      // NEW: Navigate to Translate tab and start its tutorial
      navigationAction: {
        type: "navigate_tab",
        tabName: "Translate",
        startTutorial: "translate_tutorial",
      },
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
      tagalogText:
        "Piliin ang inyong mga language dito. Ang kaliwang dropdown ay source language, kanang dropdown ay target language. Gamitin ang swap button sa gitna para mabilis na magpalit sa pagitan nila.",
      target: "translate-language-selection",
      order: 1,
      placement: "bottom",
    },
    {
      id: "quick-phrases",
      text: "Use these quick phrases for common translations. Tap any phrase to instantly translate it and save time on typing.",
      tagalogText:
        "Gamitin ang mga quick phrases na ito para sa mga karaniwang translations. I-tap ang kahit anong phrase para instant na ma-translate ito at makatipid ng oras sa pag-type.",
      target: "translate-quick-phrases",
      order: 2,
      placement: "bottom",
    },
    {
      id: "source-text-area",
      text: "This is your source text area. Type or paste text here to translate. Use volume icon for audio playback, info icon for accuracy details, and copy/clear buttons.",
      tagalogText:
        "Ito ang inyong source text area. Mag-type o mag-paste ng text dito para i-translate. Gamitin ang volume icon para sa audio playback, info icon para sa accuracy details, at copy/clear buttons.",
      target: "translate-source-area",
      order: 3,
      placement: "bottom",
    },
    {
      id: "target-text-area",
      text: "Your translation appears here. Use volume icon to hear the translation, info icon for accuracy details, and copy button to save the translated text. Next, let's learn about camera scanning in the Scan tab!",
      tagalogText:
        "Ang inyong translation ay lalabas dito. Gamitin ang volume icon para marinig ang translation, info icon para sa accuracy details, at copy button para i-save ang translated text. Susunod, matuto tayo ng camera scanning sa Scan tab!",
      target: "translate-target-area",
      order: 4,
      placement: "top",
      // NEW: Navigate to Scan tab and start its tutorial
      navigationAction: {
        type: "navigate_tab",
        tabName: "Scan",
        startTutorial: "scan_tutorial",
      },
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
      tagalogText:
        "Ito ang camera section. Mag-capture ng text nang malinaw para sa mas magandang resulta. I-press ang camera icon para kumuha ng photo o ang image icon para pumili sa inyong gallery.",
      target: "scan-camera-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "translation-section",
      text: "Select target language from dropdown. Detected text appears with audio playback, copy, and clear options. Translation results show below with audio playback, copy, and accuracy info icons. Now let's explore interactive games in the Games tab!",
      tagalogText:
        "Piliin ang target language sa dropdown. Ang detected text ay lalabas kasama ang audio playback, copy, at clear options. Ang translation results ay makikita sa ibaba kasama ang audio playback, copy, at accuracy info icons. Ngayon i-explore natin ang interactive games sa Games tab!",
      target: "scan-translation-section",
      order: 2,
      placement: "top",
      // NEW: Navigate to Games tab and start its tutorial
      navigationAction: {
        type: "navigate_tab",
        tabName: "Games",
        startTutorial: "games_tutorial",
      },
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
      tagalogText:
        "Matuto ng bagong vocabulary araw-araw! I-tap ang card para marinig ang pronunciation at kolektahin ang inyong daily coins.",
      target: "games-word-of-day-section",
      order: 1,
      placement: "bottom",
    },
    {
      id: "game-modes-section",
      text: "Practice Filipino languages through fun games! Choose from 3 game modes: Multiple Choice, Word Identification, and Fill in the Blank. Use your coins to buy hints and check your progress here. Finally, let's explore pronunciation guides in the Pronounce tab!",
      tagalogText:
        "Mag-practice ng Filipino languages sa pamamagitan ng masayang mga laro! Pumili sa 3 game modes: Multiple Choice, Word Identification, at Fill in the Blank. Gamitin ang inyong coins para bumili ng hints at tingnan ang inyong progress dito. Sa wakas, i-explore natin ang pronunciation guides sa Pronounce tab!",
      target: "games-modes-section",
      order: 2,
      placement: "top",
      // NEW: Navigate to Pronounce tab and start its tutorial
      navigationAction: {
        type: "navigate_tab",
        tabName: "Pronounce",
        startTutorial: "pronounce_tutorial",
      },
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
      tagalogText:
        "Gamitin ang search bar na ito para mabilis na mahanap ang mga specific na salita o phrases. Mag-type ng kahit anong English word, translation, o pronunciation guide para i-filter agad ang vocabulary list.",
      target: "pronounce-search-bar",
      order: 1,
      placement: "bottom",
    },
    {
      id: "language-dropdown",
      text: "Select your target Filipino language here. Choose from various dialects like Cebuano, Tagalog, Ilocano, and more to access their specific vocabulary and pronunciation guides.",
      tagalogText:
        "Piliin ang inyong target Filipino language dito. Pumili sa iba't ibang dialects tulad ng Cebuano, Tagalog, Ilocano, at iba pa para ma-access ang kanilang specific vocabulary at pronunciation guides.",
      target: "pronounce-language-dropdown",
      order: 2,
      placement: "bottom",
    },
    {
      id: "pronunciation-card",
      text: "Each card shows an English word with its translation and pronunciation guide. Press the play button to hear the correct pronunciation. The card highlights when audio is playing, helping you learn proper dialect pronunciation. Congratulations! You've completed the full WikaTalk tutorial tour!",
      tagalogText:
        "Bawat card ay nagpapakita ng English word kasama ang translation at pronunciation guide. I-press ang play button para marinig ang tamang pronunciation. Ang card ay nag-highlight kapag tumutugtog ang audio, tumutulong sa inyo na matuto ng tamang dialect pronunciation. Congratulations! Natapos ninyo na ang buong WikaTalk tutorial tour!",
      target: "pronounce-pronunciation-card",
      order: 3,
      placement: "top",
      // NOTE: No navigation action here - this is the final tutorial
    },
  ],
};
