import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MapPin, MessageCircle, X, Info } from "react-native-feather";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";
import { LinearGradient } from "expo-linear-gradient";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

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
  // Get the dynamic styles based on the current theme
  const { activeTheme } = useThemeStore();
  const languageInfo = LANGUAGE_INFO[languageName];
  const windowHeight = Dimensions.get("window").height;

  // Modern color scheme
  const colors = {
    primary: activeTheme.secondaryColor, // Primary blue
    secondary: "#FF6F4A", // Secondary accent
    background: "#FFFFFF",
    cardBg: "#F9FAFF",
    text: "#212132",
    textLight: "#9E9EA7",
    accent: "#10B981", // Success/accent color
    border: "#E8E8ED",
    overlay: "rgba(33, 33, 50, 0.75)",
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.background,
            maxHeight: windowHeight * 0.8,
          },
        ]}
      >
        {/* Header with close button */}
        <View
          style={[
            styles.header,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
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
        </View>

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
          showsVerticalScrollIndicator={true}
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
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    {city}
                  </Text>
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
                <Text
                  style={{ color: colors.text, fontFamily: "Poppins-Regular" }}
                >
                  {languageInfo.symbol}
                </Text>
              </View>

              <View>
                <Text style={[styles.culturalLabel, { color: colors.primary }]}>
                  Fun Fact
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    lineHeight: 20,
                    fontFamily: "Poppins-Regular",
                  }}
                >
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
    width: "80%",
    maxWidth: 420,
    borderRadius: 12,
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
    fontFamily: "Poppins-Medium",
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
    height: 150,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  regionText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  scrollView: {
    flexGrow: 0,
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
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: -4,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    fontFamily: "Poppins-Regular",
  },
  phraseText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginBottom: 8,
  },
});

export default LanguageInfoModal;
