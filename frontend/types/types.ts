import { Audio } from "expo-av";

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

export type ControlButtonsProps = {
  // Handler functions with original parameter names
  showInfoHandler: (language: string, section: "top" | "bottom") => void;
  copyHandler: (text: string) => void;
  clearTextHandler: (section: "top" | "bottom") => void;
  micPressHandler: (userId: number) => void;

  // Data needed for handlers
  languageValue: string;
  textValue: string;
  position: "top" | "bottom";

  // Recording state
  isRecording: Audio.Recording | undefined;
  activeUser: number | undefined;
  userId: string | number;

  // Optional props for customization
  iconColor?: string;
  buttonBgColor?: string;
  recordingColor?: string;
  successColor?: string;
};
