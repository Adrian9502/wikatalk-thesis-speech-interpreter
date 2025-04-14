import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
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
import DotsLoader from "@/components/DotLoader";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { useAuthStore } from "@/store/useAuthStore";
import createAuthenticatedApi from "@/lib/api";
import { showToast } from "@/lib/showToast";
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
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch history from the API
  const fetchHistory = async (tabType: TabType) => {
    try {
      setLoading(true);
      setError(null);

      const api = createAuthenticatedApi();

      try {
        const response = await api.get(`/api/translations?type=${tabType}`);

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
      } catch (err: any) {
        // If it's a 401, show empty state instead of error
        if (err.response?.status === 401) {
          setHistoryItems((prev) => ({
            ...prev,
            [tabType]: [],
          }));
        } else {
          // For other errors, show the error message
          setError("Failed to load history. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error creating API instance:", err);
      setError("Failed to connect to server. Please try again.");
      setLoading(false);
    }
  };

  // Fetch history when tab changes
  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  // Refresh function to reload data
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(activeTab)
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
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
        // Use the createAuthenticatedApi instead of direct axios call
        const api = createAuthenticatedApi();
        await api.delete(`/api/translations/${itemToDelete}`);

        // Update local state after successful delete
        const updatedHistoryItems = { ...historyItems };
        updatedHistoryItems[activeTab] = historyItems[activeTab].filter(
          (item) => item.id !== itemToDelete
        );
        setHistoryItems(updatedHistoryItems);
        showToast({
          type: "success",
          title: "Translation Deleted",
          description: "Translation deleted successfully.",
        });
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

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <DotsLoader />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: activeTheme.tabActiveColor }]}
            >
              {error}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: BASE_COLORS.blue },
              ]}
              onPress={() => fetchHistory(activeTab)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* History Items */
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              historyItems[activeTab].length === 0 && styles.emptyScrollContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[BASE_COLORS.white]} // Color of the refresh spinner
                tintColor={activeTheme.tabActiveColor} // For iOS
                progressBackgroundColor={activeTheme.secondaryColor} // For Android
              />
            }
          >
            <HistoryList
              items={historyItems[activeTab]}
              activeTab={activeTab}
              onDeletePress={handleDeletePress}
            />
          </ScrollView>
        )}

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
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyScrollContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  loadingText: {
    marginTop: 12,
    fontFamily: "Poppins-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
});

export default RecentTranslations;
