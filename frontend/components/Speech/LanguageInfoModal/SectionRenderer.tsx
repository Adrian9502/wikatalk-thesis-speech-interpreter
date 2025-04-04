import React from "react";
import { Section } from "@/types/languageInfo";
import BannerSection from "./BannerSection";
import CitiesSection from "./CitiesSection";
import PhrasesSection from "./PhrasesSection";
import CulturalSection from "./CulturalSection";

interface SectionRendererProps {
  item: Section;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    cardBg: string;
    text: string;
    textLight: string;
    accent: string;
    border: string;
  };
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ item, colors }) => {
  switch (item.type) {
    case "banner":
      return <BannerSection data={item.data} />;

    case "cities":
      return <CitiesSection data={item.data} colors={colors} />;

    case "phrases":
      return <PhrasesSection data={item.data} colors={colors} />;

    case "cultural":
      return <CulturalSection data={item.data} colors={colors} />;

    default:
      return null;
  }
};

export default SectionRenderer;
