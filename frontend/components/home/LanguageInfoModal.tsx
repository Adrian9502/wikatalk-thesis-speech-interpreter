import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MapPin, MessageCircle, X, Info } from "react-native-feather";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";
import { LinearGradient } from "expo-linear-gradient";

interface LanguageInfoModalProps {
  visible: boolean;
  languageName: string;
  onClose: () => void;
}

const LanguageInfoModal: React.FC<LanguageInfoModalProps> = ({
  visible,
  languageName,
  onClose,
}) => {
  if (!visible || !languageName || !LANGUAGE_INFO[languageName]) {
    return null;
  }

  const languageInfo = LANGUAGE_INFO[languageName];

  // Modern color scheme
  const colors = {
    primary: "#4A6FFF", // Primary blue
    secondary: "#FF6F4A", // Secondary accent
    background: "#FFFFFF",
    cardBg: "#F9FAFF", // Light blue tint for cards
    text: "#212132",
    textLight: "#9E9EA7",
    accent: "#10B981", // Success/accent color
    border: "#E8E8ED",
    overlay: "rgba(33, 33, 50, 0.75)",
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        {/* Header with close button */}
        <LinearGradient
          colors={[colors.primary, "#6A8AFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, { color: colors.background }]}>
              {languageName} Dialect
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X
              width={18}
              height={18}
              strokeWidth={2}
              stroke={colors.background}
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Image Banner */}
        <View style={styles.imageBanner}>
          <Image
            source={getLanguageBackground(languageName)}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent"]}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.regionBadge}>
            <Text style={styles.regionText}>{languageInfo.region}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Major Cities */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MapPin
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Major Cities
              </Text>
            </View>
            <View style={styles.tagsContainer}>
              {languageInfo.majorCities.map((city, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text }}>{city}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Common Phrases */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MessageCircle
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Common Phrases
              </Text>
            </View>
            <View style={styles.cardsContainer}>
              <View
                style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.primary }]}>
                  Hello
                </Text>
                <Text style={[styles.phraseText, { color: colors.text }]}>
                  {languageInfo.commonGreetings.hello}
                </Text>
              </View>
              <View
                style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.primary }]}>
                  Thank You
                </Text>
                <Text style={[styles.phraseText, { color: colors.text }]}>
                  {languageInfo.commonGreetings.thankYou}
                </Text>
              </View>
            </View>
          </View>

          {/* Cultural Info */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Info
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Cultural Notes
              </Text>
            </View>
            <View
              style={[styles.culturalBox, { backgroundColor: colors.cardBg }]}
            >
              <View style={styles.culturalItem}>
                <Text style={[styles.culturalLabel, { color: colors.primary }]}>
                  Symbol
                </Text>
                <Text style={{ color: colors.text }}>
                  {languageInfo.symbol}
                </Text>
              </View>

              <View>
                <Text style={[styles.culturalLabel, { color: colors.primary }]}>
                  Fun Fact
                </Text>
                <Text style={{ color: colors.text, lineHeight: 20 }}>
                  {languageInfo.fact}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBanner: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  regionBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 111, 74, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  regionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 17,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: -4,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  phraseCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  phraseLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  phraseText: {
    fontSize: 16,
    fontWeight: "500",
  },
  culturalBox: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  culturalItem: {
    marginBottom: 16,
  },
  culturalLabel: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
});

export default LanguageInfoModal;
