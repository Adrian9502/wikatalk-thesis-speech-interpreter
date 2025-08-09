import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RankingUser } from "@/types/rankingTypes";
import { formatTime } from "@/utils/gameUtils";
import { iconColors, BASE_COLORS } from "@/constant/colors";

interface RankingItemProps {
  user: RankingUser;
  rank: number;
  type: string;
  isCurrentUser?: boolean;
}

const RankingItem: React.FC<RankingItemProps> = ({
  user,
  rank,
  type,
  isCurrentUser = false,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  const getRankDisplay = (rank: number): React.ReactNode => {
    if (rank === 1)
      return <Ionicons name="trophy" size={20} color={iconColors.gold} />;
    if (rank === 2)
      return <Ionicons name="trophy" size={20} color={iconColors.silver} />;
    if (rank === 3)
      return <Ionicons name="trophy" size={20} color={iconColors.bronze} />;
    return (
      <Text style={[styles.rankText, getRankStyle(rank)]}>{`${rank}`}.</Text>
    );
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: iconColors.gold, fontSize: 24 as const };
      case 2:
        return { color: iconColors.silver, fontSize: 24 as const };
      case 3:
        return { color: iconColors.bronze, fontSize: 24 as const };
      default:
        return { color: BASE_COLORS.white, fontSize: 14 as const };
    }
  };

  const getContainerStyle = (rank: number) => {
    if (rank <= 3) {
      return {
        backgroundColor: "rgba(255, 215, 0, 0.12)",
        borderColor: "rgba(255, 215, 0, 0.25)",
        borderWidth: 1,
      };
    }
    return {};
  };

  const getValueDisplay = (user: RankingUser, type: string): string => {
    switch (type) {
      case "quizChampions":
        return `${user.totalCompleted || user.value} completed`;
      case "coinMasters":
        return `${user.coins?.toLocaleString() || user.value} coins`;
      case "speedDemons":
        return `${formatTime(user.avgTime || user.value)} avg`;
      case "consistencyKings":
        return `${user.completionRate || user.value}% rate`;
      default:
        return user.value?.toString() || "0";
    }
  };

  const getSubDisplay = (user: RankingUser, type: string): string | null => {
    switch (type) {
      case "speedDemons":
        return user.bestTime ? `Best: ${formatTime(user.bestTime)}` : null;
      case "consistencyKings":
        return `${user.correctAttempts || 0}/${
          user.totalAttempts || 0
        } attempts`;
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        getContainerStyle(rank),
        isCurrentUser && styles.currentUserContainer,
      ]}
    >
      {/* Rank - Trophy or Number */}
      <View style={styles.rankContainer}>{getRankDisplay(rank)}</View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {user.avatar && !imageLoadError ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarText}>
              {user.username?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text
          style={[styles.username, isCurrentUser && styles.currentUserText]}
          numberOfLines={1}
        >
          {user.username || "Unknown User"}
          {isCurrentUser && " (You)"}
        </Text>

        <Text
          style={[styles.valueText, isCurrentUser && styles.currentUserValue]}
        >
          {getValueDisplay(user, type)}
        </Text>

        {getSubDisplay(user, type) && (
          <Text style={styles.subText}>{getSubDisplay(user, type)}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  currentUserContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderColor: iconColors.gold,
  },
  rankContainer: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  currentUserText: {
    color: iconColors.gold,
  },
  avatarContainer: {
    marginHorizontal: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.customWhite,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 3,
  },
  valueText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 2,
  },
  currentUserValue: {
    color: iconColors.gold,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
  subText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default React.memo(RankingItem);
