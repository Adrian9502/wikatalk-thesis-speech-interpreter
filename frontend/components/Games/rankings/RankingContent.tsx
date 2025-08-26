import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { RefreshCw } from "react-native-feather";
import { useRankings } from "@/hooks/useRankings";
import { RankingType, RankingUser } from "@/types/rankingTypes";
import { getRankingCategory } from "@/constant/rankingConstants";
import RankingItem from "./RankingItem";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import { useAuth } from "@/context/AuthContext"; // Add this import

interface RankingContentProps {
  selectedCategory: string;
  visible: boolean;
}

const RankingContent: React.FC<RankingContentProps> = ({
  selectedCategory,
  visible,
}) => {
  // Get current user data for proper identification
  const { userData } = useAuth();
  const currentUserId = userData?.id || userData?._id;
  const currentUsername = userData?.username;

  // Only fetch when component is visible
  const { data, isLoading, error, refresh } = useRankings(
    selectedCategory,
    visible
  );

  // Parse category config - memoized
  const categoryConfig = useMemo(() => {
    const parts = selectedCategory.split("_");
    return {
      rankingType: parts[0] as RankingType,
      gameMode: parts[1] || undefined,
    };
  }, [selectedCategory]);

  // Get category data - memoized
  const selectedCategoryData = useMemo(() => {
    return getRankingCategory(selectedCategory);
  }, [selectedCategory]);

  // FIXED: Helper function to identify current user
  const isCurrentUserItem = (user: RankingUser): boolean => {
    // Primary check: user ID
    if (currentUserId && user.userId) {
      return user.userId.toString() === currentUserId.toString();
    }

    // Fallback: username (exact match)
    if (currentUsername && user.username) {
      return user.username.toLowerCase() === currentUsername.toLowerCase();
    }

    return false;
  };

  // Refresh handler
  const handleRefresh = () => {
    console.log(`[RankingContent] Refreshing ${selectedCategory} rankings`);
    refresh();
  };

  // FIXED: Don't show loading on initial render - let provider handle it
  // Only show loading during refresh operations
  if (isLoading && data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={BASE_COLORS.white} />
        <Text style={styles.loadingText}>Refreshing rankings...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load rankings</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <RefreshCw width={16} height={16} color={BASE_COLORS.white} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (data && (!data.rankings || data.rankings.length === 0)) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No rankings available</Text>
        <Text style={styles.emptySubtext}>
          Be the first to appear on the leaderboard!
        </Text>
      </View>
    );
  }

  // If no data yet and not loading (initial state), return null to let provider handle loading
  if (!data && !isLoading) {
    return null;
  }

  // If we're still loading initial data, return null (provider shows loading)
  if (!data) {
    return null;
  }

  // Render main content
  return (
    <View style={styles.contentContainer}>
      {/* Category Info Header */}
      {selectedCategoryData && (
        <View style={styles.categoryInfoHeader}>
          <View style={styles.categoryTitleRow}>
            <View style={styles.categoryIconContainer}>
              {selectedCategoryData.icon}
            </View>
            <Text style={styles.categoryTitle}>
              {selectedCategoryData.title}
            </Text>
          </View>
          <Text style={styles.categoryDescription}>
            {selectedCategoryData.description}
          </Text>
        </View>
      )}

      {/* Rankings List */}
      <ScrollView
        style={styles.rankingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.rankingsContainer}>
          {data.rankings
            .slice(0, 10)
            .map((user: RankingUser, index: number) => (
              <RankingItem
                key={`${user.userId}-${index}`}
                user={user}
                rank={index + 1}
                type={categoryConfig.rankingType}
                isCurrentUser={isCurrentUserItem(user)}
              />
            ))}
        </View>

        {/* User's rank (if not in top 10) */}
        {data.userRank && data.userRank.rank > 10 && (
          <View style={styles.userRankSection}>
            <View style={styles.userRankDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Your Rank</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.userRankCard}>
              <Text style={styles.userRankText}>
                #{data.userRank.rank} - {data.userRank.value}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
    marginTop: 8,
  },
  categoryInfoHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryIconContainer: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: ICON_COLORS.brightYellow,
  },
  categoryDescription: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  errorSubtext: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  rankingsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  rankingsContainer: {
    paddingBottom: 16,
  },
  userRankSection: {
    marginTop: 8,
    paddingBottom: 16,
  },
  userRankDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#FFD700",
    marginHorizontal: 8,
  },
  userRankCard: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    alignItems: "center",
  },
  userRankText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFD700",
  },
});

export default React.memo(RankingContent);
