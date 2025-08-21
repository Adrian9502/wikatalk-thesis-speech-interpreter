import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { Circle } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/multipleChoice.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import { safeTextRender } from "@/utils/textUtils";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";
import HintButton from "@/components/games/hints/HintButton";
import useHintStore from "@/store/games/useHintStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";

// Define interfaces
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: number;
  question: string;
  options: Option[];
  level?: string;
  title?: string;
}

interface MultipleChoicePlayingContentProps {
  difficulty: string;
  levelData: any;
  currentQuestion: Question | null;
  selectedOption: string | null;
  handleOptionSelect: (optionId: string) => void;
  isStarted?: boolean;
  levelId: number;
}

const MultipleChoicePlayingContent: React.FC<MultipleChoicePlayingContentProps> =
  React.memo(
    ({
      currentQuestion,
      selectedOption,
      handleOptionSelect,
      difficulty,
      levelId,
    }) => {
      // Simplified animation state
      const [isAnimating, setIsAnimating] = useState(true);

      // Hint store integration
      const {
        currentQuestionHints,
        hintsUsedCount,
        setCurrentQuestion,
        resetQuestionHints,
      } = useHintStore();

      // Memoized gradient colors
      const gameGradientColors = useMemo(
        () => getGameModeGradient("multipleChoice"),
        []
      );

      // Memoized options
      const options = useMemo(
        () => currentQuestion?.options || [],
        [currentQuestion?.options]
      );

      // Generate question ID for hint system
      const questionId = useMemo(() => {
        return `${currentQuestion?.id || levelId}_${difficulty}`;
      }, [currentQuestion?.id, levelId, difficulty]);

      // Simplified animation timing
      useEffect(() => {
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 700);

        return () => clearTimeout(timer);
      }, []);

      // Set current question for hint system
      useEffect(() => {
        if (currentQuestion && questionId) {
          setCurrentQuestion(questionId);
        }
      }, [currentQuestion, questionId, setCurrentQuestion]);

      // Memoized option press handler with hint support
      const handleOptionPress = useCallback(
        (optionId: string) => {
          // Check if option is disabled by hint
          const isDisabled = currentQuestionHints.includes(optionId);

          if (isAnimating || selectedOption !== null || isDisabled) {
            return;
          }

          handleOptionSelect(optionId);
        },
        [isAnimating, selectedOption, handleOptionSelect, currentQuestionHints]
      );

      return (
        <View style={gamesSharedStyles.gameContainer}>
          {/* Question Card */}
          <View style={gamesSharedStyles.questionCardContainer}>
            <LinearGradient
              style={gamesSharedStyles.questionCard}
              colors={gameGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LevelTitleHeader
                levelString={currentQuestion?.level}
                actualTitle={currentQuestion?.title}
                animationDelay={0}
              />
              <View style={gamesSharedStyles.questionContainer}>
                <Text style={gamesSharedStyles.questionText}>
                  {safeTextRender(currentQuestion?.question)}
                </Text>
              </View>

              {/* Decorative Elements */}
              <View style={gamesSharedStyles.cardDecoration1} />
              <View style={gamesSharedStyles.cardDecoration2} />
            </LinearGradient>
          </View>

          {/* Hint Section - Centered */}
          <View style={gameSharedStyles.hintSection}>
            <HintButton
              questionId={questionId}
              gameMode="multipleChoice"
              options={options.map((option) => ({
                id: option.id,
                text: option.text,
                isCorrect: option.isCorrect === true, // FIXED: Explicit boolean conversion
              }))}
              disabled={!!selectedOption || isAnimating}
            />
          </View>

          {/* Options Section */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionsHeader}>
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
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              nestedScrollEnabled={true}
            >
              {options.map((option: Option, index: number) => {
                const isSelected = selectedOption === option.id;
                const isDisabled = currentQuestionHints.includes(option.id);

                return (
                  <View key={option.id} style={styles.optionWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        isSelected && styles.selectedOption,
                        isDisabled && gameSharedStyles.disabledOption,
                      ]}
                      onPress={() => handleOptionPress(option.id)}
                      disabled={
                        isAnimating || selectedOption !== null || isDisabled
                      }
                      activeOpacity={isDisabled ? 1 : 0.8}
                    >
                      <LinearGradient
                        colors={
                          isDisabled
                            ? [
                                "rgba(255, 255, 255, 0.05)",
                                "rgba(255, 255, 255, 0.02)",
                              ]
                            : [
                                "rgba(255, 255, 255, 0.1)",
                                "rgba(255, 255, 255, 0.05)",
                              ]
                        }
                        style={styles.optionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        {/* Option Letter */}
                        <View style={[styles.optionLetter]}>
                          <Text
                            style={[
                              styles.optionLetterText,
                              isDisabled &&
                                gameSharedStyles.disabledOptionLetterText,
                            ]}
                          >
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>

                        {/* Option Content */}
                        <View style={styles.optionContent}>
                          <Text
                            style={[
                              styles.optionText,
                              isDisabled && gameSharedStyles.disabledOptionText,
                            ]}
                            numberOfLines={3}
                          >
                            {safeTextRender(option.text)}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      );
    }
  );

export default MultipleChoicePlayingContent;
