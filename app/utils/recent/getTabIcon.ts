import { Feather } from "@expo/vector-icons";
import { TabType } from "@/types/types";

export const getTabIcon = (type: TabType): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "Speech":
      return "mic";
    case "Translate":
      return "globe";
    case "Scan":
      return "camera";
    default:
      return "clock";
  }
};
