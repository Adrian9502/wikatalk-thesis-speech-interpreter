import React, { useState, useCallback } from "react";
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
import { usePronunciationStore } from "@/store/usePronunciationStore";

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

    const isCurrentPlaying = currentPlayingIndex === index;
    const isAudioLoadingForThis = isAudioLoading && isCurrentPlaying;

    const [isProcessing, setIsProcessing] = useState(false);

    const handlePlayPress = useCallback(async () => {
      if (isProcessing) {
        return;
      }

      try {
        await onPlayPress(index, item.translation);
      } finally {
        setTimeout(() => setIsProcessing(false), 300);
      }
    }, [index, item.translation, onPlayPress, isProcessing]);

    return (
      <View
        style={[styles.cardContainer, isCurrentPlaying && styles.cardActive]}
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
            <View
              style={[
                styles.iconContainer,
                styles.englishIconContainer,
                isCurrentPlaying && styles.englishIconContainerActive,
              ]}
            >
              <Globe
                color={isCurrentPlaying ? BASE_COLORS.orange : BASE_COLORS.blue}
                width={16}
                height={16}
              />
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isCurrentPlaying
                  ? BASE_COLORS.lightPink
                  : BASE_COLORS.lightBlue,
                padding: 12,
                borderRadius: 20,
                borderLeftWidth: 3,
                borderLeftColor: isCurrentPlaying
                  ? BASE_COLORS.orange
                  : BASE_COLORS.blue,
              }}
            >
              <MaterialCommunityIcons
                name="translate"
                size={14}
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
                  isCurrentPlaying
                    ? styles.pronunciationIconContainerActive
                    : styles.pronunciationIconContainerInactive,
                ]}
              >
                <MaterialCommunityIcons
                  name={isCurrentPlaying ? "volume-high" : "volume-medium"}
                  size={16}
                  color={
                    isCurrentPlaying
                      ? BASE_COLORS.orange
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
              onPress={handlePlayPress}
              activeOpacity={0.8}
              delayPressIn={0}
              delayPressOut={0}
              disabled={isAudioLoadingForThis || isProcessing}
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
                    size={17}
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
    marginVertical: 8,
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
    height: 6,
    backgroundColor: BASE_COLORS.lightBlue,
  },
  accentBarActive: {
    backgroundColor: BASE_COLORS.orange,
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
  englishIconContainerActive: {
    backgroundColor: `${BASE_COLORS.orange}15`,
    borderColor: `${BASE_COLORS.orange}25`,
  },
  englishText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    flex: 1,
  },
  liveIndicator: {
    marginLeft: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: BASE_COLORS.success,
  },
  middleRow: {
    marginBottom: 12,
  },
  arrowIcon: {
    marginRight: 12,
  },
  translationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
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
  pronunciationIconContainerActive: {
    borderColor: BASE_COLORS.orange,
  },
  pronunciationIconContainerInactive: {
    borderColor: "rgba(158, 158, 167, 0.12)",
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
    color: BASE_COLORS.orange,
    fontFamily: "Poppins-Medium",
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 20,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonWrapperActive: {
    backgroundColor: BASE_COLORS.orange,
  },
});
