import { FAQItem } from "@/types/faqItems";
const faqItems: FAQItem[] = [
  {
    id: 1,
    category: "general",
    question: "What is WikaTalk?",
    answer:
      "WikaTalk is a language translation application designed specifically for Filipino dialects to improve communication among locals and tourists in the Philippines. It supports 10 Filipino dialects: Tagalog, Cebuano, Hiligaynon, Ilocano, Bicol, Waray, Pangasinan, Maguindanao, Kapampangan, and Bisaya.",
  },
  {
    id: 2,
    category: "general",
    question: "Which dialects are supported?",
    answer:
      "WikaTalk currently supports 10 Filipino dialects: Tagalog, Cebuano, Hiligaynon, Ilocano, Bicol, Waray, Pangasinan, Maguindanao, Kapampangan, and Bisaya.",
  },
  {
    id: 3,
    category: "features",
    question: "What are the main features of WikaTalk?",
    answer:
      "WikaTalk offers multiple translation methods:\n\n• Speech-to-speech translation\n• Text translation\n• Scan-to-text-translate\n• Recent translations history\n• Pronunciation guide\n• Word of the Day\n• Interactive language games\n• Ranking system with competitive leaderboards\n• Coin rewards system\n• Daily rewards\n• Customizable themes with 28 color options",
  },
  {
    id: 4,
    category: "features",
    question: "How does speech-to-speech translation work?",
    answer:
      "To use speech-to-speech translation:\n\n1. Select your source and target dialects\n2. Tap the microphone button and speak (maximum 30 seconds)\n3. The app will transcribe your speech and translate it\n4. You can edit the detected text if needed\n5. Use the speaker icon to hear the translation\n6. Copy or delete translations as needed",
  },
  {
    id: 5,
    category: "features",
    question: "What is the scan-to-text-translate feature?",
    answer:
      "This feature allows you to scan written text and translate it. Simply point your camera at the text, capture it, and WikaTalk will translate it to your chosen dialect. Note that there is a limit of 1500 photo scans due to API restrictions.",
  },
  {
    id: 6,
    category: "features",
    question: "How many game types are there?",
    answer:
      "WikaTalk offers 3 interactive game types to help you learn Filipino dialects:\n\n• Multiple Choice - Choose from 4 answer options\n• Identification - Select from 8 choices with translation hints available\n• Fill in the Blanks - Complete sentences with 2 attempts plus hint and translation buttons to make answering easier",
  },
  {
    id: 7,
    category: "features",
    question: "How many quiz levels can I play?",
    answer:
      "There are 150 total quiz levels across all game modes:\n\n• 50 levels per game mode (Multiple Choice, Identification, Fill in the Blanks)\n• Each mode has:\n  - 10 Easy levels\n  - 20 Medium levels\n  - 20 Hard levels\n\nThis gives you plenty of content to practice and improve your Filipino dialect skills!",
  },
  {
    id: 8,
    category: "features",
    question: "How do I unlock other difficulties?",
    answer:
      "Difficulties unlock progressively based on your completion:\n\n• Easy levels are available from the start\n• Medium levels unlock after completing ALL Easy levels\n• Hard levels unlock after completing ALL Medium levels\n\nYou must finish all levels in the previous difficulty to access the next one. This ensures you build a strong foundation before tackling more challenging content.",
  },
  {
    id: 9,
    category: "features",
    question: "Does completing a level have a reward?",
    answer:
      "Yes! You earn coins based on how quickly you complete each level and the difficulty:\n\n**Easy (0-10 coins):**\n0–10 sec: 10 coins | 10–20 sec: 9 coins | 20–30 sec: 8 coins\n30–60 sec: 7 coins | 1–2 min: 6 coins | 2–3 min: 5 coins\n3–4 min: 4 coins | 4–5 min: 3 coins | 5–10 min: 2 coins\n10–20 min: 1 coin | 20+ min: 0 coins\n\n**Medium (5-15 coins):**\nSame time brackets but +5 coins per tier\n\n**Hard (10-20 coins):**\nSame time brackets but +10 coins per tier\n\nFaster completion = higher rewards!",
  },
  {
    id: 10,
    category: "features",
    question: "Where can I use coins?",
    answer:
      "Currently, coins can be used to reset a level's progress, including its completion time and attempt count. This allows you to restart a level with a fresh slate if you want to improve your performance or try again.",
  },
  {
    id: 11,
    category: "features",
    question: "How much does it cost to reset time and attempts?",
    answer:
      "Reset costs vary based on how much time you've spent on the level:\n\n• 0–10 seconds → 20 coins\n• 11–30 seconds → 40 coins\n• 31–60 seconds → 55 coins\n• 1–2 minutes → 70 coins\n• 2–3 minutes → 90 coins\n• 3–4 minutes → 100 coins\n• 4+ minutes → 110 coins\n\nThe longer you've spent on a level, the more expensive it becomes to reset.",
  },
  {
    id: 12,
    category: "features",
    question: "Are the quiz games hard to play?",
    answer:
      "No, the quiz games are designed to be accessible and enjoyable:\n\n• Multiple Choice: 4 clear options to choose from\n• Identification: 8 options with translation button for hints\n• Fill in the Blanks: 2 attempts plus both hint and translation buttons\n\nThese features help players answer questions more easily while still providing a good learning challenge.",
  },
  {
    id: 13,
    category: "features",
    question: "Is there a daily reward? If yes, how many coins can I get?",
    answer:
      "Yes! WikaTalk offers daily coin rewards:\n\n• Weekdays (Monday-Friday): 25 coins per day\n• Weekends (Saturday-Sunday): 50 coins per day\n\nMake sure to claim your daily reward to maximize your coin earnings!",
  },
  {
    id: 14,
    category: "features",
    question: "Is there a ranking system?",
    answer:
      "Yes! WikaTalk features a competitive ranking system to motivate players with these categories:\n\n• 🏆 Quiz Champions – Most quizzes completed\n• 🪙 Coin Masters – Highest coin balance  \n• ⚡ Speed Demons – Best average completion time\n• 📊 Consistency Kings – Highest completion rate\n\nCompete with other players and climb the leaderboards!",
  },
  {
    id: 15,
    category: "features",
    question: "What is the Word of the Day feature?",
    answer:
      "The Word of the Day feature shows a new word daily with its translation and pronunciation to help you learn different Philippine languages progressively.",
  },
  {
    id: 16,
    category: "features",
    question: "How do I change the app theme?",
    answer:
      "You can personalize your experience by choosing from 28 different theme colors across black, blue, red, and yellow shades. Go to Settings and select the Theme option to change colors. Your theme preferences will be saved to your account.",
  },
  {
    id: 17,
    category: "account",
    question: "How do I create an account?",
    answer:
      "You can register with an email address, which requires Gmail verification, or sign in directly using your Google account for quick and convenient access.",
  },
  {
    id: 18,
    category: "account",
    question: "How do I update my profile information?",
    answer:
      "In the Settings section, you can change your profile picture and update account details including username, full name, and password.",
  },
  {
    id: 19,
    category: "account",
    question: "I forgot my password. What should I do?",
    answer:
      'Use the "Forgot Password" option on the login screen. The app will send password reset instructions to your registered email address.',
  },
  {
    id: 20,
    category: "translation",
    question: "Is there a limit to how much text I can translate?",
    answer:
      "For text translation, there is no character limit, ensuring a flexible translation experience. However, for speech translation, there is a 30-second limit before translation occurs.",
  },
  {
    id: 21,
    category: "translation",
    question: "How accurate are the translations?",
    answer:
      "While we strive for accuracy, the translation model was trained on a limited dataset. Some limitations include:\n\n• Less accurate accents\n• Slang is not included\n• Some subtle cultural nuances may be lost\n• Words with multiple meanings may be difficult to interpret accurately",
  },
  {
    id: 22,
    category: "limitations",
    question: "What are the known limitations of WikaTalk?",
    answer:
      "Some limitations include:\n\n• Limited processing capacity (about 15 requests per minute)\n• 30-second speaking duration limit\n• Cannot handle background noise well\n• Some dialects may have less accurate translations\n• Limited scan-to-text capacity (1500 scans)\n• No offline mode support\n• Text scanning may have difficulty with certain fonts or sizes",
  },
  {
    id: 23,
    category: "limitations",
    question: "Does WikaTalk work offline?",
    answer:
      "Currently, WikaTalk requires an internet connection to function. Offline mode is not supported at this time.",
  },
  {
    id: 24,
    category: "limitations",
    question: "Is there a limit to the scan-to-text feature?",
    answer:
      "Yes, the scan-to-text-translate feature is limited to 1500 photo scans due to API restrictions.",
  },
  {
    id: 25,
    category: "troubleshooting",
    question: "The speech recognition doesn't work properly. What should I do?",
    answer:
      "For best speech recognition results:\n\n• Speak clearly and at a moderate pace\n• Minimize background noise\n• Keep your device microphone unobstructed\n• Stay within the 30-second time limit\n• Try moving to a quieter environment",
  },
  {
    id: 26,
    category: "troubleshooting",
    question: "The translation seems incorrect. What can I do?",
    answer:
      "If a translation seems incorrect, you can:\n\n• Edit the detected text to correct any errors\n• Try rephrasing your input\n• Use simpler words or phrases\n• Check if you're using dialect-specific slang that might not be recognized",
  },
  {
    id: 27,
    category: "troubleshooting",
    question: "Why is the scan-to-text feature not recognizing text properly?",
    answer:
      "The scan-to-text feature may have difficulty with:\n\n• Unusual fonts or handwriting\n• Very small text\n• Poor lighting conditions\n• Blurry images\n• Text at odd angles\n\nTry improving lighting, keeping the text flat, and holding your device steady.",
  },
  {
    id: 28,
    category: "general",
    question: "How do I access the cultural information about a dialect?",
    answer:
      "When using the translation features, you can view information about your selected dialect, including famous feasts, regions that use the dialect, symbols representing that dialect, common phrases, cultural notes, and fun facts.",
  },
];

export default faqItems;
