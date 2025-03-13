import { Audio } from "expo-av";
import { ImageSourcePropType } from "react-native";
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

export interface HomeSectionProps {
  textfield: string;
  language: string;
  languageBackground: string;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  dialects: { label: string; value: string }[];
  showInfo: (language: string, section: "top" | "bottom") => void;
  copyToClipboard: (text: string) => Promise<void>;
  clearText: (section: "top" | "bottom") => void;
  handleMicPress: (event: number) => Promise<void>;
  isRecording: Audio.Recording | undefined;
  activeUser: number;
  userId: number;
}
export interface ControlButtonsProps {
  // Basic properties
  showInfoHandler: (language: string, section: "top" | "bottom") => void;
  copyHandler: (text: string) => Promise<void>;
  clearTextHandler: (section: "top" | "bottom") => void;

  // Data needed for handlers
  languageValue: string;
  textValue: string;
  position: "top" | "bottom";

  // Optional props with default values
  buttonBgColor?: string;
  successColor?: string;
}
export interface LanguageSectionProps {
  position: "top" | "bottom";
  language: string;
  textField: string;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
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
