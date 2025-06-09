import React from "react";
import { View, StyleSheet } from "react-native";
import { HistoryItemType, TabType } from "@/types/types";
import EmptyHistory from "@/components/recent/EmptyHistory";
import HistoryItem from "@/components/recent/HistoryItem";

interface HistoryListProps {
  items: HistoryItemType[];
  activeTab: TabType;
  onDeletePress: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  items = [],
  activeTab,
  onDeletePress,
}) => {
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyHistory tabType={activeTab} />
      </View>
    );
  }

  return (
    <>
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} onDeletePress={onDeletePress} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
});

export default HistoryList;
