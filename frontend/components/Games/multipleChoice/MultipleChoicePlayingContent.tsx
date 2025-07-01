import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import styles from "@/styles/games/multipleChoice.styles";
import { getOptionStyle } from "@/utils/games/optionStyles";
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

const MultipleChoicePlayingContent: React.FC<
  MultipleChoicePlayingContentProps
> = ({
  difficulty,
  levelData,
  currentQuestion,
  selectedOption,
  handleOptionSelect,
  isStarted = true,
}) => {
  return (
    <>
      {/* Question Card */}
      <Animatable.View
        animation="fadeInUp"
        duration={700}
        delay={200}
        style={gameSharedStyles.questionCardWrapper}
      >
        <LinearGradient
          colors={
            getDifficultyColors(difficulty, levelData) as readonly [
              string,
              string
            ]
          }
          style={gameSharedStyles.questionGradient}
        >
          <Text style={gameSharedStyles.questionText}>
            {currentQuestion?.question}
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Options */}
      <View
        style={[
          gameSharedStyles.optionsContainer,
          styles.multipleChoiceOptions,
        ]}
      >
        {currentQuestion?.options &&
          currentQuestion.options.map((option: Option, index: number) => (
            <Animatable.View
              key={option.id}
              animation="fadeInUp"
              duration={600}
              delay={300 + index * 100}
            >
              <TouchableOpacity
                style={getOptionStyle({
                  isSelected: selectedOption === option.id,
                  isCorrect: option.isCorrect,
                })}
                onPress={() => handleOptionSelect(option.id)}
                disabled={selectedOption !== null || !isStarted}
                activeOpacity={0.9}
              >
                <View style={gameSharedStyles.optionContent}>
                  <View
                    style={[
                      gameSharedStyles.optionIdContainer,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    <Text style={gameSharedStyles.optionId}>
                      {option.id.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={gameSharedStyles.optionText} numberOfLines={0}>
                    {safeTextRender(option.text)}
                  </Text>
                </View>

                {selectedOption === option.id && (
                  <View style={gameSharedStyles.resultIconContainer}>
                    {option.isCorrect ? (
                      <Check width={18} height={18} color={BASE_COLORS.white} />
                    ) : (
                      <X width={18} height={18} color={BASE_COLORS.white} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </Animatable.View>
          ))}
      </View>
    </>
  );
};

export default React.memo(MultipleChoicePlayingContent);
