import React, { useState, useCallback, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { X, RefreshCw } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { useRankings } from "@/hooks/useRankings";
import { RankingType } from "@/types/rankingTypes";
import {
  RANKING_CATEGORIES,
  getRankingCategory,
} from "@/constant/rankingConstants";
import { BASE_COLORS, iconColors } from "@/constant/colors";

import RankingCategorySelector from "./RankingCategorySelector";
import RankingItem from "./RankingItem";

interface RankingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const RankingsModal: React.FC<RankingsModalProps> = ({ visible, onClose }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("coinMasters");

  // Parse selected category to get type and game mode
  const { rankingType, gameMode } = useMemo(() => {
    const parts = selectedCategory.split("_");
    return {
      rankingType: parts[0] as RankingType,
      gameMode: parts[1] || undefined,
    };
  }, [selectedCategory]);

  const { data, isLoading, error, refetch } = useRankings(
    rankingType,
    gameMode
  );

  const selectedCategoryData = useMemo(() => {
    return getRankingCategory(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load rankings</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <RefreshCw width={16} height={16} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!data || data.rankings.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No rankings available</Text>
          <Text style={styles.emptySubtext}>
            Be the first to appear on the leaderboard!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.rankingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#FFD700"
            colors={["#FFD700"]}
          />
        }
      >
        {/* User's rank (if not in top rankings) */}
        {data.userRank && data.userRank.rank > data.rankings.length && (
          <View style={styles.userRankSection}>
            <Text style={styles.userRankTitle}>Your Rank</Text>
            <View style={styles.userRankCard}>
              <Text style={styles.userRankText}>
                #{data.userRank.rank} - {data.userRank.value}
              </Text>
            </View>
          </View>
        )}

        {/* Rankings list */}
        <View style={styles.rankingsContainer}>
          {data.rankings.map((user, index) => (
            <RankingItem
              key={`${user.userId}-${index}`}
              user={user}
              rank={index + 1}
              type={rankingType}
              isCurrentUser={data.userRank?.rank === index + 1}
            />
          ))}
        </View>

        {/* Stats footer */}
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>Total Players: {data.totalCount}</Text>
          <Text style={styles.statsText}>
            Last Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={selectedCategoryData?.color || ["#4361EE", "#3A0CA3"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons
                  name="trophy"
                  size={24}
                  color={iconColors.brightYellow}
                />
                <Text style={styles.title}>Rankings</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X width={24} height={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Selected Category Info */}
            {selectedCategoryData && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.categoryInfo}
              >
                <Text style={styles.categoryTitle}>
                  {selectedCategoryData.icon} {selectedCategoryData.title}
                </Text>
                <Text style={styles.categoryDescription}>
                  {selectedCategoryData.description}
                </Text>
              </Animatable.View>
            )}
          </View>

          {/* Category Selector */}
          <RankingCategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Content */}
          <View style={styles.content}>{renderContent()}</View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  rankingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userRankSection: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  userRankTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFD700",
    marginBottom: 8,
  },
  userRankCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  userRankText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },
  rankingsContainer: {
    marginBottom: 20,
  },
  statsFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 16,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 4,
  },
});

export default RankingsModal;
