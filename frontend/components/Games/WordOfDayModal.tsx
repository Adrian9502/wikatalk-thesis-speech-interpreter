import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { X, Calendar } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import useThemeStore from "@/store/useThemeStore";
import LottieView from "lottie-react-native";
import styles from "@/styles/wordOfDayStyles";

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
  const { activeTheme } = useThemeStore();
  const lottieRef = useRef<LottieView>(null);

  // Force animation to play/stop based on isPlaying state
  useEffect(() => {
    // Give time for component to fully mount
    const timer = setTimeout(() => {
      if (lottieRef.current) {
        if (isPlaying) {
          // Start from beginning when playing
          lottieRef.current.reset();
          lottieRef.current.play();
        } else {
          // Pause and go to the last frame to show the complete waveform
          lottieRef.current.pause();

          // Get the source JSON to determine animation duration/frames
          const animationData = require("@/assets/animations/audiowaves-animation.json");
          const totalFrames = animationData.op || 60; // Default to 60 if not specified

          // Go to the last frame (or a specific frame that looks good)
          lottieRef.current.play(totalFrames - 1, totalFrames - 1);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isPlaying]);

  useEffect(() => {
    // Set animation to last frame on initial render
    const timer = setTimeout(() => {
      if (lottieRef.current && !isPlaying) {
        const animationData = require("@/assets/animations/audiowaves-animation.json");
        const totalFrames = animationData.op || 60;
        lottieRef.current.play(totalFrames - 1, totalFrames - 1);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);
  if (!word) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Animatable.View animation="fadeIn" duration={200} style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={[
            styles.modalContainer,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
          {/* Decorative Background Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* Close Button - Positioned Absolutely */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X width={20} height={20} color={BASE_COLORS.white} />
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.calendarIconContainer}>
              <Calendar width={24} height={24} color={BASE_COLORS.white} />
            </View>
            <Text style={styles.headerTitle}>Word of the Day</Text>
          </View>

          {/* Main Content Card */}
          <Animatable.View
            animation="fadeInUp"
            delay={150}
            duration={300}
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

            {/* Translation Section with Line */}
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
              <Text style={styles.pronunciationText}>{word.pronunciation}</Text>
            </View>
          </Animatable.View>

          {/* Audio Player Section */}
          <Animatable.View
            animation="fadeInUp"
            delay={400}
            style={styles.audioContainer}
          >
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
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
                    loop={true}
                    speed={1}
                    autoPlay={false}
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

          {/* Note Section */}
          <Animatable.View
            animation="fadeIn"
            delay={500}
            style={styles.noteContainer}
          >
            <Text style={styles.noteText}>
              New word every day to enhance your vocabulary
            </Text>
          </Animatable.View>
        </Animatable.View>
      </Animatable.View>
    </Modal>
  );
};

export default WordOfDayModal;
