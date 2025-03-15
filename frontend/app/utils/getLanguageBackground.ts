import { LANGUAGE_BACKGROUND } from "@/app/constant/languages";
import { ImageSourcePropType } from "react-native";

const getLanguageBackground = (language: string): ImageSourcePropType => {
  return (
    LANGUAGE_BACKGROUND[language] ||
    require("@/assets/images/languages/tagalog-bg.jpg")
  );
};

export default getLanguageBackground;
