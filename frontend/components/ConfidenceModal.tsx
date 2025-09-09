import React from "react";
import { View, StyleSheet, Modal, ScrollView, Dimensions } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import ConfidenceModalHeader from "./confidenceModal/ConfidenceModalHeader";
import LanguageStats from "./confidenceModal/LanguageStats";
import InfoSection from "./confidenceModal/InfoSection";
import TipsSection from "./confidenceModal/TipsSection";
import AccuracyRankings from "./confidenceModal/AccuracyRankings";

interface ConfidenceModalProps {
  visible: boolean;
  language: string;
  onClose: () => void;
  type?: "speech" | "ocr";
}

const ConfidenceModal: React.FC<ConfidenceModalProps> = ({
  visible,
  language,
  onClose,
  type = "speech",
}) => {
  const { activeTheme } = useThemeStore();

  // FIXED: Add safety check for language parameter
  if (!language || typeof language !== "string") {
    return null;
  }

  // Word Error Rate data
  const werByDialect: { [key: string]: number } = {
    bik: 16.95,
    ceb: 14.66,
    hil: 7.29,
    ilo: 14.52,
    mrw: 16.77,
    pag: 19.08,
    tgl: 14.1,
    war: 19.27,
    pam: 23.67,
    bisaya: 14.87,
  };

  // Language name mapping for display
  const languageMapping: { [key: string]: string } = {
    Tagalog: "tgl",
    Cebuano: "ceb",
    Hiligaynon: "hil",
    Ilocano: "ilo",
    Bicol: "bik",
    Waray: "war",
    Pangasinan: "pag",
    Maguindanao: "mrw",
    Kapampangan: "pam",
    Bisaya: "bisaya",
  };

  const getLanguageKey = (languageName: string): string => {
    if (!languageName || typeof languageName !== "string") {
      return "unknown";
    }
    const trimmedName = languageName.trim();
    return languageMapping[trimmedName] || trimmedName.toLowerCase();
  };

  const getConfidenceData = (lang: string) => {
    const langKey = getLanguageKey(lang);
    const wer = werByDialect[langKey] || 15;
    const accuracy = Math.round((100 - wer) * 100) / 100;

    let confidenceLevel: "high" | "medium" | "low" = "medium";
    let color = BASE_COLORS.orange;
    let description = "";

    if (accuracy >= 85) {
      confidenceLevel = "high";
      color = BASE_COLORS.success;
      description = "Excellent translation accuracy. Very reliable results.";
    } else if (accuracy >= 80) {
      confidenceLevel = "medium";
      color = BASE_COLORS.orange;
      description = "Good translation accuracy. Generally reliable results.";
    } else {
      confidenceLevel = "low";
      color = BASE_COLORS.danger;
      description = "Lower translation accuracy. Results may need review.";
    }

    return { accuracy, wer, confidenceLevel, color, description };
  };

  const { accuracy, wer, confidenceLevel, color, description } =
    getConfidenceData(language);

  // Get all languages sorted by accuracy for comparison
  const getAllLanguageStats = () => {
    return Object.entries(languageMapping)
      .map(([displayName, code]) => {
        const wer = werByDialect[code] || 15;
        const accuracy = Math.round((100 - wer) * 100) / 100;
        return {
          displayName,
          accuracy,
          wer,
          isSelected: displayName === language,
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy);
  };

  const allStats = getAllLanguageStats();
  const currentRank = allStats.findIndex((stat) => stat.isSelected) + 1;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: BASE_COLORS.white,
              maxHeight: Dimensions.get("window").height * 0.8,
            },
          ]}
        >
          {/* Header */}
          <ConfidenceModalHeader
            backgroundColor={activeTheme.backgroundColor}
            onClose={onClose}
          />

          <ScrollView
            bounces={false}
            overScrollMode="never"
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Language Stats */}
            <LanguageStats
              language={language}
              currentRank={currentRank}
              accuracy={accuracy}
              wer={wer}
              color={color}
              confidenceLevel={confidenceLevel}
              description={description}
            />

            {/* What This Means Section */}
            <InfoSection language={language} wer={wer} />

            {/* Tips Section - Show both speech and OCR tips if type is OCR */}
            {type === "ocr" && <TipsSection type="ocr" />}
            <TipsSection type="speech" />

            {/* Language Ranking */}
            <AccuracyRankings
              language={language}
              allStats={allStats}
              currentRank={currentRank}
              accuracy={accuracy}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  content: {
    maxHeight: 500,
  },
});

export default ConfidenceModal;
