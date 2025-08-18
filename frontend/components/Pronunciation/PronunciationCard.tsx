import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Globe } from "react-native-feather";

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
    currentPlayingIndex,
    isAudioLoading,
    onPlayPress,
  }: {
    item: PronunciationItem;
    index: number;
    currentPlayingIndex: number | null;
    isAudioLoading: boolean;
    onPlayPress: (index: number, text: string) => void;
  }) => {
    const isCurrentPlaying = currentPlayingIndex === index;
    const isAudioLoadingForThis = isAudioLoading && isCurrentPlaying;

    return (
      <View
        style={[styles.cardContainer, isCurrentPlaying && styles.cardActive]}
      >
        {/* Gradient accent bar */}
        <View
          style={[styles.accentBar, isCurrentPlaying && styles.accentBarActive]}
        />

        <View style={styles.cardWrapper}>
          {/* Top Row - English Text with enhanced styling */}
          <View style={styles.topRow}>
            <View style={[styles.iconContainer, styles.englishIconContainer]}>
              <Globe color={BASE_COLORS.blue} width={18} height={18} />
            </View>
            <Text style={styles.englishText} numberOfLines={2}>
              {item.english}
            </Text>
            {isCurrentPlaying && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
              </View>
            )}
          </View>

          {/* Middle Row - Translation (keeping your original design) */}
          <View style={styles.middleRow}>
            <View style={styles.translationContainer}>
              <MaterialCommunityIcons
                name="translate"
                size={14}
                color={BASE_COLORS.blue}
                style={styles.arrowIcon}
              />
              <Text style={styles.translationText} numberOfLines={2}>
                {item.translation}
              </Text>
            </View>
          </View>

          {/* Bottom Row - Enhanced pronunciation & audio button */}
          <View style={styles.bottomRow}>
            <View style={styles.pronunciationSection}>
              <View
                style={[
                  styles.iconContainer,
                  styles.pronunciationIconContainer,
                  isCurrentPlaying
                    ? { borderColor: BASE_COLORS.blue }
                    : { borderColor: "rgba(158, 158, 167, 0.12)" },
                ]}
              >
                {isCurrentPlaying ? (
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={18}
                    color={BASE_COLORS.blue}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="volume-medium"
                    size={18}
                    color={BASE_COLORS.placeholderText}
                  />
                )}
              </View>

              <View style={styles.pronunciationContainer}>
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
                styles.audioButton,
                isCurrentPlaying && styles.audioButtonActive,
              ]}
              onPress={() => onPlayPress(index, item.translation)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.audioButtonWrapper,
                  isCurrentPlaying && styles.audioButtonWrapperActive,
                ]}
              >
                {isAudioLoadingForThis ? (
                  <ActivityIndicator size="small" color={BASE_COLORS.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={isCurrentPlaying ? "pause" : "play"}
                      size={18}
                      color={BASE_COLORS.white}
                    />
                    {/* Ripple effect for active state */}
                    {isCurrentPlaying && <View style={styles.rippleEffect} />}
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Background pattern for active state */}
        {isCurrentPlaying && (
          <View style={styles.backgroundPattern}>
            <View style={styles.patternDot1} />
            <View style={styles.patternDot2} />
            <View style={styles.patternDot3} />
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.english === nextProps.item.english &&
      prevProps.item.translation === nextProps.item.translation &&
      prevProps.currentPlayingIndex === nextProps.currentPlayingIndex &&
      prevProps.isAudioLoading === nextProps.isAudioLoading
    );
  }
);

export default PronunciationCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    position: "relative",
    backgroundColor: BASE_COLORS.white,
  },
  cardActive: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowColor: BASE_COLORS.blue,
    elevation: 6,
  },

  // Gradient accent bar
  accentBar: {
    height: 3,
    backgroundColor: BASE_COLORS.lightBlue,
    width: "100%",
  },
  accentBarActive: {
    backgroundColor: BASE_COLORS.blue,
    shadowColor: BASE_COLORS.blue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },

  cardWrapper: {
    padding: 15,
    backgroundColor: "transparent",
  },

  // Enhanced icon containers
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  englishIconContainer: {
    backgroundColor: `${BASE_COLORS.blue}15`,
    borderWidth: 1,
    borderColor: `${BASE_COLORS.blue}25`,
  },
  pronunciationIconContainer: {
    backgroundColor: "rgba(158, 158, 167, 0.1)",
    borderWidth: 1,
  },

  // Top Row Styles
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  englishText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    flex: 1,
  },

  // Live indicator
  liveIndicator: {
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BASE_COLORS.success,
    shadowColor: BASE_COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },

  // Middle Row Styles
  middleRow: {
    marginBottom: 10,
  },
  translationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.lightBlue,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  arrowIcon: {
    marginRight: 15,
  },
  translationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
    flex: 1,
    lineHeight: 20,
  },

  // Bottom Row Styles
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pronunciationSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  pronunciationContainer: {
    flex: 1,
    backgroundColor: "rgba(158, 158, 167, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(158, 158, 167, 0.12)",
  },
  pronunciationText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.placeholderText,
  },
  pronunciationTextActive: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-Medium",
  },

  // Enhanced Audio Button
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: BASE_COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  audioButtonActive: {
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  audioButtonWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  audioButtonWrapperActive: {
    backgroundColor: BASE_COLORS.blue,
  },

  // Ripple effect
  rippleEffect: {
    position: "absolute",
    width: "120%",
    height: "120%",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    opacity: 0.7,
  },

  // Background pattern for active state
  backgroundPattern: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  patternDot1: {
    position: "absolute",
    top: 20,
    right: 25,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  patternDot2: {
    position: "absolute",
    top: 35,
    right: 15,
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: `${BASE_COLORS.blue}10`,
  },
  patternDot3: {
    position: "absolute",
    top: 50,
    right: 30,
    width: 1,
    height: 1,
    borderRadius: 0.5,
    backgroundColor: `${BASE_COLORS.blue}08`,
  },
});
