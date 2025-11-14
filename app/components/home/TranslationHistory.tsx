import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import createAuthenticatedApi from "@/lib/api";
import TabSelector from "@/components/recent/TabSelector";
import HistoryItem from "@/components/recent/HistoryItem";
import EmptyHistory from "@/components/recent/EmptyHistory";
import ConfirmationModal from "@/components/ConfirmationModal";
import { TabType } from "@/types/types";
import { format } from "date-fns";
import showNotification from "@/lib/showNotification";
import DotsLoader from "@/components/DotLoader";

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
  key: string;
}

interface OptimizedHistoryItems {
  Speech: OptimizedHistoryItem[];
  Translate: OptimizedHistoryItem[];
  Scan: OptimizedHistoryItem[];
}

interface RecentTranslationsProps {
  onNavigateToHistory: () => void;
  onNavigateToTab: (tabName: string) => void;
}

const formatCache = new Map<string, OptimizedHistoryItem>();

const TranslationHistory = React.memo(
  ({ onNavigateToHistory, onNavigateToTab }: RecentTranslationsProps) => {
    // State
    const [activeTab, setActiveTab] = useState<TabType>("Speech");
    const [historyItems, setHistoryItems] = useState<OptimizedHistoryItems>({
      Speech: [],
      Translate: [],
      Scan: [],
    });
    const [loading, setLoading] = useState(true);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs for API call management
    const abortControllerRef = useRef<AbortController | null>(null);

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
              console.error(`[RecentTranslations] Item missing ID:`, item);
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

    // Load translations for all types
    const loadAllTranslations = useCallback(async () => {
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

        // Fetch data for all tabs
        const [speechResponse, translateResponse, scanResponse] =
          await Promise.allSettled([
            api.get("/api/translations?type=Speech", {
              signal: abortControllerRef.current.signal,
            }),
            api.get("/api/translations?type=Translate", {
              signal: abortControllerRef.current.signal,
            }),
            api.get("/api/translations?type=Scan", {
              signal: abortControllerRef.current.signal,
            }),
          ]);

        const formattedData: OptimizedHistoryItems = {
          Speech: [],
          Translate: [],
          Scan: [],
        };

        // Process all responses and limit to 2 most recent
        if (speechResponse.status === "fulfilled") {
          const sorted = speechResponse.value.data.history.sort(
            (a: TranslationAPIItem, b: TranslationAPIItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          formattedData.Speech = formatTranslationData(sorted).slice(0, 2);
        }

        if (translateResponse.status === "fulfilled") {
          const sorted = translateResponse.value.data.history.sort(
            (a: TranslationAPIItem, b: TranslationAPIItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          formattedData.Translate = formatTranslationData(sorted).slice(0, 2);
        }

        if (scanResponse.status === "fulfilled") {
          const sorted = scanResponse.value.data.history.sort(
            (a: TranslationAPIItem, b: TranslationAPIItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          formattedData.Scan = formatTranslationData(sorted).slice(0, 2);
        }

        setHistoryItems(formattedData);
      } catch (err: any) {
        // Handle abort error properly
        if (
          err.name === "AbortError" ||
          err.message === "canceled" ||
          err.code === "ERR_CANCELED"
        ) {
          console.log(
            `[RecentTranslations] Request aborted (expected behavior)`
          );
          return;
        }

        console.error("[RecentTranslations] Error:", err);
        setError("Failed to load translations");
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    }, [formatTranslationData]);

    // Initial data loading
    useEffect(() => {
      loadAllTranslations();

      // Cleanup on unmount
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [loadAllTranslations]);

    // Delete handlers
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

        // Update state to remove the deleted item
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
        console.error("[RecentTranslations] Delete error:", err);
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

    // Handle tab change
    const handleTabChange = useCallback((tab: TabType) => {
      setActiveTab(tab);
    }, []);

    // Current data
    const currentData = historyItems[activeTab] || [];

    return (
      <View style={styles.container}>
        {/* Header with title and view all */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Translation History</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onNavigateToHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Content */}
        <View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <DotsLoader />
            </View>
          ) : currentData.length > 0 ? (
            <FlatList
              data={currentData}
              renderItem={({ item }) => (
                <HistoryItem item={item} onDeletePress={handleDeletePress} />
              )}
              keyExtractor={(item) => item.key}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <EmptyHistory tabType={activeTab} />
          )}
        </View>

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          visible={deleteConfirmVisible}
          title="Delete Translation"
          text="Are you sure you want to delete this translation? This action cannot be undone."
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          confirmButtonText="Delete"
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  viewAllText: {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginRight: 4,
  },
  separator: {
    height: 12,
  },
  listContent: {
    paddingBottom: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    minHeight: 350,
  },
});

TranslationHistory.displayName = "TranslationHistory";
export default TranslationHistory;
