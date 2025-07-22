import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  focusArea?: string;
  children: React.ReactNode;
  isStarted?: boolean;
  gameStatus?: "idle" | "ready" | "playing" | "completed";
  initialTime?: number;
  gameMode?: string;
  levelString?: string;
  actualTitle?: string;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({ timerRunning, children, initialTime = 0, levelString, actualTitle }) => {
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
          {/* Content Area - now starts immediately */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={200} // Reduced delay since no level section above
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
  contentArea: {
    flex: 1,
  },
});

export default GamePlayingContent;
