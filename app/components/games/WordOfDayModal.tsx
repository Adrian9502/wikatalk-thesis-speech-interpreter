import React, { useRef, useEffect, memo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import CloseButton from "./buttons/CloseButton";
import { BASE_COLORS, WORD_OF_DAY_GRADIENT } from "@/constants/colors";
import {
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
} from "@/constants/fontSizes";

interface WordOfDayModalProps {
  visible: boolean;
  onClose: () => void;
  word: {
    english: string;
    translation: string;
    pronunciation: string;
    language: string;
    definition?: string;
  } | null;
  onPlayPress: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

const WordOfDayModal: React.FC<WordOfDayModalProps> = ({
  visible,
  onClose,
  word,
  onPlayPress,
  isPlaying,
  isLoading,
}) => {
  const lottieRef = useRef<LottieView>(null);

  // Manage animation state
  useEffect(() => {
    if (!lottieRef.current) return;

    const timer = setTimeout(() => {
      try {
        if (isPlaying) {
          lottieRef.current?.play();
        } else {
          lottieRef.current?.pause();
        }
      } catch (error) {
        console.log("Lottie animation error:", error);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isPlaying]);

  if (!word || !visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Animatable.View animation="fadeIn" duration={300} style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={400}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={WORD_OF_DAY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Close Button */}
            <CloseButton size={14} onPress={onClose} />

            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>Word of the Day</Text>
            </View>

            {/* Main Word Card */}
            <Animatable.View
              animation="fadeInUp"
              delay={150}
              duration={400}
              style={styles.wordCard}
            >
              {/* Language Badge */}
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>{word.language}</Text>
              </View>

              {/* Word Section */}
              <Animatable.Text
                animation="fadeIn"
                delay={250}
                style={styles.wordText}
              >
                {word.english}
              </Animatable.Text>

              {/* Translation Section */}
              <View style={styles.translationContainer}>
                <View style={styles.dividerLine} />
                <Animatable.Text
                  animation="fadeIn"
                  delay={350}
                  style={styles.translationText}
                >
                  {word.translation}
                </Animatable.Text>
              </View>

              {/* Pronunciation Section */}
              <View style={styles.pronunciationContainer}>
                <Text style={styles.pronunciationText}>
                  {word.pronunciation}
                </Text>
              </View>
            </Animatable.View>

            {/* Audio Player Section */}
            <Animatable.View
              animation="fadeInUp"
              delay={400}
              style={styles.audioContainer}
            >
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isPlaying && styles.playButtonActive,
                ]}
                onPress={onPlayPress}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={BASE_COLORS.white} />
                ) : (
                  <View style={styles.lottieContainer}>
                    <LottieView
                      ref={lottieRef}
                      source={require("@/assets/animations/audiowaves-animation.json")}
                      style={styles.lottieAnimation}
                      loop={isPlaying}
                      speed={1}
                      autoPlay={isPlaying}
                      resizeMode="contain"
                      onAnimationFinish={() =>
                        console.log("Animation finished")
                      }
                    />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.audioTextContainer}>
                <Text style={styles.audioLabelText}>
                  {isLoading
                    ? "Loading audio..."
                    : isPlaying
                    ? "Playing pronunciation"
                    : "Tap to hear pronunciation"}
                </Text>
              </View>
            </Animatable.View>

            {/* Footer Note */}
            <Animatable.View
              animation="fadeIn"
              delay={500}
              style={styles.noteContainer}
            >
              <Text style={styles.noteText}>
                New word every day to enhance your vocabulary
              </Text>
            </Animatable.View>
          </LinearGradient>
        </Animatable.View>
      </Animatable.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "92%",
    maxWidth: 360,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  gradientBackground: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 5,
  },
  wordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  languageBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    transform: [{ translateY: -30 }],
  },
  languageText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  wordText: {
    fontSize: FONT_SIZES["4xl"],
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: -20,
  },
  translationContainer: {
    width: "100%",
    alignItems: "center",
  },
  dividerLine: {
    width: "50%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 16,
  },
  translationText: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: POPPINS_FONT.semiBold,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  pronunciationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
  },
  pronunciationText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  audioContainer: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  playButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  lottieContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 60,
    height: 60,
  },
  audioTextContainer: {
    width: "100%",
    alignItems: "center",
  },
  audioLabelText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  noteContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 8,
  },
  noteText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

export default memo(WordOfDayModal);
