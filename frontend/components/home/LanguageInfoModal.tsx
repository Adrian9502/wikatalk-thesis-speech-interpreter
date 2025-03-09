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

interface LanguageInfoModalProps {
  visible: boolean;
  languageName: string;
  infoSection: "top" | "bottom" | null;
  onClose: () => void;
}

const LanguageInfoModal: React.FC<LanguageInfoModalProps> = ({
  visible,
  languageName,
  infoSection,
  onClose,
}) => {
  if (!visible || !languageName || !LANGUAGE_INFO[languageName]) {
    return null;
  }

  const languageInfo = LANGUAGE_INFO[languageName];

  // Softer Philippines-inspired colors
  const colors = {
    darkBlue: "#1A365D", // Darker blue for background
    blue: "#2C5282", // Softer blue for sections
    red: "#9B2C2C", // Softer red
    yellow: "#ECC94B", // Softer yellow
    white: "#FFFFFF", // White
    lightGray: "#F7FAFC", // Light gray for subtle contrast
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.darkBlue,
            borderColor: colors.yellow,
            borderWidth: 2,
          },
          infoSection === "top" && styles.rotated180,
        ]}
      >
        {/* Header with close button */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, { color: colors.yellow }]}>
              {languageName} Dialect
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.blue }]}
          >
            <X width={18} height={18} strokeWidth={2} stroke={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image Banner */}
        <View
          style={[
            styles.imageBanner,
            { borderColor: colors.blue, borderWidth: 1 },
          ]}
        >
          <Image
            source={getLanguageBackground(languageName)}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Major Cities */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MapPin
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                Major Cities
              </Text>
            </View>
            <View style={styles.tagsContainer}>
              {languageInfo.majorCities.map((city, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.blue }]}
                >
                  <Text style={{ color: colors.white }}>{city}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Region */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MapPin
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                Region
              </Text>
            </View>
            <View style={styles.tagsContainer}>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: colors.red, opacity: 0.9 },
                ]}
              >
                <Text style={[styles.boldText, { color: colors.white }]}>
                  {languageInfo.region}
                </Text>
              </View>
            </View>
          </View>

          {/* Common Phrases */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MessageCircle
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                Phrases
              </Text>
            </View>
            <View style={styles.phrasesContainer}>
              <View
                style={[styles.phraseBox, { backgroundColor: colors.blue }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.yellow }]}>
                  Hello
                </Text>
                <Text style={[styles.phraseText, { color: colors.white }]}>
                  {languageInfo.commonGreetings.hello}
                </Text>
              </View>
              <View
                style={[styles.phraseBox, { backgroundColor: colors.blue }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.yellow }]}>
                  Thank You
                </Text>
                <Text style={[styles.phraseText, { color: colors.white }]}>
                  {languageInfo.commonGreetings.thankYou}
                </Text>
              </View>
            </View>
          </View>

          {/* Cultural Info */}
          <View style={styles.sectionHeader}>
            <Info
              width={18}
              height={18}
              strokeWidth={2}
              stroke={colors.yellow}
            />
            <Text style={[styles.sectionTitle, { color: colors.white }]}>
              Cultural Notes
            </Text>
          </View>
          <View style={[styles.culturalBox, { backgroundColor: colors.blue }]}>
            <View style={styles.culturalItem}>
              <Text style={[styles.culturalLabel, { color: colors.yellow }]}>
                Symbol
              </Text>
              <Text style={{ color: colors.white }}>{languageInfo.symbol}</Text>
            </View>

            <View>
              <Text style={[styles.culturalLabel, { color: colors.yellow }]}>
                Fun Fact
              </Text>
              <Text style={{ color: colors.white }}>{languageInfo.fact}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default LanguageInfoModal;

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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "91.666667%", // w-11/12
    maxWidth: 448, // max-w-md
    borderRadius: 16, // rounded-2xl
    padding: 20, // p-5
    borderWidth: 2,
  },
  rotated180: {
    transform: [{ rotate: "180deg" }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // mb-4
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  titleText: {
    fontSize: 24, // text-2xl
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    borderRadius: 9999, // rounded-full
    padding: 8, // p-2
  },
  imageBanner: {
    marginBottom: 16, // mb-4
    borderRadius: 8, // rounded-lg
    overflow: "hidden",
  },
  scrollView: {
    maxHeight: 384, // max-h-96
  },
  sectionContainer: {
    marginBottom: 16, // mb-4
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // mb-3
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18, // text-lg
    marginLeft: 8, // ml-2
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 9999, // rounded-full
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    marginRight: 8, // mr-2
    marginBottom: 8, // mb-2
  },
  phrasesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  phraseBox: {
    flex: 1,
    borderRadius: 12, // rounded-xl
    padding: 12, // p-3
  },
  phraseLabel: {
    textAlign: "center",
    fontWeight: "600", // font-semibold
    marginBottom: 6, // mb-1.5
  },
  phraseText: {
    fontWeight: "600", // font-semibold
    textAlign: "center",
  },
  culturalBox: {
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    marginBottom: 16, // mb-4
  },
  culturalItem: {
    marginBottom: 12, // mb-3
  },
  culturalLabel: {
    fontWeight: "600", // font-semibold
    marginBottom: 8, // mb-2
  },
  boldText: {
    fontWeight: "bold",
  },
});
