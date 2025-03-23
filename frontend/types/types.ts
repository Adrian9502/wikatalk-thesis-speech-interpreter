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
