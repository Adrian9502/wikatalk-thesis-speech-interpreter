import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";
import { Target } from "react-native-feather";
import DifficultyCard from "./DifficultyCard";
import StatGrid from "./StatGrid";
import RecentAttempt from "./RecentAttempt";

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
}

const ProgressContent: React.FC<ProgressContentProps> = ({
  progressData,
  isLoading,
  gameMode,
}) => {
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
      // Fix the type error by explicitly typing the section
      sections.push({
        title: "Recent Activity",
        data: progressData.recentAttempts.slice(0, 5) as any[], // Use type assertion here
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
          return <StatGrid progressData={item} />;

        case "attempts":
          return (
            <RecentAttempt attempt={item} index={section.data.indexOf(item)} />
          );

        default:
          return null;
      }
    },
    [getDifficultyColor, getDifficultyStars]
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" size="small" />
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  // Error/empty state
  if (!progressData) {
    return (
      <View style={styles.errorContainer}>
        <Target width={32} height={32} color="rgba(255,255,255,0.6)" />
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

// Simple component for the summary section
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 12,
  },
  sectionContent: {
    gap: 8,
  },
  // Summary card styles
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  completionBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  progressSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  completedText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#FFD700",
  },
  totalText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
    marginLeft: 4,
  },
  encouragementText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  attemptsTitle: {
    color: "#fff",
  },
  attemptsContainer: {
    gap: 12,
    marginTop: 4,
  },
});

export default React.memo(ProgressContent);
