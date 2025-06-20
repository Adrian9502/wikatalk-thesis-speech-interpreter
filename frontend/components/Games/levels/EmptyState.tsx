import React from "react";
import { View, Text } from "react-native";
import { levelStyles as styles } from "@/styles/games/levels.styles";

const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No Completed Levels Yet</Text>
    <Text style={styles.emptyMessage}>
      Looks like you haven’t completed any levels yet. Let’s get started!
    </Text>
  </View>
);

export default EmptyState;
