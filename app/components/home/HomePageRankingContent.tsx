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
import { getRankingCategory } from "@/constants/rankingConstants";
import RankingItem from "@/components/games/rankings/RankingItem";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import { useAuth } from "@/context/AuthContext";
import { useRankingsModal } from "@/components/games/RankingsModalProvider";

interface HomePageRankingContentProps {
  selectedCategory: string;
  visible: boolean;
}

const HomePageRankingContent: React.FC<HomePageRankingContentProps> = ({
  selectedCategory,
  visible,
}) => {
  // Get current user data for proper identification
  const { userData } = useAuth();
  const { showRankingsModal } = useRankingsModal();
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

  // Helper function to identify current user
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
    console.log(
      `[HomePageRankingContent] Refreshing ${selectedCategory} rankings`
    );
    refresh();
  };

  // Show loading state when switching categories or initially loading
  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={BASE_COLORS.white} />
        <Text style={styles.loadingText}>Loading rankings...</Text>
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
          <RefreshCw width={14} height={14} color={BASE_COLORS.white} />
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

  // If no data yet and not loading (initial state), return loading
  if (!data && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={BASE_COLORS.white} />
        <Text style={styles.loadingText}>Loading rankings...</Text>
      </View>
    );
  }

  // If we're still loading initial data, show loading
  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={BASE_COLORS.white} />
        <Text style={styles.loadingText}>Loading rankings...</Text>
      </View>
    );
  }

  // Render main content
  return (
    <View style={styles.contentContainer}>
      {/* Category Info Header  */}
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

      {/* Rankings List  */}
      <ScrollView
        bounces={false}
        overScrollMode="never"
        style={styles.rankingsList}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !!data}
            onRefresh={handleRefresh}
            tintColor={BASE_COLORS.white}
          />
        }
      >
        <View style={styles.rankingsContainer}>
          {data.rankings
            .slice(0, 10)
            .map((user: RankingUser, index: number) => (
              <RankingItem
                key={`homepage-${user.userId}-${index}`}
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

        {/* View All Rankings Button */}
        <View style={styles.viewAllContainer}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              console.log(
                "[HomePageRankingContent] Opening full rankings modal"
              );
              showRankingsModal();
            }}
          >
            <Text style={styles.viewAllText}>View All Rankings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  categoryInfoHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    margin: 12,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconContainer: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.yellow,
  },
  categoryDescription: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    marginTop: 12,
  },
  errorText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  errorSubtext: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
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
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  emptyText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  rankingsList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  rankingsContainer: {
    paddingBottom: 8,
  },
  userRankSection: {
    marginTop: 8,
    paddingBottom: 8,
  },
  userRankDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.yellow,
    marginHorizontal: 8,
  },
  userRankCard: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    alignItems: "center",
  },
  userRankText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.yellow,
  },
  viewAllContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  viewAllButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
  },
});

export default React.memo(HomePageRankingContent);
