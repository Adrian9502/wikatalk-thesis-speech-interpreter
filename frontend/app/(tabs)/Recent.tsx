import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import ConfirmationModal from "@/components/ConfirmationModal";
import TabSelector from "@/components/Recent/TabSelector";
import HistoryList from "@/components/Recent/HistoryList";
import { TabType, HistoryItems } from "@/types/types";
import { MOCK_HISTORY_DATA } from "@/utils/Recent/mockData";

const RecentTranslations: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // State to track active tab
  const [activeTab, setActiveTab] = useState<TabType>("Speech");

  // State for delete confirmation
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // State for history items
  const [historyItems, setHistoryItems] =
    useState<HistoryItems>(MOCK_HISTORY_DATA);

  // Handle delete confirmation
  const handleDeletePress = (id: string): void => {
    setItemToDelete(id);
    setDeleteConfirmVisible(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (): void => {
    if (itemToDelete) {
      const updatedHistoryItems = { ...historyItems };
      updatedHistoryItems[activeTab] = historyItems[activeTab].filter(
        (item) => item.id !== itemToDelete
      );
      setHistoryItems(updatedHistoryItems);
      setDeleteConfirmVisible(false);
      setItemToDelete(null);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = (): void => {
    setDeleteConfirmVisible(false);
    setItemToDelete(null);
  };

  return (
    <View style={dynamicStyles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeAreaView}>
        {/* Tabs */}
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {/* History Items */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HistoryList
            items={historyItems[activeTab]}
            activeTab={activeTab}
            onDeletePress={handleDeletePress}
          />
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={deleteConfirmVisible}
          title="Delete Translation"
          text="Are you sure you want to delete this translation? This action cannot be undone."
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          confirmButtonText="Delete"
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default RecentTranslations;
