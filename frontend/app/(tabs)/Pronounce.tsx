import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import {
  usePronunciationStore,
  debouncedSetSearchTerm,
} from "@/store/usePronunciationStore";
import AppLoading from "@/components/AppLoading";

// Import components
import PronunciationCard from "@/components/pronunciation/PronunciationCard";
import SearchBar from "@/components/pronunciation/SearchBar";
import LanguageDropdown from "@/components/pronunciation/LanguageDropdown";
import EmptyState from "@/components/pronunciation/EmptyState";
import ErrorState from "@/components/pronunciation/ErrorState";

// Import styles and types
import { pronunciationStyles } from "@/styles/pronunciationStyles";
import { PronunciationItem } from "@/types/pronunciationTypes";
import { BASE_COLORS } from "@/constant/colors";
import { ViewStyle, TextStyle } from "react-native";

// Define properly typed styles
interface PronunciationStyles {
  // View styles
  container: ViewStyle;
  header: ViewStyle;
  controlsContainer: ViewStyle;
  listContainer: ViewStyle;
  flatListContent: ViewStyle;
  loadingFooter: ViewStyle;
  centerContainer: ViewStyle;

  // Text styles
  headerTitle: TextStyle;
  listHeaderTitle: TextStyle;
  loadingText: TextStyle;
}

// NEW: Animated PronunciationCard wrapper component
const AnimatedPronunciationCard = React.memo(
  ({
    item,
    index,
    delay,
    ...props
  }: {
    item: PronunciationItem;
    index: number;
    delay: number;
    currentPlayingIndex: number | null;
    isAudioLoading: boolean;
    onPlayPress: (index: number, text: string) => void;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      // Start animation with the specified delay
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, fadeAnim, slideAnim]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <PronunciationCard {...props} item={item} index={index} />
      </Animated.View>
    );
  }
);

const Pronounce = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  const [selectedLanguage, setSelectedLanguage] = useState("Cebuano");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [allPronunciationData, setAllPronunciationData] = useState<
    PronunciationItem[]
  >([]);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const controlsFadeAnim = useRef(new Animated.Value(0)).current;
  const listHeaderFadeAnim = useRef(new Animated.Value(0)).current;
  const animationStartedRef = useRef(false);
  const componentMountedRef = useRef(false);
  const dataLoadedRef = useRef(false);

  // NEW: Add refreshing state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // FIXED: Prevent multiple refresh calls
  const refreshingRef = useRef(false);

  const {
    fetchPronunciations,
    getFilteredPronunciations,
    playAudio,
    stopAudio,
    isLoading,
    setSearchTerm,
    error,
    currentPlayingIndex,
    isAudioLoading,
    isCacheValid,
    clearCache,
    transformedData,
  } = usePronunciationStore();

  // CRITICAL FIX: Initialize data with caching on mount
  useEffect(() => {
    componentMountedRef.current = true;

    const initializeData = async () => {
      // Check if we have valid cached data
      if (isCacheValid()) {
        console.log("[Pronounce] Using cached data, skipping fetch");
        dataLoadedRef.current = true;
        return;
      }
      // Fetch fresh data if no valid cache
      await fetchPronunciations(false); // Don't force refresh, respect cache
      dataLoadedRef.current = true;
    };

    initializeData();

    return () => {
      componentMountedRef.current = false;
      stopAudio();
    };
  }, []);

  // CRITICAL FIX: Update data when store changes or search/language changes
  useEffect(() => {
    if (!isLoading && dataLoadedRef.current) {
      console.log("[Pronounce] Updating pronunciation data", {
        selectedLanguage,
        searchInput,
        transformedDataKeys: Object.keys(transformedData || {}),
        transformedDataSize: transformedData?.[selectedLanguage]?.length || 0,
      });

      setCurrentPage(1);
      setHasMoreData(true);
      const ITEMS_PER_PAGE = 25;
      const newData = getFilteredPronunciations(
        selectedLanguage,
        1,
        ITEMS_PER_PAGE
      );

      console.log("[Pronounce] Filtered data result:", {
        selectedLanguage,
        searchTerm: searchInput,
        resultCount: newData.length,
        sampleItems: newData.slice(0, 3).map((item) => ({
          english: item.english,
          translation: item.translation,
        })),
      });

      setAllPronunciationData(newData);
    }
  }, [
    selectedLanguage,
    searchInput,
    isLoading,
    transformedData,
    getFilteredPronunciations,
  ]); // FIXED: Add transformedData dependency

  // FIXED: Start animations when component is ready with data
  useEffect(() => {
    if (
      componentMountedRef.current &&
      !isLoading &&
      !animationStartedRef.current &&
      dataLoadedRef.current
    ) {
      animationStartedRef.current = true;
      console.log("[Pronounce] Starting header animations");

      Animated.sequence([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(controlsFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(listHeaderFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, headerFadeAnim, controlsFadeAnim, listHeaderFadeAnim]);

  // FIXED: Language change handler - don't reset animations unless data changes
  const handleLanguageChange = (language: string) => {
    stopAudio();
    setSelectedLanguage(language);

    // Don't reset animations for language change
    console.log(`[Pronounce] Language changed to: ${language}`);
  };

  const loadMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const newData = getFilteredPronunciations(selectedLanguage, nextPage, 25);

      if (newData.length === 0) {
        setHasMoreData(false);
      } else {
        setAllPronunciationData((prevData) => [...prevData, ...newData]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    currentPage,
    selectedLanguage,
    isLoadingMore,
    hasMoreData,
    getFilteredPronunciations,
  ]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    debouncedSetSearchTerm(text);
    console.log(`[Pronounce] Search term: ${text}`);
  }, []);

  // FIXED: Prevent multiple refresh calls
  const handleRefresh = useCallback(async () => {
    if (refreshingRef.current) {
      console.log("[Pronounce] Refresh already in progress, skipping");
      return;
    }

    refreshingRef.current = true;
    setIsRefreshing(true);

    try {
      console.log("[Pronounce] Refreshing pronunciation data");

      // Clear cache and fetch fresh data
      clearCache();
      await fetchPronunciations(true); // Force refresh

      // Reset pagination
      setCurrentPage(1);
      setHasMoreData(true);

      // Load fresh data will happen automatically via useEffect when transformedData changes
      console.log("[Pronounce] Refresh completed");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [clearCache, fetchPronunciations]);

  const handleEndReached = () => {
    if (hasMoreData && !isLoadingMore) {
      loadMoreData();
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={BASE_COLORS.blue} />
        <Text style={styles.loadingText}>Loading more phrases...</Text>
      </View>
    );
  };

  // NEW: Enhanced renderItem with staggered animation
  const renderItem = useCallback(
    ({ item, index }: { item: PronunciationItem; index: number }) => {
      // Calculate delay: base delay + staggered delay for each item
      const baseDelay = 400; // Wait for header animations to complete
      const itemDelay = index * 100; // 100ms delay between each item
      const totalDelay = baseDelay + itemDelay;

      return (
        <AnimatedPronunciationCard
          item={item}
          index={index}
          delay={totalDelay}
          currentPlayingIndex={currentPlayingIndex}
          isAudioLoading={isAudioLoading}
          onPlayPress={playAudio}
        />
      );
    },
    [currentPlayingIndex, isAudioLoading, playAudio]
  );

  const keyExtractor = useCallback(
    (item: PronunciationItem, index: number) =>
      `pronunciation-${index}-${item.english}`,
    []
  );

  // FIXED: Show loading only on initial load
  if (isLoading && !dataLoadedRef.current) return <AppLoading />;

  if (error && !dataLoadedRef.current) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centerContainer]}>
        <ErrorState onRetry={() => fetchPronunciations(true)} />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={dynamicStyles.container}>
        <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
          <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        </Animated.View>

        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsFadeAnim }]}
        >
          <SearchBar
            searchInput={searchInput}
            setSearchInput={handleSearchChange}
            setSearchTerm={setSearchTerm}
          />
          <LanguageDropdown
            selectedLanguage={selectedLanguage}
            handleLanguageChange={handleLanguageChange}
          />
        </Animated.View>

        {/* FIXED: Always show list header with proper opacity */}
        <Animated.Text
          style={[styles.listHeaderTitle, { opacity: listHeaderFadeAnim }]}
        >
          {selectedLanguage} Phrases
        </Animated.Text>

        <View style={styles.listContainer}>
          <FlatList
            data={allPronunciationData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={() => <EmptyState onRefresh={handleRefresh} />}
            contentContainerStyle={styles.flatListContent}
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            windowSize={3}
            updateCellsBatchingPeriod={100}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={BASE_COLORS.white}
                titleColor={BASE_COLORS.white}
                title="Pull to refresh"
              />
            }
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const additionalStyles: Partial<PronunciationStyles> = {
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.blue,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};

const styles = StyleSheet.create({
  ...(pronunciationStyles as PronunciationStyles),
  ...additionalStyles,
});

export default Pronounce;
