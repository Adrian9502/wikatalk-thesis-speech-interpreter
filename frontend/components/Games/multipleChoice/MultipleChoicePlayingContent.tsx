import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Circle } from "react-native-feather"; // REMOVED Check and X imports
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/multipleChoice.styles";
import { safeTextRender } from "@/utils/textUtils";

// Define an interface for the option object
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Define an interface for the question
interface Question {
  question: string;
  options: Option[];
}

interface MultipleChoicePlayingContentProps {
  difficulty: string;
  levelData: any;
  currentQuestion: Question | null;
  selectedOption: string | null;
  handleOptionSelect: (optionId: string) => void;
  isStarted?: boolean;
}

const MultipleChoicePlayingContent: React.FC<MultipleChoicePlayingContentProps> =
  React.memo(
    ({
      difficulty,
      levelData,
      currentQuestion,
      selectedOption,
      handleOptionSelect,
      isStarted = true,
    }) => {
      // Get game mode gradient for consistency
      const gameGradientColors = React.useMemo(
        () => getGameModeGradient("multipleChoice"),
        []
      );

      // Memoize options to prevent re-renders
      const options = React.useMemo(
        () => currentQuestion?.options || [],
        [currentQuestion?.options]
      );

      return (
        <View style={styles.container}>
          {/* Enhanced Question Card */}
          <Animatable.View
            animation="zoomIn"
            duration={800}
            delay={200}
            style={styles.questionCardContainer}
          >
            <LinearGradient
              colors={gameGradientColors}
              style={styles.questionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Question Text */}
              <Text style={styles.questionText}>
                {safeTextRender(currentQuestion?.question)}
              </Text>

              {/* Decorative Elements */}
              <View style={styles.cardDecoration1} />
              <View style={styles.cardDecoration2} />
            </LinearGradient>
          </Animatable.View>

          {/* Enhanced Options Container */}
          <View style={styles.optionsContainer}>
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={600}
              style={styles.optionsHeader}
            >
              <Text style={styles.optionsTitle}>Choose your answer:</Text>
              <View style={styles.optionsIndicator}>
                {options.map((_, index) => (
                  <Circle
                    key={index}
                    width={8}
                    height={8}
                    color="rgba(255, 255, 255, 0.4)"
                    fill={
                      selectedOption
                        ? "rgba(255, 255, 255, 0.6)"
                        : "transparent"
                    }
                  />
                ))}
              </View>
            </Animatable.View>

            {options.map((option: Option, index: number) => {
              const isSelected = selectedOption === option.id;
              // REMOVED: const showResult = selectedOption !== null;

              return (
                <Animatable.View
                  key={option.id}
                  animation="slideInUp"
                  duration={600}
                  delay={700 + index * 150}
                  style={styles.optionWrapper}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={selectedOption !== null || !isStarted}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(255, 255, 255, 0.05)",
                      ]}
                      style={styles.optionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {/* Option Letter */}
                      <View style={styles.optionLetter}>
                        <Text style={styles.optionLetterText}>
                          {option.id.toUpperCase()}
                        </Text>
                      </View>

                      {/* Option Content */}
                      <View style={styles.optionContent}>
                        <Text style={styles.optionText} numberOfLines={0}>
                          {safeTextRender(option.text)}
                        </Text>
                      </View>

                      {/* REMOVED: Result Icon section completely */}

                      {/* Selection Indicator - UPDATED: Always show when selected */}
                      {isSelected && <View style={styles.selectionPulse} />}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </View>
        </View>
      );
    }
  );

export default MultipleChoicePlayingContent;
