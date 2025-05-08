import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Star, CheckCircle, Lock } from "react-native-feather";
import { Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for level selection (replace with your actual data)
const generateLevels = (count, completed = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    title: `Level ${i + 1}`,
    // Difficulty gets harder as levels increase
    difficulty: i < 5 ? "Easy" : i < 10 ? "Medium" : "Hard",
    // Stars are more for completed levels, random for in-progress
    stars:
      i < completed ? 3 : i === completed ? Math.floor(Math.random() * 3) : 0,
    // Status: completed, current, or locked
    status:
      i < completed ? "completed" : i === completed ? "current" : "locked",
    // XP reward increases with difficulty
    xpReward: 5 + i * 2,
    // Special node (every 5th level is a treasure chest)
    isSpecial: (i + 1) % 5 === 0,
    specialType:
      (i + 1) % 10 === 0 ? "trophy" : (i + 1) % 5 === 0 ? "chest" : null,
  }));
};

const LevelSelection = () => {
  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { activeTheme } = useThemeStore();

  useEffect(() => {
    setLevels(generateLevels(20));
  }, []);

  const handleLevelSelect = (level) => {
    if (level.status === "locked") return;

    setSelectedLevel(level);

    setTimeout(() => {
      router.push({
        pathname: "/(games)/Questions",
        params: {
          levelId: level.id,
          gameMode,
          gameTitle,
        },
      });
    }, 300);
  };

  const handleBack = () => {
    router.back();
  };

  const renderLevelNode = (level, index) => {
    // Special nodes like chest or trophy
    if (level.isSpecial) {
      return (
        <Animatable.View
          key={level.id}
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.specialNodeContainer}
        >
          <TouchableOpacity
            activeOpacity={level.status === "locked" ? 0.6 : 0.8}
            onPress={() => handleLevelSelect(level)}
            disabled={level.status === "locked"}
            style={[
              styles.specialNode,
              level.status === "locked" && { opacity: 0.5 },
            ]}
          >
            {level.specialType === "chest" ? (
              <View style={styles.chestIcon}>
                <Text style={styles.chestText}>🎁</Text>
              </View>
            ) : (
              <View style={styles.trophyIcon}>
                <Text style={styles.trophyText}>🏆</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.specialLabel}>{level.title}</Text>
        </Animatable.View>
      );
    }

    // Regular level node
    return (
      <View key={level.id} style={styles.levelNodeContainer}>
        <TouchableOpacity
          activeOpacity={level.status === "locked" ? 0.6 : 0.8}
          onPress={() => handleLevelSelect(level)}
          disabled={level.status === "locked"}
        >
          <View
            style={[
              styles.levelConnector,
              index === 0 && { opacity: 0 },
              level.status !== "locked" ? styles.activeConnector : {},
            ]}
          />

          <LinearGradient
            colors={
              level.status === "current"
                ? ["#8BC34A", "#7CB342"]
                : level.status === "completed"
                ? ["#FFD700", "#FFA000"]
                : ["#9E9E9E", "#757575"]
            }
            style={[
              styles.levelCircle,
              selectedLevel?.id === level.id && styles.selectedLevel,
            ]}
          >
            {level.status === "current" && (
              <View style={styles.starContainer}>
                <Star width={24} height={24} color="#FFFFFF" />
              </View>
            )}
            {level.status === "completed" && (
              <View style={styles.checkContainer}>
                <CheckCircle width={24} height={24} color="#FFFFFF" />
              </View>
            )}
            {level.status === "locked" && (
              <View style={styles.lockContainer}>
                <Lock width={20} height={20} color="#FFFFFF" />
              </View>
            )}
          </LinearGradient>

          <View
            style={[
              styles.levelConnector,
              index === levels.length - 1 && { opacity: 0 },
              level.status !== "locked" ? styles.activeConnector : {},
            ]}
          />
        </TouchableOpacity>

        <View style={styles.levelInfo}>
          <Text style={styles.levelNumber}>{level.title}</Text>
          {level.status !== "locked" && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{level.xpReward} XP</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft width={24} height={24} color={BASE_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{gameTitle || "Levels"}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Level progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (levels.filter((l) => l.status === "completed").length /
                      levels.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Course Progress</Text>
        </View>

        {/* Levels path */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.levelsPathContainer}>
            {levels.map((level, index) => renderLevelNode(level, index))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111B21",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8BC34A",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.7,
    marginTop: 5,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  levelsPathContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  levelNodeContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  specialNodeContainer: {
    alignItems: "center",
    marginVertical: 15,
    zIndex: 1,
  },
  levelConnector: {
    width: 4,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "center",
  },
  activeConnector: {
    backgroundColor: "#8BC34A",
  },
  levelCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  specialNode: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  chestIcon: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  chestText: {
    fontSize: 36,
  },
  trophyIcon: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  trophyText: {
    fontSize: 36,
  },
  selectedLevel: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  starContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  lockContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelInfo: {
    alignItems: "center",
    marginTop: 5,
    paddingHorizontal: 10,
  },
  levelNumber: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 3,
  },
  specialLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  xpBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  xpText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default LevelSelection;
