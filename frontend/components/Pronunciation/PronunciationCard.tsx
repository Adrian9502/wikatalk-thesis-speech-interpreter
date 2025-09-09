import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Globe } from "react-native-feather";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constant/fontSizes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896; // iPhone X/11 and similar

// Define the PronunciationItem interface
interface PronunciationItem {
  english: string;
  translation: string;
  pronunciation: string;
}

const PronunciationCard = React.memo(
  ({
    item,
    index,
    onPlayPress,
  }: {
    item: PronunciationItem;
    index: number;
    onPlayPress: (index: number, text: string) => void;
  }) => {
    // FIXED: Use Zustand directly in the component
    const currentPlayingIndex = usePronunciationStore(
      (state) => state.currentPlayingIndex
    );
    const isAudioLoading = usePronunciationStore(
      (state) => state.isAudioLoading
    );
    // ADDED: Get stopAudio function from store
    const stopAudio = usePronunciationStore((state) => state.stopAudio);

    const isCurrentPlaying = currentPlayingIndex === index;
    const isAudioLoadingForThis = isAudioLoading && isCurrentPlaying;

    const [isProcessing, setIsProcessing] = useState(false);

    // UPDATED: Enhanced play button handler with stop functionality
    const handlePlayPress = useCallback(async () => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);

      try {
        // If this card is currently playing or loading, stop the audio
        if (isCurrentPlaying || isAudioLoadingForThis) {
          console.log(`[PronunciationCard] Stopping audio for index ${index}`);
          await stopAudio();
        } else {
          // If not playing, start playing
          console.log(`[PronunciationCard] Starting audio for index ${index}`);
          await onPlayPress(index, item.translation);
        }
      } catch (error) {
        console.error(`[PronunciationCard] Error handling play/stop:`, error);
      } finally {
        // Add a small delay to prevent rapid button presses
        setTimeout(() => setIsProcessing(false), 300);
      }
    }, [
      index,
      item.translation,
      onPlayPress,
      stopAudio,
      isProcessing,
      isCurrentPlaying,
      isAudioLoadingForThis,
    ]);

    // Get responsive dimensions
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
                size={dimensions.iconSize - 2} // Slightly smaller for translate icon
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
                    borderRadius: isSmallScreen ? 6 : 8,
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
  },
  () => false // Never skip re-renders to ensure UI updates
);

export default PronunciationCard;

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
    backgroundColor: "rgba(158, 158, 167, 0.1)",
  },
  pronunciationText: {
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    color: BASE_COLORS.placeholderText,
  },
  pronunciationTextActive: {
    color: BASE_COLORS.orange,
    fontFamily: POPPINS_FONT.medium,
  },
  audioButtonActive: {
    shadowColor: BASE_COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  audioButtonWrapper: {
    width: "100%",
    height: "100%",

    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonWrapperActive: {
    backgroundColor: BASE_COLORS.orange,
  },
});
