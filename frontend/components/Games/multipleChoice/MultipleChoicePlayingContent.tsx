import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Circle } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/multipleChoice.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import { safeTextRender } from "@/utils/textUtils";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";

// Define interfaces
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
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
}

const MultipleChoicePlayingContent: React.FC<MultipleChoicePlayingContentProps> =
  React.memo(({ currentQuestion, selectedOption, handleOptionSelect }) => {
    // Simplified animation state
    const [isAnimating, setIsAnimating] = useState(true);

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

    // Simplified animation timing
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 700); // Slightly faster

      return () => clearTimeout(timer);
    }, []);

    // Memoized option press handler
    const handleOptionPress = useCallback(
      (optionId: string) => {
        if (isAnimating || selectedOption !== null) return;
        handleOptionSelect(optionId);
      },
      [isAnimating, selectedOption, handleOptionSelect]
    );

    return (
      <View style={gamesSharedStyles.gameContainer}>
        {/* Question Card - No animation, parent handles it */}
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
                    selectedOption ? "rgba(255, 255, 255, 0.6)" : "transparent"
                  }
                />
              ))}
            </View>
          </View>

          {/* FIXED: Use ScrollView instead of FlatList to avoid nesting */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            nestedScrollEnabled={true}
          >
            {options.map((option: Option, index: number) => {
              const isSelected = selectedOption === option.id;

              return (
                <View key={option.id} style={styles.optionWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionPress(option.id)}
                    disabled={isAnimating || selectedOption !== null}
                    activeOpacity={isAnimating ? 1 : 0.8}
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
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>

                      {/* Option Content */}
                      <View style={styles.optionContent}>
                        <Text style={styles.optionText} numberOfLines={3}>
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
  });

export default MultipleChoicePlayingContent;
