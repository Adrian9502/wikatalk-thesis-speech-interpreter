import { Audio } from "expo-av";
import { ImageSourcePropType } from "react-native";
import { Feather } from "@expo/vector-icons";
export type LanguageOption =
  | "Tagalog"
  | "Cebuano"
  | "Hiligaynon"
  | "Ilocano"
  | "Bicol"
  | "Waray"
  | "Pangasinan"
  | "Maguindanao"
  | "Kapampangan"
  | "Bisaya";

export interface LanguageSectionProps {
  position: "top" | "bottom";
  language: string;
  textField: string;
  dropdownOpen: boolean;
  setDropdownOpen: (isOpen: boolean) => void;
  setLanguage: (lang: string) => void;
  closeOtherDropdown: () => void;
  getLanguageBackground: (language: string) => string | ImageSourcePropType;
  showInfo: (language: string, section: "top" | "bottom") => void;
  copyToClipboard: (text: string) => Promise<void>;
  clearText: (section: "top" | "bottom") => void;
  handlePress: (userNum: number) => Promise<void>;
  recording: Audio.Recording | undefined;
  userId: string | number;
}
export interface MicButtonProps {
  micPressHandler: (userNum: number) => Promise<void>;
  position: "top" | "bottom";
  isRecording: Audio.Recording | undefined;
  activeUser: any;
  userId: string | number;
}

// Settings and Settings Item component
export type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

// Recent component
export type TabType = "Speech" | "Translate" | "Scan";

export interface HistoryItemType {
  id: string;
  date: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
}

export interface HistoryItems {
  Speech: HistoryItemType[];
  Translate: HistoryItemType[];
  Scan: HistoryItemType[];
}

// Theme types
export type ThemeOption = {
  name: string;
  backgroundColor: string;
  tabBarColor: string;
  secondaryColor: string;
  tabActiveColor: string;
  tabInactiveColor: string;
  lightColor: string;
};

export interface UserDataTypes {
  fullName?: string;
  email?: string;
  username?: string;
  createdAt?: string;
  isVerified?: boolean;
  profilePicture?: string;
  authProvider?: string;
}
