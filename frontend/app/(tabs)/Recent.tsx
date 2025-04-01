import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import ConfirmationModal from "@/components/ConfirmationModal";
import TabSelector from "@/components/Recent/TabSelector";
import HistoryList from "@/components/Recent/HistoryList";
import { TabType, HistoryItems } from "@/types/types";
import axios from "axios";
import { format } from "date-fns";

interface TranslationAPIItem {
  _id: string;
  type: TabType;
  date: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
}

const RecentTranslations: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // State to track active tab
  const [activeTab, setActiveTab] = useState<TabType>("Speech");

  // State for delete confirmation
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // State for history items with loading and error states
  const [historyItems, setHistoryItems] = useState<HistoryItems>({
    Speech: [],
    Translate: [],
    Scan: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch history from the API
  const fetchHistory = async (tabType: TabType) => {
    try {
      setLoading(true);
      setError(null);

      const BACKEND_URL =
        process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await axios.get(
        `${BACKEND_URL}/api/translations?type=${tabType}`
      );

      // Format the data to match our HistoryItems structure
      const formattedData = response.data.data.map(
        (item: TranslationAPIItem) => ({
          id: item._id,
          date: format(new Date(item.date), "MMM. d, yyyy - h:mma"),
          fromLanguage: item.fromLanguage,
          toLanguage: item.toLanguage,
          originalText: item.originalText,
          translatedText: item.translatedText,
        })
      );

      // Update just this tab's data
      setHistoryItems((prev) => ({
        ...prev,
        [tabType]: formattedData,
      }));
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch history when tab changes
  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  // Handle delete confirmation
  const handleDeletePress = (id: string): void => {
    setItemToDelete(id);
    setDeleteConfirmVisible(true);
  };

  // Handle delete confirmation with API call
  const handleDeleteConfirm = async (): Promise<void> => {
    if (itemToDelete) {
      try {
        const BACKEND_URL =
          process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";
        await axios.delete(`${BACKEND_URL}/api/translations/${itemToDelete}`);

        // Update local state after successful delete
        const updatedHistoryItems = { ...historyItems };
        updatedHistoryItems[activeTab] = historyItems[activeTab].filter(
          (item) => item.id !== itemToDelete
        );
        setHistoryItems(updatedHistoryItems);
      } catch (err) {
        console.error("Error deleting history item:", err);
        setError("Failed to delete item. Please try again.");
      } finally {
        setDeleteConfirmVisible(false);
        setItemToDelete(null);
      }
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
          contentContainerStyle={[
            styles.scrollContent,
            historyItems[activeTab].length === 0 &&
              !loading &&
              styles.emptyScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={activeTheme.tabActiveColor}
              />
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchHistory(activeTab)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <HistoryList
              items={historyItems[activeTab]}
              activeTab={activeTab}
              onDeletePress={handleDeletePress}
            />
          )}
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
  emptyScrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: "Poppins-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  errorText: {
    color: "#ff3b30",
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#1F51FF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontFamily: "Poppins-Medium",
  },
});

export default RecentTranslations;
