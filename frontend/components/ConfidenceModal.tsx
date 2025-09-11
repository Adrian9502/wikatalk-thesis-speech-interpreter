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

  // CORRECTED: Updated WER data based on research with proper structure
  const werByDialect: {
    [key: string]: {
      WER_Untrained: number;
      WER_Trained: number;
      PercentageDecrease: number;
      Classification: string;
      AudioDuration?: number;
    };
  } = {
    bik: {
      WER_Untrained: 60.0,
      WER_Trained: 10.7,
      PercentageDecrease: 82.17,
      Classification: "Good",
      AudioDuration: 4729.6,
    },
    ceb: {
      WER_Untrained: 50.73,
      WER_Trained: 12.77,
      PercentageDecrease: 74.83,
      Classification: "Good",
      AudioDuration: 43826.04,
    },
    hil: {
      WER_Untrained: 57.11,
      WER_Trained: 4.44,
      PercentageDecrease: 92.23,
      Classification: "Excellent",
      AudioDuration: 5794.69,
    },
    ilo: {
      WER_Untrained: 87.72,
      WER_Trained: 7.73,
      PercentageDecrease: 91.19,
      Classification: "High Accuracy",
      AudioDuration: 5569.83,
    },
    mrw: {
      WER_Untrained: 83.5,
      WER_Trained: 11.39,
      PercentageDecrease: 86.36,
      Classification: "Good",
      AudioDuration: 6387.01,
    },
    pag: {
      WER_Untrained: 84.39,
      WER_Trained: 8.69,
      PercentageDecrease: 89.7,
      Classification: "High Accuracy",
      AudioDuration: 14518.55,
    },
    tgl: {
      WER_Untrained: 26.28,
      WER_Trained: 12.16,
      PercentageDecrease: 53.73,
      Classification: "Good",
      AudioDuration: 27752.52,
    },
    war: {
      WER_Untrained: 74.36,
      WER_Trained: 15.05,
      PercentageDecrease: 79.76,
      Classification: "Good",
      AudioDuration: 5233.41,
    },
    pam: {
      WER_Untrained: 79.13,
      WER_Trained: 11.68,
      PercentageDecrease: 85.24,
      Classification: "Good",
      AudioDuration: 4865.35,
    },
    bisaya: {
      WER_Untrained: 65.19,
      WER_Trained: 8.31,
      PercentageDecrease: 87.25,
      Classification: "High Accuracy",
      // AudioDuration: NaN in research
    },
  };

  // CORRECTED: Updated language name mapping
  const languageMapping: { [key: string]: string } = {
    Tagalog: "tgl",
    Cebuano: "ceb",
    Hiligaynon: "hil",
    Ilocano: "ilo",
    Bikol: "bik", // Fixed: was "Bicol"
    Bikolano: "bik", // Added alternative name
    Waray: "war",
    Pangasinan: "pag",
    Maranao: "mrw", // Fixed: was "Maguindanao"
    Kapampangan: "pam", // Fixed: was "Kapampangan"
    Pampanga: "pam", // Added alternative name
    Bisaya: "bisaya",
  };

  const getLanguageKey = (languageName: string): string => {
    if (!languageName || typeof languageName !== "string") {
      return "unknown";
    }
    const trimmedName = languageName.trim();
    return languageMapping[trimmedName] || trimmedName.toLowerCase();
  };

  // CORRECTED: Proper accuracy and confidence calculations
  const getConfidenceData = (lang: string) => {
    const langKey = getLanguageKey(lang);
    const werData = werByDialect[langKey] || {
      WER_Untrained: 75,
      WER_Trained: 15,
      PercentageDecrease: 80,
      Classification: "Unknown",
    };

    // FIXED: Proper accuracy calculation
    // Accuracy = 100 - WER (since WER is error rate)
    const trainedAccuracy = Math.round((100 - werData.WER_Trained) * 100) / 100;
    const untrainedAccuracy =
      Math.round((100 - werData.WER_Untrained) * 100) / 100;

    // Performance improvement (how much accuracy gained)
    const accuracyImprovement =
      Math.round((trainedAccuracy - untrainedAccuracy) * 100) / 100;

    // Use research-based percentage decrease
    const percentageDecrease = werData.PercentageDecrease;

    // FIXED: Classification based on research WER ranges
    let confidenceLevel: "high" | "medium" | "low" = "medium";
    let color = BASE_COLORS.orange;
    let description = "";

    if (werData.WER_Trained <= 5) {
      // Excellent (≤5% WER)
      confidenceLevel = "high";
      color = BASE_COLORS.success;
      description = "Excellent transcription accuracy. Very reliable results.";
    } else if (werData.WER_Trained <= 10) {
      // High Accuracy (>5% WER ≤10% WER)
      confidenceLevel = "high";
      color = BASE_COLORS.success;
      description = "High transcription accuracy. Very reliable results.";
    } else if (werData.WER_Trained <= 25) {
      // Good (>10% WER ≤25% WER)
      confidenceLevel = "medium";
      color = BASE_COLORS.orange;
      description = "Good transcription accuracy. Generally reliable results.";
    } else {
      // Moderate or Poor (>25% WER)
      confidenceLevel = "low";
      color = BASE_COLORS.danger;
      description = "Lower transcription accuracy. Results may need review.";
    }

    return {
      trainedAccuracy,
      untrainedAccuracy,
      accuracyImprovement,
      percentageDecrease,
      werData,
      confidenceLevel,
      color,
      description,
    };
  };

  const {
    trainedAccuracy,
    untrainedAccuracy,
    accuracyImprovement,
    percentageDecrease,
    werData,
    confidenceLevel,
    color,
    description,
  } = getConfidenceData(language);

  // CORRECTED: Get all languages sorted by trained accuracy for comparison
  const getAllLanguageStats = () => {
    return Object.entries(languageMapping)
      .map(([displayName, code]) => {
        const data = werByDialect[code];
        if (!data) return null;

        const trainedAccuracy =
          Math.round((100 - data.WER_Trained) * 100) / 100;
        const werTrained = data.WER_Trained;

        return {
          displayName,
          trainedAccuracy,
          wer: werTrained,
          percentageDecrease: data.PercentageDecrease,
          classification: data.Classification,
          isSelected: displayName === language,
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b!.trainedAccuracy - a!.trainedAccuracy); // Sort by accuracy (highest first)
  };

  const allStats = getAllLanguageStats();
  const currentRank = allStats.findIndex((stat) => stat?.isSelected) + 1;

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
              accuracy={trainedAccuracy} // Now shows actual accuracy %
              wer={werData.WER_Trained} // Shows trained WER
              untrainedAccuracy={untrainedAccuracy} // Additional metric
              accuracyImprovement={accuracyImprovement} // Shows improvement in accuracy points
              percentageDecrease={percentageDecrease} // Shows research-based % decrease
              color={color}
              confidenceLevel={confidenceLevel}
              description={description}
              classification={werData.Classification} // Research-based classification
            />

            {/* What This Means Section */}
            <InfoSection
              language={language}
              wer={werData.WER_Trained}
              untrainedWer={werData.WER_Untrained}
              percentageDecrease={percentageDecrease}
              classification={werData.Classification}
            />

            {/* Tips Section - Show both speech and OCR tips if type is OCR */}
            {type === "ocr" && <TipsSection type="ocr" />}
            <TipsSection type="speech" />

            {/* Language Ranking */}
            <AccuracyRankings
              language={language}
              allStats={allStats}
              currentRank={currentRank}
              accuracy={trainedAccuracy}
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
