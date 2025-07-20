import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { getGameModeGradient } from "@/utils/gameUtils";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  focusArea?: string;
  children: React.ReactNode;
  isStarted?: boolean;
  gameStatus?: "idle" | "ready" | "playing" | "completed";
  initialTime?: number;
  gameMode?: string;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({
    timerRunning,
    difficulty,
    focusArea = "Vocabulary",
    children,
    isStarted = true,
    initialTime = 0,
  }) => {
    const timerStartedRef = React.useRef(false);

    // Optimized timer logging - only log state changes
    React.useEffect(() => {
      if (timerRunning && !timerStartedRef.current) {
        console.log(
          `[GamePlayingContent] Timer started with initialTime: ${initialTime}`
        );
        timerStartedRef.current = true;
      } else if (!timerRunning && timerStartedRef.current) {
        console.log(`[GamePlayingContent] Timer stopped`);
        timerStartedRef.current = false;
      }
    }, [timerRunning, initialTime]);

    return (
      <View style={styles.container}>
        {/* Floating Decorative Elements */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={4000}
          style={[styles.floatingElement, styles.element1]}
        />
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={8000}
          style={[styles.floatingElement, styles.element2]}
        />
        <Animatable.View
          animation="bounce"
          iterationCount="infinite"
          duration={6000}
          style={[styles.floatingElement, styles.element3]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            gameSharedStyles.contentContainer,
            styles.scrollContent,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Enhanced Stats Container */}
          <Animatable.View
            animation="slideInDown"
            duration={800}
            delay={100}
            style={styles.statsContainer}
          >
            {/* Timer Section */}
            {isStarted && (
              <Animatable.View
                animation="fadeInLeft"
                duration={600}
                delay={200}
                style={styles.timerSection}
              >
                <Timer
                  isRunning={timerRunning}
                  initialTime={initialTime}
                  key={`timer-${initialTime}`}
                />
              </Animatable.View>
            )}

            {/* Badges Section */}
            <Animatable.View
              animation="fadeInRight"
              duration={600}
              delay={300}
              style={styles.badgesSection}
            >
              <DifficultyBadge difficulty={difficulty} />
              <FocusAreaBadge focusArea={focusArea} />
            </Animatable.View>
          </Animatable.View>

          {/* Content Area  */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={400}
            style={styles.contentArea}
          >
            {children}
          </Animatable.View>
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
    zIndex: 1,
  },
  element1: {
    width: 80,
    height: 80,
    top: "15%",
    right: -20,
  },
  element2: {
    width: 60,
    height: 60,
    top: "35%",
    left: -15,
  },
  element3: {
    width: 40,
    height: 40,
    top: "60%",
    right: "20%",
  },
  scrollContent: {
    paddingBottom: 40,
    zIndex: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  timerSection: {
    borderWidth: 1,
    borderRadius: 16,
    minWidth: 110,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  badgesSection: {
    flexDirection: "row",
    gap: 12,
  },
  contentArea: {
    flex: 1,
  },
});

export default GamePlayingContent;
