import { LANGUAGE_BACKGROUND } from "@/constant/languages";

const getLanguageBackground = (language: string) => {
  return (
    LANGUAGE_BACKGROUND[language] ||
    require("@/assets/images/languages/tagalog-bg.jpg")
  );
};

export default getLanguageBackground;
