import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
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

const WordOfDayCard = React.memo(
  ({
    wordOfTheDay,
    isPlaying,
    isLoading,
    onCardPress,
    onPlayPress,
  }: WordOfDayCardProps) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        delay={200}
        style={styles.featuredSection}
        useNativeDriver
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
                  <Animatable.View
                    animation="rotate"
                    iterationCount="infinite"
                    duration={1000}
                    useNativeDriver
                  >
                    <Volume2 width={16} height={16} color="#667eea" />
                  </Animatable.View>
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
      </Animatable.View>
    );
  }
);

// Include all styles from the original component
const styles = StyleSheet.create({
  featuredSection: {
    marginBottom: 40,
  },
  wordOfTheDayCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  wordCardGradient: {
    padding: 20,
    minHeight: 160,
    position: "relative",
  },
  wordDecoPattern1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  wordDecoPattern2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  wordDecoPattern3: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#667eea",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
});

WordOfDayCard.displayName = "WordOfDayCard";
export default WordOfDayCard;
