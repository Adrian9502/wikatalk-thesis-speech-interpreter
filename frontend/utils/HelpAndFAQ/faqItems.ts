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
      "WikaTalk offers multiple translation methods:\n\n• Speech-to-speech translation\n• Text translation\n• Scan-to-text-translate\n• Recent translations history\n• Pronunciation guide\n• Word of the Day\n• Language quizzes\n• Customizable themes with 28 color options",
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
    question: "How do I use the language quiz?",
    answer:
      "The Language Quiz feature tests your knowledge through easy quizzes with generated words, phrases, or sentences and multiple-choice answers. It's a fun way to learn and practice different Philippine languages.",
  },
  {
    id: 7,
    category: "features",
    question: "What is the Word of the Day feature?",
    answer:
      "The Word of the Day feature shows a new word daily with its translation and pronunciation to help you learn different Philippine languages progressively.",
  },
  {
    id: 8,
    category: "features",
    question: "How do I change the app theme?",
    answer:
      "You can personalize your experience by choosing from 28 different theme colors across black, blue, red, and yellow shades. Go to Settings and select the Theme option to change colors. Your theme preferences will be saved to your account.",
  },
  {
    id: 9,
    category: "account",
    question: "How do I create an account?",
    answer:
      "You can register with an email address, which requires Gmail verification, or sign in directly using your Google account for quick and convenient access.",
  },
  {
    id: 10,
    category: "account",
    question: "How do I update my profile information?",
    answer:
      "In the Settings section, you can change your profile picture and update account details including username, full name, and password.",
  },
  {
    id: 11,
    category: "account",
    question: "I forgot my password. What should I do?",
    answer:
      'Use the "Forgot Password" option on the login screen. The app will send password reset instructions to your registered email address.',
  },
  {
    id: 12,
    category: "translation",
    question: "Is there a limit to how much text I can translate?",
    answer:
      "For text translation, there is no character limit, ensuring a flexible translation experience. However, for speech translation, there is a 30-second limit before translation occurs.",
  },
  {
    id: 13,
    category: "translation",
    question: "How accurate are the translations?",
    answer:
      "While we strive for accuracy, the translation model was trained on a limited dataset. Some limitations include:\n\n• Less accurate accents\n• Slang is not included\n• Some subtle cultural nuances may be lost\n• Words with multiple meanings may be difficult to interpret accurately",
  },
  {
    id: 14,
    category: "limitations",
    question: "What are the known limitations of WikaTalk?",
    answer:
      "Some limitations include:\n\n• Limited processing capacity (about 15 requests per minute)\n• 30-second speaking duration limit\n• Cannot handle background noise well\n• Some dialects may have less accurate translations\n• Limited scan-to-text capacity (1500 scans)\n• No offline mode support\n• Text scanning may have difficulty with certain fonts or sizes",
  },
  {
    id: 15,
    category: "limitations",
    question: "Does WikaTalk work offline?",
    answer:
      "Currently, WikaTalk requires an internet connection to function. Offline mode is not supported at this time.",
  },
  {
    id: 16,
    category: "limitations",
    question: "Is there a limit to the scan-to-text feature?",
    answer:
      "Yes, the scan-to-text-translate feature is limited to 1500 photo scans due to API restrictions.",
  },
  {
    id: 17,
    category: "troubleshooting",
    question: "The speech recognition doesn't work properly. What should I do?",
    answer:
      "For best speech recognition results:\n\n• Speak clearly and at a moderate pace\n• Minimize background noise\n• Keep your device microphone unobstructed\n• Stay within the 30-second time limit\n• Try moving to a quieter environment",
  },
  {
    id: 18,
    category: "troubleshooting",
    question: "The translation seems incorrect. What can I do?",
    answer:
      "If a translation seems incorrect, you can:\n\n• Edit the detected text to correct any errors\n• Try rephrasing your input\n• Use simpler words or phrases\n• Check if you're using dialect-specific slang that might not be recognized",
  },
  {
    id: 19,
    category: "troubleshooting",
    question: "Why is the scan-to-text feature not recognizing text properly?",
    answer:
      "The scan-to-text feature may have difficulty with:\n\n• Unusual fonts or handwriting\n• Very small text\n• Poor lighting conditions\n• Blurry images\n• Text at odd angles\n\nTry improving lighting, keeping the text flat, and holding your device steady.",
  },
  {
    id: 20,
    category: "general",
    question: "How do I access the cultural information about a dialect?",
    answer:
      "When using the translation features, you can view information about your selected dialect, including famous feasts, regions that use the dialect, symbols representing that dialect, common phrases, cultural notes, and fun facts.",
  },
];

export default faqItems;
