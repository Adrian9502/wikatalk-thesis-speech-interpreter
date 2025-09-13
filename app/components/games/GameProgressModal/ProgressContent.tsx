import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";
import { Target } from "react-native-feather";
import DifficultyCard from "./DifficultyCard";
import StatGrid from "./StatGrid";
import RecentAttempt from "./RecentAttempt";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
// NEW: Import centralized stats utilities
import { useGameModeSummaryStats } from "@/utils/gameStatsUtils";
import {
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
} from "@/constant/fontSizes";

interface ProgressContentProps {
  progressData: EnhancedGameModeProgress | null;
  isLoading: boolean;
  gameMode: string;
}

interface SectionData {
  title: string;
  type: string;
  data: any[];
}

interface OverallSummaryProps {
  completionRate: number;
  completed: number;
  total: number;
  // NEW: Additional props for enhanced summary
  successRate: number;
  totalTimeSpent: string;
  totalAttempts: number;
  averageScore: number;
}

const ProgressContent: React.FC<ProgressContentProps> = ({
  progressData,
  gameMode,
}) => {
  // NEW: Use centralized summary stats
  const summaryStats = useGameModeSummaryStats(gameMode, progressData);

  // Memoized helper functions
  const getDifficultyColor = useCallback((diff: string): string => {
    switch (diff) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  }, []);

  const getDifficultyStars = useCallback((diff: string): string => {
    switch (diff) {
      case "easy":
        return "⭐";
      case "medium":
        return "⭐⭐";
      case "hard":
        return "⭐⭐⭐";
      default:
        return "⭐";
    }
  }, []);

  // Create section data for FlatList
  const sections = useMemo(() => {
    if (!progressData) return [];

    const sections: SectionData[] = [
      {
        title: "Overall Progress",
        data: [progressData],
        type: "summary",
      },
      {
        title: "Progress by Difficulty",
        data: progressData.difficultyBreakdown,
        type: "difficulty",
      },
      {
        title: "Overall Statistics",
        data: [progressData],
        type: "stats",
      },
    ];

    if (progressData.recentAttempts && progressData.recentAttempts.length > 0) {
      sections.push({
        title: "Recent Progress",
        data: progressData.recentAttempts.slice(0, 5) as any[],
        type: "attempts",
      });
    }

    return sections;
  }, [progressData]);

  // Optimized render item function
  const renderSectionContent = useCallback(
    ({ item, section }: { item: any; section: SectionData }) => {
      switch (section.type) {
        case "summary":
          return (
            <OverallSummary
              completionRate={Math.round(item.overallCompletionRate)}
              completed={item.completedLevels}
              total={item.totalLevels}
              successRate={summaryStats.successRate}
              totalTimeSpent={summaryStats.formattedTotalTime}
              totalAttempts={summaryStats.totalAttempts}
              averageScore={summaryStats.averageScore}
            />
          );

        case "difficulty":
          return (
            <DifficultyCard
              diffProgress={item}
              getDifficultyColor={getDifficultyColor}
              getDifficultyStars={getDifficultyStars}
            />
          );

        case "stats":
          return <StatGrid gameMode={gameMode} progressData={item} />;

        case "attempts":
          return (
            <RecentAttempt attempt={item} index={section.data.indexOf(item)} />
          );

        default:
          return null;
      }
    },
    [getDifficultyColor, getDifficultyStars, summaryStats, gameMode]
  );

  // Error/empty state
  if (!progressData) {
    return (
      <View style={styles.errorContainer}>
        <Target width={28} height={28} color="rgba(255,255,255,0.6)" />
        <Text style={styles.errorText}>No progress data available</Text>
        <Text style={styles.errorSubtext}>
          Start playing to see your statistics!
        </Text>
      </View>
    );
  }

  // Render optimized content with sections
  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      style={styles.content}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      removeClippedSubviews={true}
    >
      {sections.map((section, index) => (
        <View key={`section-${index}`} style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              section.type === "attempts" && styles.attemptsTitle,
            ]}
          >
            {section.title}
          </Text>
          <View
            style={[
              styles.sectionContent,
              section.type === "attempts" && styles.attemptsContainer,
            ]}
          >
            {section.data.map((item, idx) => (
              <React.Fragment key={`${section.type}-${idx}`}>
                {renderSectionContent({ item, section })}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const OverallSummary = React.memo<OverallSummaryProps>(
  ({ completionRate, completed, total }) => {
    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>Overall Progress</Text>
          <View style={styles.completionBadge}>
            <Text style={styles.badgeText}>{completionRate}% COMPLETE</Text>
          </View>
        </View>
        <View style={styles.progressSummary}>
          <View style={styles.progressNumbers}>
            <Text style={styles.completedText}>{completed}</Text>
            <Text style={styles.totalText}>/ {total} Levels</Text>
          </View>
        </View>
        <Text style={styles.encouragementText}>
          {completionRate === 100
            ? "Perfect! You've completed all levels!"
            : `${total - completed} more to go!`}
        </Text>
      </View>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 10,
  },
  sectionContent: {
    gap: 8,
  },
  // Summary card styles
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  completionBadge: {
    backgroundColor: BASE_COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  progressSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  completedText: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: POPPINS_FONT.semiBold,
    color: ICON_COLORS.brightYellow,
  },
  totalText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginLeft: 4,
  },
  encouragementText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255,255,255,0.8)",
  },
  attemptsTitle: {
    color: BASE_COLORS.white,
  },
  attemptsContainer: {
    gap: 12,
    marginTop: 4,
  },
});

export default React.memo(ProgressContent);
