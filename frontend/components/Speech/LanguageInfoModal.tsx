import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { MapPin, MessageCircle, X, Info } from "react-native-feather";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";
import { LinearGradient } from "expo-linear-gradient";
import useThemeStore from "@/store/useThemeStore";

interface LanguageInfoModalProps {
  visible: boolean;
  languageName: string;
  onClose: () => void;
}

// Define interfaces for each section type
interface BannerSection {
  id: string;
  type: "banner";
  data: {
    backgroundImage: any; // Use more specific type if available from getLanguageBackground
    region: string;
  };
}

interface CitiesSection {
  id: string;
  type: "cities";
  data: {
    cities: string[];
  };
}

interface PhrasesSection {
  id: string;
  type: "phrases";
  data: {
    hello: string;
    thankYou: string;
  };
}

interface CulturalSection {
  id: string;
  type: "cultural";
  data: {
    symbol: string;
    fact: string;
  };
}

// Union type for all section types
type Section = BannerSection | CitiesSection | PhrasesSection | CulturalSection;

const LanguageInfoModal: React.FC<LanguageInfoModalProps> = ({
  visible,
  languageName,
  onClose,
}) => {
  if (!languageName || !LANGUAGE_INFO[languageName]) {
    return null;
  }

  // Get the dynamic styles based on the current theme
  const { activeTheme } = useThemeStore();
  const languageInfo = LANGUAGE_INFO[languageName];
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;

  // Modern color scheme
  const colors = {
    primary: activeTheme.secondaryColor,
    secondary: "#FF6F4A",
    background: "#FFFFFF",
    cardBg: "#F9FAFF",
    text: "#212132",
    textLight: "#9E9EA7",
    accent: "#10B981",
    border: "#E8E8ED",
  };

  // Create sections data for FlatList
  const sections: Section[] = [
    // Banner section
    {
      id: "banner",
      type: "banner",
      data: {
        backgroundImage: getLanguageBackground(languageName),
        region: languageInfo.region,
      },
    },
    // Cities section
    {
      id: "cities",
      type: "cities",
      data: { cities: languageInfo.majorCities },
    },
    // Phrases section
    {
      id: "phrases",
      type: "phrases",
      data: {
        hello: languageInfo.commonGreetings.hello,
        thankYou: languageInfo.commonGreetings.thankYou,
      },
    },
    // Cultural section
    {
      id: "cultural",
      type: "cultural",
      data: { symbol: languageInfo.symbol, fact: languageInfo.fact },
    },
  ];

  // Render different section types
  const renderSection = ({ item }: { item: Section }) => {
    switch (item.type) {
      case "banner":
        return (
          <View style={styles.imageBanner}>
            <Image
              source={item.data.backgroundImage}
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
              <Text style={styles.regionText}>{item.data.region}</Text>
            </View>
          </View>
        );

      case "cities":
        return (
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
              {item.data.cities.map((city: string, index: number) => (
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
        );

      case "phrases":
        return (
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
            <View style={styles.phrasesColumn}>
              <View
                style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.primary }]}>
                  Hello
                </Text>
                <Text style={[styles.phraseText, { color: colors.text }]}>
                  {item.data.hello}
                </Text>
              </View>
              <View
                style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}
              >
                <Text style={[styles.phraseLabel, { color: colors.primary }]}>
                  Thank You
                </Text>
                <Text style={[styles.phraseText, { color: colors.text }]}>
                  {item.data.thankYou}
                </Text>
              </View>
            </View>
          </View>
        );

      case "cultural":
        return (
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
                  {item.data.symbol}
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
                  {item.data.fact}
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              maxHeight: windowHeight * 0.8,
              width: windowWidth > 500 ? 500 : windowWidth * 0.9,
            },
          ]}
        >
          {/* Fixed Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: activeTheme.backgroundColor },
            ]}
          >
            <Text style={[styles.titleText, { color: colors.background }]}>
              {languageName} Dialect
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <X
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.background}
              />
            </TouchableOpacity>
          </View>

          {/* Content using FlatList instead of ScrollView */}
          <FlatList
            data={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderSection}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  titleText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  listContent: {
    paddingBottom: 20,
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
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  phrasesColumn: {
    width: "100%",
    gap: 10,
  },
  phraseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
