import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { BASE_COLORS } from "@/constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Globe } from "react-native-feather";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";
import { PRONUNCIATION_ASSETS } from "@/constants/bundledPronunciationData";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896;

interface BundledPronunciationItem {
  english: string;
  translation: string;
  pronunciation: string;
  fileName: string;
}

interface BundledPronunciationCardProps {
  item: BundledPronunciationItem;
  index: number;
  language: string;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => Promise<void>;
}

const BundledPronunciationCard = React.memo(
  ({
    item,
    index,
    language,
    isPlaying,
    isLoading,
    onPlay,
  }: BundledPronunciationCardProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Get responsive dimensions (same as PronunciationCard)
    const getResponsiveDimensions = () => {
      return {
        cardPadding: isSmallScreen ? 12 : 16,
        iconSize: isSmallScreen ? 14 : 16,
        buttonSize: isSmallScreen ? 36 : 40,
        iconContainerSize: isSmallScreen ? 28 : 32,
        borderRadius: 25,
        marginVertical: isSmallScreen ? 6 : 8,
        marginBottom: isSmallScreen ? 8 : 12,
        accentBarHeight: isSmallScreen ? 4 : 6,
        liveDotSize: isSmallScreen ? 6 : 8,
        pronunciationPadding: isSmallScreen ? 8 : 12,
        playIconSize: isSmallScreen ? 15 : 17,
      };
    };

    const dimensions = getResponsiveDimensions();

    const handlePlayPress = useCallback(async () => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);
        await onPlay();
      } catch (error) {
        console.error("[BundledCard] Error playing audio:", error);
      } finally {
        setIsProcessing(false);
      }
    }, [onPlay, isProcessing]);

    const isCurrentPlaying = isPlaying;
    const isAudioLoadingForThis = isLoading;

    return (
      <View
        style={[
          styles.cardContainer,
          {
            marginVertical: dimensions.marginVertical,
            borderRadius: dimensions.borderRadius,
          },
          isCurrentPlaying && styles.cardActive,
        ]}
        removeClippedSubviews={false}
        collapsable={false}
      >
        {/* Accent bar */}
        <View
          style={[
            styles.accentBar,
            { height: dimensions.accentBarHeight },
            isCurrentPlaying && styles.accentBarActive,
          ]}
        />

        {/* Content */}
        <View style={[{ padding: dimensions.cardPadding }]}>
          {/* English Text */}
          <View
            style={[styles.topRow, { marginBottom: dimensions.marginBottom }]}
          >
            <View
              style={[
                styles.iconContainer,
                styles.englishIconContainer,
                {
                  width: dimensions.iconContainerSize,
                  height: dimensions.iconContainerSize,
                  borderRadius: dimensions.iconContainerSize / 2,
                },
                isCurrentPlaying && styles.englishIconContainerActive,
              ]}
            >
              <Globe
                color={isCurrentPlaying ? BASE_COLORS.orange : BASE_COLORS.blue}
                width={dimensions.iconSize}
                height={dimensions.iconSize}
              />
            </View>
            <Text style={styles.englishText} numberOfLines={2}>
              {item.english}
            </Text>
            {isCurrentPlaying && (
              <View style={styles.liveIndicator}>
                <View
                  style={[
                    styles.liveDot,
                    {
                      width: dimensions.liveDotSize,
                      height: dimensions.liveDotSize,
                      borderRadius: dimensions.liveDotSize / 2,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Translation */}
          <View style={[{ marginBottom: dimensions.marginBottom }]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isCurrentPlaying
                  ? BASE_COLORS.lightPink
                  : BASE_COLORS.lightBlue,
                padding: dimensions.pronunciationPadding,
                borderRadius: isSmallScreen ? 16 : 20,
                borderLeftWidth: 3,
                borderLeftColor: isCurrentPlaying
                  ? BASE_COLORS.orange
                  : BASE_COLORS.blue,
              }}
            >
              <MaterialCommunityIcons
                name="translate"
                size={dimensions.iconSize - 2}
                color={isCurrentPlaying ? BASE_COLORS.orange : BASE_COLORS.blue}
                style={styles.arrowIcon}
              />

              <Text
                style={[
                  styles.translationText,
                  {
                    color: isCurrentPlaying
                      ? BASE_COLORS.orange
                      : BASE_COLORS.blue,
                  },
                ]}
                numberOfLines={2}
              >
                {item.translation}
              </Text>
            </View>
          </View>

          {/* Pronunciation & Play Button */}
          <View style={styles.bottomRow}>
            <View style={styles.pronunciationSection}>
              <View
                style={[
                  styles.iconContainer,
                  styles.pronunciationIconContainer,
                  {
                    width: dimensions.iconContainerSize,
                    height: dimensions.iconContainerSize,
                    borderRadius: dimensions.iconContainerSize / 2,
                  },
                  isCurrentPlaying
                    ? styles.pronunciationIconContainerActive
                    : styles.pronunciationIconContainerInactive,
                ]}
              >
                <MaterialCommunityIcons
                  name={isCurrentPlaying ? "volume-high" : "volume-medium"}
                  size={dimensions.iconSize}
                  color={
                    isCurrentPlaying
                      ? BASE_COLORS.orange
                      : BASE_COLORS.placeholderText
                  }
                />
              </View>

              <View
                style={[
                  styles.pronunciationContainer,
                  {
                    paddingHorizontal: dimensions.pronunciationPadding,
                    paddingVertical: isSmallScreen ? 6 : 8,
                  },
                ]}
              >
                {item.pronunciation && (
                  <Text
                    style={[
                      styles.pronunciationText,
                      isCurrentPlaying && styles.pronunciationTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    /{item.pronunciation}/
                  </Text>
                )}
              </View>
            </View>

            {/* Play Button */}
            <TouchableOpacity
              style={[
                {
                  width: dimensions.buttonSize,
                  height: dimensions.buttonSize,
                  borderRadius: dimensions.buttonSize / 2,
                },
                isCurrentPlaying && styles.audioButtonActive,
              ]}
              onPress={handlePlayPress}
              activeOpacity={0.8}
              delayPressIn={0}
              delayPressOut={0}
              disabled={isProcessing}
            >
              <View
                style={[
                  styles.audioButtonWrapper,
                  {
                    borderRadius: dimensions.buttonSize / 2,
                  },
                  isCurrentPlaying && styles.audioButtonWrapperActive,
                ]}
              >
                {isAudioLoadingForThis ? (
                  <ActivityIndicator size="small" color={BASE_COLORS.white} />
                ) : (
                  <MaterialCommunityIcons
                    name={isCurrentPlaying ? "stop" : "play"}
                    size={dimensions.playIconSize}
                    color={BASE_COLORS.white}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

export default BundledPronunciationCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardActive: {
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowColor: BASE_COLORS.blue,
    elevation: 6,
  },
  accentBar: {
    backgroundColor: BASE_COLORS.lightBlue,
  },
  accentBarActive: {
    backgroundColor: BASE_COLORS.lightPink,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: isSmallScreen ? 10 : 12,
  },
  englishIconContainer: {
    backgroundColor: `${BASE_COLORS.blue}15`,
    borderWidth: 1,
    borderColor: `${BASE_COLORS.blue}25`,
  },
  englishIconContainerActive: {
    backgroundColor: `${BASE_COLORS.orange}15`,
    borderColor: `${BASE_COLORS.orange}25`,
  },
  englishText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
    flex: 1,
  },
  liveIndicator: {
    marginLeft: isSmallScreen ? 6 : 8,
  },
  liveDot: {
    backgroundColor: BASE_COLORS.success,
  },
  arrowIcon: {
    marginRight: isSmallScreen ? 10 : 12,
  },
  translationText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pronunciationSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: isSmallScreen ? 10 : 12,
  },
  pronunciationIconContainer: {
    backgroundColor: "rgba(158, 158, 167, 0.1)",
    borderWidth: 1,
  },
  pronunciationIconContainerActive: {
    borderColor: BASE_COLORS.orange,
  },
  pronunciationIconContainerInactive: {
    borderColor: "rgba(158, 158, 167, 0.12)",
  },
  pronunciationContainer: {
    flex: 1,
    backgroundColor: "rgba(158, 158, 167, 0.08)",
    borderRadius: isSmallScreen ? 6 : 8,
  },
  pronunciationText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
  },
  pronunciationTextActive: {
    color: BASE_COLORS.orange,
  },
  audioButtonActive: {
    backgroundColor: BASE_COLORS.orange,
  },
  audioButtonWrapper: {
    flex: 1,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonWrapperActive: {
    backgroundColor: BASE_COLORS.orange,
  },
});
