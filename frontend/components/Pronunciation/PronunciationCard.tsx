import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
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
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPlayPress(index, item.translation)}
        style={[styles.card, styles.cardContainer]}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.englishText}>{item.english}</Text>
            <Text style={styles.translationText}>{item.translation}</Text>
            <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
          </View>
          <View style={styles.audioContainer}>
            {isAudioLoading && currentPlayingIndex === index ? (
              <ActivityIndicator size="small" color={BASE_COLORS.blue} />
            ) : (
              <View
                style={[
                  styles.playButton,
                  currentPlayingIndex === index && styles.playButtonActive,
                ]}
              >
                <Ionicons
                  name={
                    currentPlayingIndex === index
                      ? "volume-high"
                      : "volume-medium-outline"
                  }
                  size={22}
                  color={
                    currentPlayingIndex === index
                      ? BASE_COLORS.white
                      : BASE_COLORS.blue
                  }
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific props changed
    return (
      prevProps.item.english === nextProps.item.english &&
      prevProps.item.translation === nextProps.item.translation &&
      prevProps.item.pronunciation === nextProps.item.pronunciation &&
      (prevProps.currentPlayingIndex === nextProps.currentPlayingIndex ||
        (prevProps.index !== prevProps.currentPlayingIndex &&
          nextProps.index !== nextProps.currentPlayingIndex)) &&
      prevProps.isAudioLoading === nextProps.isAudioLoading
    );
  }
);
export default PronunciationCard;

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContainer: {
    backgroundColor: BASE_COLORS.white,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  englishText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: BASE_COLORS.darkText,
    marginBottom: 2,
  },
  translationText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    color: BASE_COLORS.blue,
    marginBottom: 4,
  },
  pronunciationText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    letterSpacing: 0.5,
    color: BASE_COLORS.orange,
  },
  audioContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.lightBlue,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  playButtonActive: {
    backgroundColor: BASE_COLORS.blue,
  },
});
