import React from "react";
import { HistoryItemType, TabType } from "@/types/types";
import EmptyHistory from "@/components/Recent/EmptyHistory";
import HistoryItem from "@/components/Recent/HistoryItem";

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
    return <EmptyHistory tabType={activeTab} />;
  }

  return (
    <>
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} onDeletePress={onDeletePress} />
      ))}
    </>
  );
};

export default HistoryList;
