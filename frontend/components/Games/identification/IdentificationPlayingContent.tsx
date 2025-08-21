import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Eye, EyeOff } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/identification.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import { safeTextRender } from "@/utils/textUtils";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";

interface IdentificationPlayingContentProps {
  difficulty: string;
  levelData: any;
  currentSentence: any;
  words: any[];
  selectedWord: number | null;
  showTranslation: boolean;
  toggleTranslation: () => void;
  handleWordSelect: (index: number) => void;
}

const IdentificationPlayingContent: React.FC<IdentificationPlayingContentProps> =
  React.memo(
    ({
      currentSentence,
      words,
      selectedWord,
      showTranslation,
      toggleTranslation,
      handleWordSelect,
    }) => {
      const [isAnimating, setIsAnimating] = useState(true);

      const translationOpacity = React.useRef(new Animated.Value(0)).current;

      // Memoized values
      const gameGradientColors = useMemo(
        () => getGameModeGradient("identification"),
        []
      );

      const wordOptions = useMemo(() => words || [], [words]);

      // Simplified animation timing
      useEffect(() => {
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 700);

        return () => clearTimeout(timer);
      }, []);

      useEffect(() => {
        if (showTranslation) {
          // Animate in
          Animated.timing(translationOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset for next time
          translationOpacity.setValue(0);
        }
      }, [showTranslation, translationOpacity]);

      // Memoized handlers
      const handleWordPress = useCallback(
        (index: number) => {
          if (isAnimating || selectedWord !== null) return;
          handleWordSelect(index);
        },
        [isAnimating, selectedWord, handleWordSelect]
      );

      const handleToggleTranslation = useCallback(() => {
        if (isAnimating) return;
        toggleTranslation();
      }, [isAnimating, toggleTranslation]);

      return (
        <ScrollView
          style={gamesSharedStyles.gameContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Question Card */}
          <View style={gamesSharedStyles.questionCardContainer}>
            <LinearGradient
              style={gamesSharedStyles.questionCard}
              colors={gameGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LevelTitleHeader
                levelString={currentSentence?.level}
                actualTitle={currentSentence?.title}
                animationDelay={0}
              />
              <View style={gamesSharedStyles.questionContainer}>
                <Text style={gamesSharedStyles.questionText}>
                  {safeTextRender(
                    currentSentence?.sentence || currentSentence?.question
                  )}
                </Text>
              </View>
              {/* Decorative Elements */}
              <View style={gamesSharedStyles.cardDecoration1} />
              <View style={gamesSharedStyles.cardDecoration2} />
            </LinearGradient>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Find the correct word:</Text>
            <Text style={styles.instructionsText}>
              Tap on the word that best fits the sentence context
            </Text>
          </View>

          {/* Words Grid  */}
          <View style={styles.wordsContainer}>
            {wordOptions.length > 0 ? (
              <View style={styles.wordsGrid}>
                {wordOptions.map((word, index) => {
                  const isSelected = selectedWord === index;

                  return (
                    <View
                      key={`word-${index}-${word.text || word.clean}`}
                      style={styles.wordWrapper}
                    >
                      <TouchableOpacity
                        style={[
                          styles.wordCard,
                          isSelected && styles.selectedWordCard,
                        ]}
                        onPress={() => handleWordPress(index)}
                        disabled={isAnimating || selectedWord !== null}
                        activeOpacity={isAnimating ? 1 : 0.8}
                      >
                        {/* Word Number */}
                        <View style={styles.wordNumber}>
                          <Text style={styles.wordNumberText}>{index + 1}</Text>
                        </View>

                        {/* Word Content */}
                        <View style={styles.wordContent}>
                          <Text style={styles.wordText} numberOfLines={2}>
                            {safeTextRender(word.text)}
                          </Text>
                        </View>

                        {/* Selection Pulse */}
                        {isSelected && <View style={styles.selectionPulse} />}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noOptionsContainer}>
                <Text style={styles.noOptionsText}>No options available</Text>
              </View>
            )}
          </View>

          {/* Translation Section */}
          <View style={styles.translationSection}>
            <TouchableOpacity
              style={[
                styles.translationButton,
                showTranslation && styles.translationButtonActive,
              ]}
              onPress={handleToggleTranslation}
              disabled={isAnimating}
            >
              {showTranslation ? (
                <EyeOff width={16} height={16} color={BASE_COLORS.white} />
              ) : (
                <Eye width={16} height={16} color="rgba(255, 255, 255, 0.7)" />
              )}
              <Text
                style={[
                  styles.translationButtonText,
                  showTranslation && styles.translationButtonTextActive,
                ]}
              >
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Text>
            </TouchableOpacity>

            {/* NEW: Animated Translation Card */}
            {showTranslation && (
              <Animated.View
                style={[
                  styles.translationCard,
                  {
                    opacity: translationOpacity,
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(33, 150, 243, 0.2)",
                    "rgba(33, 150, 243, 0.1)",
                  ]}
                  style={styles.translationCardGradient}
                >
                  <View style={styles.translationCardHeader}>
                    <Eye width={18} height={18} color="#2196F3" />
                    <Text style={styles.translationCardTitle}>Translation</Text>
                  </View>
                  <Text style={styles.translationCardText}>
                    {currentSentence?.translation ||
                      "Translation not available"}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      );
    }
  );

export default IdentificationPlayingContent;
