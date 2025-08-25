import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Volume2, Star, ArrowRight } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/SectionHeader";
import CoinsDisplay from "@/components/games/rewards/CoinsDisplay";
import {
  BASE_COLORS,
  ICON_COLORS,
  WORD_OF_DAY_GRADIENT,
} from "@/constant/colors";

interface WordOfTheDayCardProps {
  wordOfTheDay: any;
  isPlaying: boolean;
  isLoading: boolean;
  onCardPress: () => void;
  onPlayPress: () => void;
  onCoinsPress: () => void;
}

let WORD_ANIMATION_PLAYED = false;

const WordOfTheDayCard = React.memo(
  ({
    wordOfTheDay,
    isPlaying,
    isLoading,
    onCardPress,
    onPlayPress,
    onCoinsPress,
  }: WordOfTheDayCardProps) => {
    const [shouldAnimate] = useState(!WORD_ANIMATION_PLAYED);

    const fadeAnim = useState(
      () => new Animated.Value(shouldAnimate ? 0 : 1)
    )[0];
    const slideAnim = useState(
      () => new Animated.Value(shouldAnimate ? 20 : 0)
    )[0];

    const spinAnim = useState(() => new Animated.Value(0))[0];

    useEffect(() => {
      if (!shouldAnimate) return;

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        WORD_ANIMATION_PLAYED = true;
        console.log("[WordOfDayCard] Simple animation completed");
      });
    }, [shouldAnimate, fadeAnim, slideAnim]);

    useEffect(() => {
      let spinAnimation: Animated.CompositeAnimation | null = null;

      if (isPlaying) {
        spinAnimation = Animated.loop(
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        );
        spinAnimation.start();
      } else {
        console.log("[WordOfDayCard] Stopping spin animation");
        spinAnim.stopAnimation(() => {
          spinAnim.setValue(0);
        });
      }

      return () => {
        if (spinAnimation) {
          console.log("[WordOfDayCard] Cleanup: stopping spin animation");
          spinAnimation.stop();
        }
      };
    }, [isPlaying, spinAnim]);

    const shouldSpin = isPlaying;

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.inlineHeaderContainer}>
          <SectionHeader
            icon={<Star width={20} height={20} color={ICON_COLORS.gold} />}
            title="Word of the Day"
            subtitle="Expand your vocabulary daily"
          />
          <CoinsDisplay onPress={onCoinsPress} />
        </View>

        <TouchableOpacity
          style={styles.wordOfTheDayCard}
          activeOpacity={0.9}
          onPress={onCardPress}
        >
          <LinearGradient
            colors={WORD_OF_DAY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wordCardGradient}
          >
            {/* Decorative Elements */}
            <View style={styles.wordDecoPattern1} />
            <View style={styles.wordDecoPattern2} />
            <View style={styles.wordDecoPattern3} />

            <View style={styles.wordCardHeader}>
              <View style={styles.wordBadge}>
                <Calendar width={14} height={14} color="#fff" />
                <Text style={styles.wordBadgeText}>TODAY'S WORD</Text>
              </View>
              <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
                {shouldSpin ? (
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: spinAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <Volume2
                      width={17}
                      height={17}
                      color={WORD_OF_DAY_GRADIENT[0]}
                    />
                  </Animated.View>
                ) : (
                  <Volume2
                    width={17}
                    height={17}
                    color={WORD_OF_DAY_GRADIENT[0]}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.wordContent}>
              <Text style={styles.wordMainText}>
                {wordOfTheDay ? (
                  wordOfTheDay.english
                ) : (
                  <ActivityIndicator color={BASE_COLORS.white} size="small" />
                )}
              </Text>
              <Text style={styles.wordTranslation}>
                {wordOfTheDay && wordOfTheDay.translation ? (
                  wordOfTheDay.translation
                ) : (
                  <ActivityIndicator color={BASE_COLORS.white} size="small" />
                )}
              </Text>
            </View>

            <View style={styles.wordCardFooter}>
              <Text style={styles.exploreText}>Tap to explore more</Text>
              <View style={styles.arrowContainer}>
                <ArrowRight width={16} height={16} color={BASE_COLORS.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  inlineHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  wordOfTheDayCard: {
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  wordCardGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    position: "relative",
    minHeight: 120,
    overflow: "hidden",
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  wordBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordContent: {
    flex: 1,
    justifyContent: "center",
  },
  wordMainText: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  wordTranslation: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  wordCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exploreText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordDecoPattern1: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  wordDecoPattern2: {
    position: "absolute",
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  wordDecoPattern3: {
    position: "absolute",
    top: 60,
    right: 100,
    width: 50,
    height: 50,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});

WordOfTheDayCard.displayName = "WordOfDayCard";
export default WordOfTheDayCard;
