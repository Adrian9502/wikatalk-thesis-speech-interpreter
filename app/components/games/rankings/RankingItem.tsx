import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RankingUser } from "@/types/rankingTypes";
import { formatTime } from "@/utils/gameUtils";
import { ICON_COLORS, BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

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
      return <Ionicons name="trophy" size={20} color={ICON_COLORS.gold} />;
    if (rank === 2)
      return <Ionicons name="trophy" size={20} color={ICON_COLORS.silver} />;
    if (rank === 3)
      return <Ionicons name="trophy" size={20} color={ICON_COLORS.bronze} />;
    return (
      <Text style={[styles.rankText, getRankStyle(rank)]}>{`${rank}`}.</Text>
    );
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          color: ICON_COLORS.gold,
          fontSize: COMPONENT_FONT_SIZES.game.score,
        };
      case 2:
        return {
          color: ICON_COLORS.silver,
          fontSize: COMPONENT_FONT_SIZES.game.score,
        };
      case 3:
        return {
          color: ICON_COLORS.bronze,
          fontSize: COMPONENT_FONT_SIZES.game.score,
        };
      default:
        return {
          color: BASE_COLORS.white,
          fontSize: COMPONENT_FONT_SIZES.card.subtitle,
        };
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
    borderColor: BASE_COLORS.yellow,
  },
  rankContainer: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: POPPINS_FONT.medium,
    textAlign: "center",
  },
  currentUserText: {
    color: BASE_COLORS.yellow,
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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.bold,
    color: BASE_COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    marginBottom: 3,
  },
  valueText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 2,
  },
  currentUserValue: {
    color: BASE_COLORS.yellow,
    fontFamily: POPPINS_FONT.semiBold,
    fontSize: COMPONENT_FONT_SIZES.card.description,
  },
  subText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default React.memo(RankingItem);
