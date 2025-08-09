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
import { LinearGradient } from "expo-linear-gradient";
import { X, RefreshCw } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { useRankings } from "@/hooks/useRankings";
import { RankingType } from "@/types/rankingTypes";
import { getRankingCategory } from "@/constant/rankingConstants";

import RankingCategorySelector from "./RankingCategorySelector";
import RankingItem from "./RankingItem";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { iconColors } from "@/constant/colors";

interface RankingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const RankingsModal: React.FC<RankingsModalProps> = ({ visible, onClose }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("quizChampions");

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
    gameMode,
    10 // Limit to 10 users
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
          <ActivityIndicator size="small" color="#FFD700" />
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
      <View style={styles.contentContainer}>
        {/* Category Info Header */}
        {selectedCategoryData && (
          <Animatable.View
            animation="fadeIn"
            duration={300}
            style={styles.categoryInfoHeader}
          >
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
          </Animatable.View>
        )}

        {/* Rankings List */}
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
          <View style={styles.rankingsContainer}>
            {data.rankings.slice(0, 10).map((user, index) => (
              <RankingItem
                key={`${user.userId}-${index}`}
                user={user}
                rank={index + 1}
                type={rankingType}
                isCurrentUser={data.userRank?.rank === index + 1}
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Modal Overlay */}
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={NAVIGATION_COLORS.indigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header with close button */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Rankings</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X width={18} height={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Selector */}
            <RankingCategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            {/* Content Area */}
            {renderContent()}
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: "95%",
    height: "60%",
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
  },
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
    color: iconColors.brightYellow,
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
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 12,
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

export default RankingsModal;
