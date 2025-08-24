import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { View, StyleSheet, InteractionManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import ConfirmationModal from "@/components/ConfirmationModal";
import TabSelector from "@/components/recent/TabSelector";
import HistoryItem from "@/components/recent/HistoryItem";
import EmptyHistory from "@/components/recent/EmptyHistory";
import { TabType } from "@/types/types";
import { format } from "date-fns";
import DotsLoader from "@/components/DotLoader";
import { BASE_COLORS } from "@/constant/colors";
import createAuthenticatedApi from "@/lib/api";
import showNotification from "@/lib/showNotification";
import { Header } from "@/components/Header";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { RefreshControl } from "react-native-gesture-handler";

interface TranslationAPIItem {
  _id: string;
  type: TabType;
  date: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
}

interface OptimizedHistoryItem {
  id: string;
  date: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
  key: string; // Add unique key for optimization
}

// Define the optimized history items structure
interface OptimizedHistoryItems {
  Speech: OptimizedHistoryItem[];
  Translate: OptimizedHistoryItem[];
  Scan: OptimizedHistoryItem[];
}

// Memoized cache for formatted data
const formatCache = new Map<string, OptimizedHistoryItem>();

const TranslationHistory: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // State - Updated to use OptimizedHistoryItems
  const [activeTab, setActiveTab] = useState<TabType>("Speech");
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<OptimizedHistoryItems>({
    Speech: [],
    Translate: [],
    Scan: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for performance
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized formatted data with caching
  const formatTranslationData = useCallback(
    (items: TranslationAPIItem[]): OptimizedHistoryItem[] => {
      return items
        .map((item: TranslationAPIItem) => {
          const cacheKey = `${item._id}-${item.date}`;

          // Check cache first
          if (formatCache.has(cacheKey)) {
            return formatCache.get(cacheKey)!;
          }

          const itemId = item._id || (item as any).id;
          if (!itemId) {
            console.error(`[TranslationHistory] Item missing ID:`, item);
            return null;
          }

          const formatted: OptimizedHistoryItem = {
            id: itemId.toString(),
            date: format(new Date(item.date), "MMM. d, yyyy - h:mma"),
            fromLanguage: item.fromLanguage,
            toLanguage: item.toLanguage,
            originalText: item.originalText,
            translatedText: item.translatedText,
            key: `${activeTab}-${itemId}-${item.date}`, // Stable key
          };

          // Cache the formatted item
          formatCache.set(cacheKey, formatted);
          return formatted;
        })
        .filter(Boolean) as OptimizedHistoryItem[];
    },
    [activeTab]
  );

  // Optimized fetch function with abort controller
  const fetchHistory = useCallback(
    async (tabType: TabType) => {
      try {
        setLoading(true);
        setError(null);

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const api = createAuthenticatedApi();

        const response = await api.get(`/api/translations?type=${tabType}`, {
          signal: abortControllerRef.current.signal,
          timeout: 10000, // 10 second timeout
        });

        const formattedData = formatTranslationData(response.data.history);

        // Update state only if not aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setHistoryItems((prev) => ({
            ...prev,
            [tabType]: formattedData,
          }));
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log(`[TranslationHistory] Request aborted for ${tabType}`);
          return;
        }

        console.error(
          `[TranslationHistory] API Error:`,
          err.response?.data || err.message
        );

        if (err.response?.status === 401) {
          setHistoryItems((prev) => ({
            ...prev,
            [tabType]: [],
          }));
        } else {
          setError("Failed to load history. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [formatTranslationData]
  );

  // Debounced tab change
  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;

      setActiveTab(tab);

      // Clear timeout if exists
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce the fetch
      fetchTimeoutRef.current = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          fetchHistory(tab);
        });
      }, 150);
    },
    [activeTab, fetchHistory]
  );

  // Initial fetch
  useEffect(() => {
    const initialFetch = () => {
      InteractionManager.runAfterInteractions(() => {
        fetchHistory(activeTab);
      });
    };

    initialFetch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // Only run once

  // Optimized refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      // Clear cache for current tab
      const currentItems = historyItems[activeTab];
      currentItems.forEach((item) => {
        formatCache.delete(`${item.id}-${item.date}`);
      });

      await fetchHistory(activeTab);
    } catch (error) {
      console.error("[TranslationHistory] Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, activeTab, fetchHistory, historyItems]);

  // Optimized delete handlers
  const handleDeletePress = useCallback((id: string) => {
    setItemToDelete(id);
    setDeleteConfirmVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) {
      setDeleteConfirmVisible(false);
      return;
    }

    try {
      const api = createAuthenticatedApi();
      await api.delete(`/api/translations/${itemToDelete}`);

      // Optimized state update
      setHistoryItems((prev) => {
        const updated = { ...prev };
        updated[activeTab] = prev[activeTab].filter(
          (item) => item.id !== itemToDelete
        );
        return updated;
      });

      // Clear from cache
      formatCache.delete(itemToDelete);

      showNotification({
        type: "success",
        title: "Translation Deleted",
        description: "Translation deleted successfully.",
      });
    } catch (err: any) {
      console.error("[TranslationHistory] Delete error:", err);
      showNotification({
        type: "error",
        title: "Delete Failed",
        description:
          err.response?.data?.message ||
          "Failed to delete item. Please try again.",
      });
    } finally {
      setDeleteConfirmVisible(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, activeTab]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmVisible(false);
    setItemToDelete(null);
  }, []);

  // Hardware back button
  useHardwareBack({
    enabled: true,
    fallbackRoute: "/(tabs)/Settings",
    useExistingHeaderLogic: true,
  });

  // Memoized render item
  const renderItem = useCallback(
    ({ item }: { item: OptimizedHistoryItem }) => (
      <HistoryItem item={item} onDeletePress={handleDeletePress} />
    ),
    [handleDeletePress]
  );

  // Memoized key extractor
  const keyExtractor = useCallback(
    (item: OptimizedHistoryItem) => item.key,
    []
  );

  // Memoized empty component
  const ListEmptyComponent = useMemo(
    () => <EmptyHistory tabType={activeTab} />,
    [activeTab]
  );

  // Current data - Now properly typed
  const currentData: OptimizedHistoryItem[] = historyItems[activeTab];
  return (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        dynamicStyles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar style="light" />

      <Header title="Translation History" />

      <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

      {loading && currentData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <DotsLoader />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text
            style={[styles.errorText, { color: activeTheme.tabActiveColor }]}
          >
            {error}123123123
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: BASE_COLORS.blue }]}
            onPress={() => fetchHistory(activeTab)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlashList
          data={currentData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          estimatedItemSize={180}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={activeTheme.secondaryColor}
              colors={[activeTheme.secondaryColor]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmationModal
        visible={deleteConfirmVisible}
        title="Delete Translation"
        text="Are you sure you want to delete this translation? This action cannot be undone."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmButtonText="Delete"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 12,
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Regular",
  },
});

export default TranslationHistory;
