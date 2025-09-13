import { Section, SectionDataProps } from "@/types/languageInfo";

export const createSections = ({
  languageName,
  languageInfo,
  backgroundImage,
}: SectionDataProps): Section[] => {
  return [
    // Banner section
    {
      id: "banner",
      type: "banner",
      data: {
        backgroundImage,
        region: languageInfo.region,
      },
    },
    // Cities section
    {
      id: "cities",
      type: "cities",
      data: { cities: languageInfo.majorCities },
    },
    // Phrases section
    {
      id: "phrases",
      type: "phrases",
      data: {
        hello: languageInfo.commonGreetings.hello,
        thankYou: languageInfo.commonGreetings.thankYou,
      },
    },
    // Cultural section
    {
      id: "cultural",
      type: "cultural",
      data: { symbol: languageInfo.symbol, fact: languageInfo.fact },
    },
  ];
};
