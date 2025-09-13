import React from "react";
import { View, Text } from "react-native";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface EmptyStateProps {
  activeFilter: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeFilter }) => {
  // Dynamic messages based on the active filter
  const getMessage = () => {
    switch (activeFilter) {
      case "completed":
        return {
          title: "No Completed Levels Yet",
          message: "Complete your first level to see it here!",
        };
      case "current":
        return {
          title: "No In-Progress Levels",
          message: "Congratulations! You've completed all available levels in this mode.",
        };
      case "easy":
      case "medium":
      case "hard":
        return {
          title: `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Levels Available`,
          message: "Try a different difficulty level or game mode.",
        };
      default:
        return {
          title: "No Levels Available",
          message: "No levels match the current filter. Try a different selection.",
        };
    }
  };

  const { title, message } = getMessage();

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
};

export default EmptyState;
