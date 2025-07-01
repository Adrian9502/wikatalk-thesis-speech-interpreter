import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import styles from "@/styles/games/identification.styles";
import { getWordStyle } from "@/utils/games/optionStyles";
import { safeTextRender } from "@/utils/textUtils";

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
  return (
    <>
      {/* Question Card */}
      <Animatable.View
        animation="fadeInUp"
        duration={500}
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
            {currentSentence?.sentence || currentSentence?.question}
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Words Container - Two per row */}
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={200}
        style={gameSharedStyles.optionsContainer}
      >
        <View style={styles.twoColumnContainer}>
          {words && words.length > 0 ? (
            words.map((word, index) => (
              <Animatable.View
                key={`choice-${index}-${word.text || word.clean}`}
                animation="fadeInUp"
                duration={600}
                delay={300 + index * 100}
                style={styles.optionWrapper}
              >
                <TouchableOpacity
                  style={getWordStyle({
                    isSelected: selectedWord !== null && selectedWord === index,
                    isCorrect:
                      word.clean?.toLowerCase() ===
                      currentSentence?.answer?.toLowerCase(),
                  })}
                  onPress={() => handleWordSelect(index)}
                  disabled={selectedWord !== null}
                  activeOpacity={0.9}
                >
                  <View style={gameSharedStyles.optionContent}>
                    <View style={gameSharedStyles.optionIdContainer}>
                      <Text style={gameSharedStyles.optionId}>{index + 1}</Text>
                    </View>
                    <Text style={gameSharedStyles.optionText} numberOfLines={0}>
                      {safeTextRender(word.text)}
                    </Text>
                  </View>

                  {/* Show check/x icon if selected */}
                  {selectedWord === index && (
                    <View style={gameSharedStyles.resultIconContainer}>
                      {word.clean?.toLowerCase() ===
                      currentSentence?.answer?.toLowerCase() ? (
                        <Check
                          width={18}
                          height={18}
                          color={BASE_COLORS.white}
                        />
                      ) : (
                        <X width={18} height={18} color={BASE_COLORS.white} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </Animatable.View>
            ))
          ) : (
            <Text style={{ color: "white", textAlign: "center" }}>
              No options available
            </Text>
          )}
        </View>
      </Animatable.View>

      {/* Translation Button */}
      <TouchableOpacity
        style={gameSharedStyles.translationButton}
        onPress={toggleTranslation}
      >
        <Text style={gameSharedStyles.translationButtonText}>
          {showTranslation ? "Hide Translation" : "Show Translation"}
        </Text>
      </TouchableOpacity>

      {/* Translation Card */}
      {showTranslation && (
        <View style={gameSharedStyles.translationCard}>
          <Text style={gameSharedStyles.translationText}>
            {currentSentence?.translation || "Translation not available"}
          </Text>
        </View>
      )}
    </>
  );
};

export default React.memo(IdentificationPlayingContent);
