import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { AlertCircle, X, Info, BarChart2 } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import CloseButton from "./games/buttons/CloseButton";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";

interface ConfidenceModalProps {
  visible: boolean;
  language: string;
  onClose: () => void;
}

const ConfidenceModal: React.FC<ConfidenceModalProps> = ({
  visible,
  language,
  onClose,
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
          <View
            style={[
              styles.header,
              { backgroundColor: activeTheme.backgroundColor },
            ]}
          >
            <Text style={styles.headerTitle}>Translation Accuracy</Text>
            <CloseButton onPress={onClose} size={15} />
          </View>

          <ScrollView
            bounces={false}
            overScrollMode="never"
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Language Stats */}
            <View style={styles.currentStatsSection}>
              <View style={styles.languageHeader}>
                <Text style={styles.languageName}>{language}</Text>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{currentRank} of 10</Text>
                </View>
              </View>

              <View style={[styles.accuracyCard, { borderLeftColor: color }]}>
                <View style={styles.accuracyMain}>
                  <View style={styles.accuracyNumber}>
                    <Text style={[styles.accuracyValue, { color }]}>
                      {accuracy.toFixed(1)}%
                    </Text>
                    <Text style={styles.accuracyLabel}>Accuracy</Text>
                  </View>

                  <View style={styles.werInfo}>
                    <Text style={styles.werLabel}>Word Error Rate</Text>
                    <Text style={styles.werValue}>{wer.toFixed(1)}%</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: `${color}15` },
                  ]}
                >
                  <View
                    style={[styles.confidenceDot, { backgroundColor: color }]}
                  />
                  <Text style={[styles.confidenceText, { color }]}>
                    {confidenceLevel === "high"
                      ? "High Confidence"
                      : confidenceLevel === "medium"
                      ? "Moderate Confidence"
                      : "Lower Confidence"}
                  </Text>
                </View>

                <Text style={styles.description}>{description}</Text>
              </View>
            </View>

            {/* What This Means Section */}
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Info width={16} height={16} color={BASE_COLORS.blue} />
                <Text style={styles.sectionTitle}>What This Means</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  Translation accuracy is measured using Word Error Rate (WER),
                  which indicates how many words might be incorrectly translated
                  out of 100 words.
                </Text>
                <Text style={styles.infoText}>
                  A lower WER means higher accuracy. {language} has a{" "}
                  {wer.toFixed(1)}% error rate, meaning approximately{" "}
                  {Math.round(wer)} out of every 100 words might need review.
                </Text>
              </View>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <View style={styles.sectionHeader}>
                <BarChart2 width={16} height={16} color={BASE_COLORS.orange} />
                <Text style={styles.sectionTitle}>Tips for Better Results</Text>
              </View>

              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Speak clearly and at moderate pace
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>Minimize background noise</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Use standard pronunciation when possible
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>
                    Keep recordings between 2-30 seconds
                  </Text>
                </View>
              </View>
            </View>

            {/* Language Ranking */}
            <View style={styles.rankingSection}>
              <View style={styles.rankingTitle}>
                <BarChart2 width={16} height={16} color={BASE_COLORS.orange} />
                <Text style={styles.sectionTitle}>Accuracy Rankings</Text>
              </View>
              <Text style={styles.rankingSubtitle}>
                How {language} compares to other dialects
              </Text>

              <View style={styles.rankingList}>
                {allStats.slice(0, 5).map((stat, index) => (
                  <View
                    key={stat.displayName}
                    style={[
                      styles.rankingItem,
                      stat.isSelected && styles.rankingItemSelected,
                    ]}
                  >
                    <View style={styles.rankingLeft}>
                      <Text
                        style={[
                          styles.rankingPosition,
                          stat.isSelected && styles.rankingPositionSelected,
                        ]}
                      >
                        #{index + 1}
                      </Text>
                      <Text
                        style={[
                          styles.rankingLanguage,
                          stat.isSelected && styles.rankingLanguageSelected,
                        ]}
                      >
                        {stat.displayName}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.rankingAccuracy,
                        stat.isSelected && styles.rankingAccuracySelected,
                      ]}
                    >
                      {stat.accuracy.toFixed(1)}%
                    </Text>
                  </View>
                ))}

                {currentRank > 5 && (
                  <>
                    <View style={styles.rankingDivider}>
                      <Text style={styles.rankingDividerText}>...</Text>
                    </View>
                    <View
                      style={[styles.rankingItem, styles.rankingItemSelected]}
                    >
                      <View style={styles.rankingLeft}>
                        <Text
                          style={[
                            styles.rankingPosition,
                            styles.rankingPositionSelected,
                          ]}
                        >
                          #{currentRank}
                        </Text>
                        <Text
                          style={[
                            styles.rankingLanguage,
                            styles.rankingLanguageSelected,
                          ]}
                        >
                          {language}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.rankingAccuracy,
                          styles.rankingAccuracySelected,
                        ]}
                      >
                        {accuracy.toFixed(1)}%
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    position: "relative",
  },
  headerTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  content: {
    maxHeight: 500,
  },
  currentStatsSection: {
    padding: 20,
    paddingBottom: 0,
  },
  languageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  languageName: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.darkText,
  },
  rankBadge: {
    backgroundColor: BASE_COLORS.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.orange,
  },
  accuracyCard: {
    backgroundColor: "#FAF9F6",
    borderWidth: 0.5,
    borderColor: "#F0EAD6",
    borderRadius: 20,
    padding: 16,
  },
  accuracyMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accuracyNumber: {
    alignItems: "flex-start",
  },
  accuracyValue: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: POPPINS_FONT.bold,
  },
  accuracyLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    marginTop: -4,
  },
  werInfo: {
    alignItems: "flex-end",
  },
  werLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
  },
  werValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.danger,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
  },
  description: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    lineHeight: 18,
  },
  infoSection: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rankingTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: "rgba(74, 111, 255, 0.05)",
    borderRadius: 20,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  infoText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 18,
    marginBottom: 8,
  },
  tipsSection: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  tipsList: {
    backgroundColor: "rgba(255, 111, 74, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.orange,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BASE_COLORS.orange,
    marginTop: 7,
    marginRight: 10,
  },
  tipText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 18,
    flex: 1,
  },
  rankingSection: {
    padding: 20,
    paddingTop: 16,
  },
  rankingSubtitle: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    marginBottom: 12,
    marginTop: 5,
  },
  rankingList: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },
  rankingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BASE_COLORS.borderColor,
  },
  rankingItemSelected: {
    backgroundColor: BASE_COLORS.lightPink,
    borderBottomColor: BASE_COLORS.orange,
  },
  rankingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankingPosition: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    width: 24,
  },
  rankingPositionSelected: {
    color: BASE_COLORS.orange,
  },
  rankingLanguage: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    marginLeft: 8,
  },
  rankingLanguageSelected: {
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.orange,
  },
  rankingAccuracy: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
  },
  rankingAccuracySelected: {
    color: BASE_COLORS.orange,
  },
  rankingDivider: {
    padding: 8,
    alignItems: "center",
  },
  rankingDividerText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    color: BASE_COLORS.placeholderText,
  },
});

export default ConfidenceModal;
