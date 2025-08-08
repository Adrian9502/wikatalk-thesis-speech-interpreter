import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { RankingUser } from "@/types/rankingTypes";
import { formatTime } from "@/utils/gameUtils";

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
  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getValueDisplay = (user: RankingUser, type: string): string => {
    switch (type) {
      case "coinMasters":
        return `${user.coins?.toLocaleString() || user.value} coins`;

      case "quizChampions":
        return `${user.totalCompleted || user.value} completed`;

      case "speedDemons":
        return `${formatTime(user.avgTime || user.value)} avg`;

      case "lightningFast":
        return `${formatTime(user.fastestTime || user.value)}`;

      case "consistencyKings":
        return `${user.completionRate || user.value}% rate`;

      case "progressLeaders":
        return `${user.totalProgress || user.value} points`;

      case "streakMasters":
        return `${user.currentStreak || user.value} streak`;

      case "precisionPros":
        return `${user.accuracy || user.value}% accuracy`;

      case "weeklyWarriors":
        return `${user.weeklyProgress || user.value} this week`;

      case "perfectScorers":
        return `${user.perfectScores || user.value} perfect`;

      case "timeWarriors":
        return `${
          user.hoursSpent || Math.round(((user.value || 0) / 3600) * 10) / 10
        }h spent`;

      case "comebackKings":
        return `${user.comebacks || user.value} comebacks`;

      default:
        return user.value?.toString() || "0";
    }
  };

  const getSubDisplay = (user: RankingUser, type: string): string | null => {
    switch (type) {
      case "speedDemons":
        return user.bestTime ? `Best: ${formatTime(user.bestTime)}` : null;

      case "consistencyKings":
        return `${user.correctAttempts}/${user.totalAttempts} attempts`;

      case "progressLeaders":
        return `${user.gameModesCount || 1} game modes`;

      case "streakMasters":
        return user.longestStreak ? `Longest: ${user.longestStreak}` : null;

      case "precisionPros":
        return `${user.firstTryCorrect}/${user.totalFirstTries} first tries`;

      case "weeklyWarriors":
        return user.weeklyTimeSpent
          ? `${Math.round(user.weeklyTimeSpent / 60)}m spent`
          : null;

      case "timeWarriors":
        return `${user.totalCompleted || 0} completed`;

      case "comebackKings":
        return `Avg ${user.avgAttempts || 1} attempts`;

      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, isCurrentUser && styles.currentUserContainer]}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        <Text
          style={[styles.rankText, isCurrentUser && styles.currentUserText]}
        >
          {getRankDisplay(rank)}
        </Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
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

      {/* Badge for top 3 */}
      {rank <= 3 && (
        <View
          style={[styles.badge, styles[`badge${rank}` as keyof typeof styles]]}
        >
          <Text style={styles.badgeText}>TOP {rank}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  currentUserContainer: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderColor: "rgba(255, 215, 0, 0.3)",
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  currentUserText: {
    color: "#FFD700",
  },
  avatarContainer: {
    marginHorizontal: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 2,
  },
  valueText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  currentUserValue: {
    color: "#FFD700",
  },
  subText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badge1: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  badge2: {
    backgroundColor: "rgba(192, 192, 192, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(192, 192, 192, 0.4)",
  },
  badge3: {
    backgroundColor: "rgba(205, 127, 50, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(205, 127, 50, 0.4)",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
});

export default React.memo(RankingItem);
