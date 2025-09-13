import { ImageSourcePropType } from "react-native";

// Define interfaces for each section type
export interface BannerSection {
  id: string;
  type: "banner";
  data: {
    backgroundImage: ImageSourcePropType;
    region: string;
  };
}

export interface CitiesSection {
  id: string;
  type: "cities";
  data: {
    cities: string[];
  };
}

export interface PhrasesSection {
  id: string;
  type: "phrases";
  data: {
    hello: string;
    thankYou: string;
  };
}

export interface CulturalSection {
  id: string;
  type: "cultural";
  data: {
    symbol: string;
    fact: string;
  };
}

// Union type for all section types
export type Section =
  | BannerSection
  | CitiesSection
  | PhrasesSection
  | CulturalSection;

// Props for generating sections data
export interface SectionDataProps {
  languageName: string;
  languageInfo: any;
  backgroundImage: ImageSourcePropType;
}
