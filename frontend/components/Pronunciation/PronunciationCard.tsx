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
        // SCROLL FIX: Essential props for smooth scrolling
        removeClippedSubviews={false}
        collapsable={false}
      >
        {/* Accent bar */}
        <View
          style={[styles.accentBar, isCurrentPlaying && styles.accentBarActive]}
        />

        <View style={styles.cardWrapper}>
          {/* English Text */}
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

          {/* Translation */}
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

          {/* Pronunciation & Play Button */}
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
                <MaterialCommunityIcons
                  name={isCurrentPlaying ? "volume-high" : "volume-medium"}
                  size={18}
                  color={
                    isCurrentPlaying
                      ? BASE_COLORS.blue
                      : BASE_COLORS.placeholderText
                  }
                />
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
              // SCROLL FIX: Prevent touch interference
              delayPressIn={0}
              delayPressOut={0}
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
                  <MaterialCommunityIcons
                    name={isCurrentPlaying ? "pause" : "play"}
                    size={18}
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
  // OPTIMIZED: Better comparison for performance
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.item.english === nextProps.item.english &&
      prevProps.item.translation === nextProps.item.translation &&
      prevProps.currentPlayingIndex === nextProps.currentPlayingIndex &&
      prevProps.isAudioLoading === nextProps.isAudioLoading
    );
  }
);

export default PronunciationCard;

// Keep existing styles unchanged
const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
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
    height: 3,
    backgroundColor: BASE_COLORS.lightBlue,
  },
  accentBarActive: {
    backgroundColor: BASE_COLORS.blue,
  },
  cardWrapper: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  englishIconContainer: {
    backgroundColor: `${BASE_COLORS.blue}15`,
    borderWidth: 1,
    borderColor: `${BASE_COLORS.blue}25`,
  },
  englishText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    flex: 1,
  },
  liveIndicator: {
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BASE_COLORS.success,
  },
  middleRow: {
    marginBottom: 12,
  },
  translationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.lightBlue,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  arrowIcon: {
    marginRight: 12,
  },
  translationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
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
    marginRight: 12,
  },
  pronunciationIconContainer: {
    backgroundColor: "rgba(158, 158, 167, 0.1)",
    borderWidth: 1,
  },
  pronunciationContainer: {
    flex: 1,
    backgroundColor: "rgba(158, 158, 167, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pronunciationText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: BASE_COLORS.placeholderText,
  },
  pronunciationTextActive: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-Medium",
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  audioButtonActive: {
    shadowColor: BASE_COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  audioButtonWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonWrapperActive: {
    backgroundColor: BASE_COLORS.blue,
  },
});
