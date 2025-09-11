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
  const werByDialect: { [key: string]: { [key: string]: string | number } } = {
    bik: {
      WER_Trained: 10.70,
      WER_Not_Trained: 60.00,
      Classification: "Good",
    },
    ceb: {
      WER_Trained: 12.77,
      WER_Not_Trained: 50.73,
      Classification: "Good",
    },
    hil: {
      WER_Trained: 4.44,
      WER_Not_Trained: 57.11,
      Classification: "Excellent",
    },
    ilo: {
      WER_Trained: 7.73,
      WER_Not_Trained: 87.72,
      Classification: "High Accuracy",
    },
    mrw: {
      WER_Trained: 11.39,
      WER_Not_Trained: 83.50,
      Classification: "Good",
    },
    pag: {
      WER_Trained: 8.69,
      WER_Not_Trained: 84.39,
      Classification: "High Accuracy",
    },
    tgl: {
      WER_Trained: 12.16,
      WER_Not_Trained: 26.28,
      Classification: "Good",
    },
    war: {
      WER_Trained: 15.05,
      WER_Not_Trained: 74.36,
      Classification: "Good",
    },
    pam: {
      WER_Trained: 11.68,
      WER_Not_Trained: 79.13,
      Classification: "Good",
    },
    bisaya: {
      WER_Trained: 8.31,
      WER_Not_Trained: 65.19,
      Classification: "High Accuracy",
    },
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
    const wer = werByDialect[langKey] || { WER_Trained: 15, WER_Not_Trained: 75, Classification: "Unknown" };
    const accuracy =
      Math.round(
        (Number(wer.WER_Not_Trained) - Number(wer.WER_Trained)) * 100
      ) / 100;

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
        const werData = werByDialect[code];
        const werTrained = werData && typeof werData.WER_Trained === "number" ? werData.WER_Trained : 15;
        const werNotTrained = werData && typeof werData.WER_Not_Trained === "number" ? werData.WER_Not_Trained : 75;
        const accuracy = Math.round((werNotTrained - werTrained) * 100) / 100;
        return {
          displayName,
          accuracy,
          wer: werTrained,
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
              wer={typeof wer.WER_Trained === "number" ? wer.WER_Trained : 0}
              color={color}
              confidenceLevel={confidenceLevel}
              description={description}
            />

            {/* What This Means Section */}
            <InfoSection language={language} wer={typeof wer === "number" ? wer : 0} />

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
