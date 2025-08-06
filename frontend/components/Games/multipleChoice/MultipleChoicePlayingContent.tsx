import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Circle } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/multipleChoice.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import { safeTextRender } from "@/utils/textUtils";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";

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
    // NEW: Track animation state
    const [isAnimating, setIsAnimating] = useState(true);

    // Get game mode gradient for consistency
    const gameGradientColors = React.useMemo(
      () => getGameModeGradient("multipleChoice"),
      []
    );

    const options = React.useMemo(
      () => currentQuestion?.options || [],
      [currentQuestion?.options]
    );

    // NEW: Enable interactions after animations complete
    useEffect(() => {
      const animationDuration = 700 + options.length * 100 + 200; // Total animation time
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }, [options.length]);

    // NEW: Disabled option handler
    const handleOptionPress = (optionId: string) => {
      if (isAnimating || selectedOption !== null) return;
      handleOptionSelect(optionId);
    };

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
              levelString={currentQuestion?.level}
              actualTitle={currentQuestion?.title}
              animationDelay={0}
            />
            <View style={gamesSharedStyles.questionContainer}>
              {/* Question Text */}
              <Text style={gamesSharedStyles.questionText}>
                {safeTextRender(currentQuestion?.question)}
              </Text>
            </View>

            {/* Decorative Elements */}
            <View style={gamesSharedStyles.cardDecoration1} />
            <View style={gamesSharedStyles.cardDecoration2} />
          </LinearGradient>
        </Animatable.View>

        {/* Enhanced Options Section */}
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
                    selectedOption ? "rgba(255, 255, 255, 0.6)" : "transparent"
                  }
                />
              ))}
            </View>
          </Animatable.View>

          {options.map((option: Option, index: number) => {
            const isSelected = selectedOption === option.id;

            return (
              <Animatable.View
                key={option.id}
                animation="slideInUp"
                duration={600}
                delay={700 + index * 100}
                style={styles.optionWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.selectedOption,
                    // NEW: Add disabled styling
                    // isAnimating && styles.optionDisabled,
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
              </Animatable.View>
            );
          })}
        </View>
      </View>
    );
  });

export default MultipleChoicePlayingContent;
