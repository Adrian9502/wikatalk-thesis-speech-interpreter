import { useMemo } from "react";
import { usePronunciationStore } from "@/store/usePronunciationStore";

export const useTotalPronunciationsCount = () => {
  const { transformedData } = usePronunciationStore();

  return useMemo(() => {
    if (!transformedData || Object.keys(transformedData).length === 0) {
      return "34K+"; // Fallback to hardcoded value
    }

    // Get unique English words across all languages
    const uniqueEnglishWords = new Set<string>();

    Object.values(transformedData).forEach((languageItems) => {
      languageItems.forEach((item) => {
        uniqueEnglishWords.add(item.english);
      });
    });

    const totalCount = uniqueEnglishWords.size;

    // Format the count nicely
    if (totalCount >= 1000) {
      return `${Math.floor(totalCount / 1000)}K+`;
    }

    return totalCount.toString();
  }, [transformedData]);
};
