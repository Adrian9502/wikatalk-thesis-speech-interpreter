import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { X, Volume2, Calendar } from "react-native-feather";
import * as Animatable from "react-native-animatable";

interface WordOfDayModalProps {
  visible: boolean;
  onClose: () => void;
  word: {
    english: string;
    translation: string;
    pronunciation: string;
    language: string;
  } | null;
  onPlayPress: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

const { width } = Dimensions.get("window");

const WordOfDayModal: React.FC<WordOfDayModalProps> = ({
  visible,
  onClose,
  word,
  onPlayPress,
  isPlaying,
  isLoading,
}) => {
  if (!word) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.container}
        >
          {/* Modal Header with Gradient */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Calendar width={24} height={24} color={BASE_COLORS.white} />
            </View>
            <Text style={styles.title}>Word of the Day</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X width={20} height={20} color={BASE_COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <Animatable.View
            animation="fadeIn"
            delay={100}
            duration={400}
            style={styles.content}
          >
            <View style={styles.cardContent}>
              <View style={styles.languageBadge}>
                <Text style={styles.languageLabel}>{word.language}</Text>
              </View>

              <Animatable.Text
                animation="fadeInUp"
                delay={200}
                style={styles.englishWord}
              >
                {word.english}
              </Animatable.Text>

              <Animatable.Text
                animation="fadeInUp"
                delay={300}
                style={styles.translation}
              >
                {word.translation}
              </Animatable.Text>

              <View style={styles.pronunciationContainer}>
                <Text style={styles.pronunciation}>{word.pronunciation}</Text>
              </View>
            </View>

            <Animatable.View
              animation="bounceIn"
              delay={500}
              style={styles.audioControls}
            >
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isPlaying && styles.playButtonActive,
                ]}
                onPress={onPlayPress}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={BASE_COLORS.white} />
                ) : (
                  <Volume2 width={24} height={24} color={BASE_COLORS.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.playText}>
                {isLoading
                  ? "Loading..."
                  : isPlaying
                  ? "Playing..."
                  : "Tap to hear pronunciation"}
              </Text>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: BASE_COLORS.darkText,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: BASE_COLORS.blue,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginLeft: -40, // Offset to center the text with the icon on the left
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    backgroundColor: "#1E2F42", // Dark blue background similar to the game screen
  },
  cardContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  languageBadge: {
    backgroundColor: BASE_COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  languageLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  englishWord: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  translation: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.blue,
    marginBottom: 16,
    textAlign: "center",
  },
  pronunciationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.orange,
    textAlign: "center",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: BASE_COLORS.orange,
  },
  playText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
});

export default WordOfDayModal;
