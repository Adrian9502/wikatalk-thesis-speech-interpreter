import React, { useRef, useEffect, memo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import styles from "@/styles/wordOfDayStyles";
import CloseButton from "./buttons/CloseButton";

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
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Close Button */}
            <CloseButton size={17} onPress={onClose}></CloseButton>

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
                  <ActivityIndicator size="small" color="#FFF" />
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

export default memo(WordOfDayModal);
