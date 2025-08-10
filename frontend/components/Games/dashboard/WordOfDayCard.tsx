import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Volume2, Star } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/AnimatedSection";

interface WordOfDayCardProps {
  wordOfTheDay: any;
  isPlaying: boolean;
  isLoading: boolean;
  onCardPress: () => void;
  onPlayPress: () => void;
}

// SIMPLE: Global flag - animate only once per app session
let WORD_ANIMATION_PLAYED = false;

const WordOfDayCard = React.memo(
  ({
    wordOfTheDay,
    isPlaying,
    isLoading,
    onCardPress,
    onPlayPress,
  }: WordOfDayCardProps) => {
    const [shouldAnimate] = useState(!WORD_ANIMATION_PLAYED);

    // Simple animated values
    const fadeAnim = useState(
      () => new Animated.Value(shouldAnimate ? 0 : 1)
    )[0];
    const slideAnim = useState(
      () => new Animated.Value(shouldAnimate ? 20 : 0)
    )[0];

    // SIMPLE: One animation for the card
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

    return (
      <Animated.View
        style={[
          styles.featuredSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SectionHeader
          icon={<Star width={20} height={20} color="#FFD700" />}
          title="Word of the Day"
          subtitle="Expand your vocabulary daily"
        />

        <TouchableOpacity
          style={styles.wordOfTheDayCard}
          activeOpacity={0.9}
          onPress={onCardPress}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
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
                <Calendar width={14} height={14} color="#667eea" />
                <Text style={styles.wordBadgeText}>TODAY'S WORD</Text>
              </View>
              <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
                {isLoading && isPlaying ? (
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <Volume2 width={16} height={16} color="#667eea" />
                  </Animated.View>
                ) : (
                  <Volume2 width={16} height={16} color="#667eea" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.wordContent}>
              <Text style={styles.wordMainText}>
                {wordOfTheDay ? wordOfTheDay.english : "Loading..."}
              </Text>
              <Text style={styles.wordTranslation}>
                {wordOfTheDay && wordOfTheDay.translation
                  ? wordOfTheDay.translation
                  : "Discovering meaning..."}
              </Text>
            </View>

            <View style={styles.wordCardFooter}>
              <Text style={styles.exploreText}>Tap to explore more</Text>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ... keep all your existing styles ...
const styles = StyleSheet.create({
  featuredSection: {
    marginBottom: 12,
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
    padding: 20,
    borderRadius: 20,
    position: "relative",
    minHeight: 120,
    overflow: "hidden",
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordContent: {
    flex: 1,
    justifyContent: "center",
  },
  wordMainText: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  wordTranslation: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  wordCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  exploreText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Medium",
  },
  wordDecoPattern1: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  wordDecoPattern2: {
    position: "absolute",
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  wordDecoPattern3: {
    position: "absolute",
    top: 20,
    right: 40,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

WordOfDayCard.displayName = "WordOfDayCard";
export default WordOfDayCard;
