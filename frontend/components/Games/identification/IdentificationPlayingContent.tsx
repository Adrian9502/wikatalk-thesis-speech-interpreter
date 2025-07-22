import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
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

const IdentificationPlayingContent: React.FC<
  IdentificationPlayingContentProps
> = ({
  difficulty,
  levelData,
  currentSentence,
  words,
  selectedWord,
  showTranslation,
  toggleTranslation,
  handleWordSelect,
}) => {
  // Get game mode gradient for consistency
  const gameGradientColors = React.useMemo(
    () => getGameModeGradient("identification"),
    []
  );

  const wordOptions = React.useMemo(() => words || [], [words]);

  return (
    <View style={gamesSharedStyles.gameContainer}>
      {/* Enhanced Question Card */}
      <Animatable.View
        animation="zoomIn"
        duration={800}
        delay={200}
        style={gamesSharedStyles.questionCardContainer}
      >
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
            {/* Question Text */}
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
      </Animatable.View>

      {/* Enhanced Instructions */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={600}
        style={styles.instructionsContainer}
      >
        <Text style={styles.instructionsTitle}>Find the correct word:</Text>
        <Text style={styles.instructionsText}>
          Tap on the word that best fits the sentence context
        </Text>
      </Animatable.View>

      {/* Enhanced Words Grid */}
      <Animatable.View
        animation="fadeInUp"
        duration={700}
        delay={800}
        style={styles.wordsContainer}
      >
        <View style={styles.wordsGrid}>
          {wordOptions.length > 0 ? (
            wordOptions.map((word, index) => {
              const isSelected = selectedWord === index;

              return (
                <Animatable.View
                  key={`word-${index}-${word.text || word.clean}`}
                  animation="slideInUp"
                  duration={600}
                  delay={900 + index * 100}
                  style={styles.wordWrapper}
                >
                  <TouchableOpacity
                    style={[
                      styles.wordCard,
                      isSelected && styles.selectedWordCard,
                    ]}
                    onPress={() => handleWordSelect(index)}
                    disabled={selectedWord !== null}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(255, 255, 255, 0.05)",
                      ]}
                      style={styles.wordGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
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
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })
          ) : (
            <View style={styles.noOptionsContainer}>
              <Text style={styles.noOptionsText}>No options available</Text>
            </View>
          )}
        </View>
      </Animatable.View>

      {/* Enhanced Translation Section */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={1200}
        style={styles.translationSection}
      >
        <TouchableOpacity
          style={[
            styles.translationButton,
            showTranslation && styles.translationButtonActive,
          ]}
          onPress={toggleTranslation}
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

        {/* Translation Card */}
        {showTranslation && (
          <Animatable.View
            animation="slideInUp"
            duration={500}
            style={styles.translationCard}
          >
            <LinearGradient
              colors={["rgba(33, 150, 243, 0.2)", "rgba(33, 150, 243, 0.1)"]}
              style={styles.translationCardGradient}
            >
              <View style={styles.translationCardHeader}>
                <Eye width={18} height={18} color="#2196F3" />
                <Text style={styles.translationCardTitle}>Translation</Text>
              </View>
              <Text style={styles.translationCardText}>
                {currentSentence?.translation || "Translation not available"}
              </Text>
            </LinearGradient>
          </Animatable.View>
        )}
      </Animatable.View>
    </View>
  );
};

export default React.memo(IdentificationPlayingContent);
