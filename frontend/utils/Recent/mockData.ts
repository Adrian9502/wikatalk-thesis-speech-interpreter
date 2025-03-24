import { HistoryItems } from "@/types/types";

export const MOCK_HISTORY_DATA: HistoryItems = {
  Speech: [
    {
      id: "1",
      date: "Mar. 20, 2025 - 10:30am",
      fromLanguage: "Tagalog",
      toLanguage: "Bisaya",
      originalText: "Kumusta ka? Maganda ang araw ngayon.",
      translatedText: "Kumusta ka? Nindot ang adlaw karon.",
    },
    {
      id: "2",
      date: "Mar. 19, 2025 - 3:45pm",
      fromLanguage: "Bisaya",
      toLanguage: "Tagalog",
      originalText: "Unsa imong pangalan? Taga asa ka?",
      translatedText: "Ano ang pangalan mo? Taga saan ka?",
    },
  ],
  Translate: [
    {
      id: "3",
      date: "Mar. 18, 2025 - 2:15pm",
      fromLanguage: "English",
      toLanguage: "Tagalog",
      originalText: "I would like to learn more about Filipino culture.",
      translatedText: "Gusto kong matuto pa tungkol sa kulturang Pilipino.",
    },
  ],
  Scan: [
    {
      id: "4",
      date: "Mar. 17, 2025 - 9:20am",
      fromLanguage: "English",
      toLanguage: "Bisaya",
      originalText: "No parking. Violators will be towed.",
      translatedText: "Ayaw pagparking. Ang mga malapas kuhaon.",
    },
  ],
};
