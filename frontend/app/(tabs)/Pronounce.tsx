import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import AppLoading from "@/components/AppLoading";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { useFocusEffect } from "@react-navigation/native";

// Import components
import PronunciationCard from "@/components/pronunciation/PronunciationCard";
import SearchBar from "@/components/pronunciation/SearchBar";
import EmptyState from "@/components/pronunciation/EmptyState";
import ErrorState from "@/components/pronunciation/ErrorState";

// Import styles and types
import { pronunciationStyles as styles } from "@/styles/pronunciationStyles";
import { PronunciationItem } from "@/types/pronunciationTypes";
import { BASE_COLORS } from "@/constant/colors";
import { Dropdown } from "react-native-element-dropdown";
import { DIALECTS } from "@/constant/languages";
import { Ionicons } from "@expo/vector-icons";

const Pronounce = () => {
  // stop speech if there's any
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Pronounce] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      return () => {
        console.log("[Pronounce] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [])
  );

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

  // FlatList ref for scroll control
  const flatListRef = useRef<FlatList>(null);

  // NEW: Add refreshing state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // FIXED: Prevent multiple refresh calls
  const refreshingRef = useRef(false);
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);

  // Add scroll position tracking
  const scrollPositionRef = useRef(0);
  const isScrollingRef = useRef(false);

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
        searchInput: `"${searchInput}"`,
        searchInputLength: searchInput.length,
        transformedDataKeys: Object.keys(transformedData || {}),
        transformedDataSize: transformedData?.[selectedLanguage]?.length || 0,
      });

      setCurrentPage(1);
      setHasMoreData(true);
      const ITEMS_PER_PAGE = 25;

      // Always get fresh data when search changes
      const newData = getFilteredPronunciations(
        selectedLanguage,
        1,
        ITEMS_PER_PAGE
      );

      setAllPronunciationData(newData);

      // Reset scroll position when data changes
      scrollPositionRef.current = 0;
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 100);
      }
    }
  }, [
    selectedLanguage,
    searchInput,
    isLoading,
    transformedData,
    getFilteredPronunciations,
  ]);

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
    console.log(`[Pronounce] Language changed to: ${language}`);
  };

  const loadMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMoreData || isScrollingRef.current) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const ITEMS_PER_PAGE = 25;

      // OPTIMIZED: Get more data at once to reduce frequent calls
      const newData = getFilteredPronunciations(
        selectedLanguage,
        nextPage,
        ITEMS_PER_PAGE
      );

      if (newData.length === 0) {
        setHasMoreData(false);
      } else {
        // PERFORMANCE: Use functional update to avoid stale closures
        setAllPronunciationData((prevData) => {
          // DEDUPLICATION: Ensure no duplicates are added
          const existingKeys = new Set(
            prevData.map((item) => `${item.english}-${item.translation}`)
          );
          const uniqueNewData = newData.filter(
            (item) => !existingKeys.has(`${item.english}-${item.translation}`)
          );

          return [...prevData, ...uniqueNewData];
        });
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

  const handleSearchChange = useCallback(
    (text: string) => {
      console.log(`[Pronounce] Search input changed: "${text}"`);
      setSearchInput(text);
      // INSTANT: Update store immediately
      setSearchTerm(text);
    },
    [setSearchTerm]
  );

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
      scrollPositionRef.current = 0;

      console.log("[Pronounce] Refresh completed");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [clearCache, fetchPronunciations]);

  // FIXED: Better scroll handling with debouncing
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    scrollPositionRef.current = contentOffset.y;
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasMoreData && !isLoadingMore && !isScrollingRef.current) {
      loadMoreData();
    }
  }, [hasMoreData, isLoadingMore, loadMoreData]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={BASE_COLORS.blue} />
        <Text style={styles.loadingText}>Loading more phrases...</Text>
      </View>
    );
  };

  // SIMPLIFIED: Direct renderItem without heavy animations
  const renderItem = useCallback(
    ({ item, index }: { item: PronunciationItem; index: number }) => {
      return (
        <PronunciationCard
          item={item}
          index={index}
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
      `pronunciation-${index}-${item.english}-${item.translation}`,
    []
  );

  // FIXED: Optimized FlatList with better scroll behavior
  const renderList = () => (
    <FlatList
      data={allPronunciationData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={() => <EmptyState />}
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

        {/* UPDATED: New stacked layout */}
        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsFadeAnim }]}
        >
          {/* Search Bar - Full Width */}
          <SearchBar
            searchInput={searchInput}
            setSearchInput={handleSearchChange}
            setSearchTerm={setSearchTerm}
          />
        </Animated.View>

        {/* Combined header and dropdown container */}
        <Animated.View
          style={[
            styles.headerDropdownContainer,
            { opacity: listHeaderFadeAnim },
          ]}
        >
          {/* List Header Title - Left Side */}
          <Text style={styles.listHeaderTitle}>
            {selectedLanguage} Vocabulary
          </Text>

          {/* Language Dropdown - Right Side */}
          <Dropdown
            style={[
              styles.dropdown,
              isDropdownFocus && { borderColor: BASE_COLORS.blue },
            ]}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={DIALECTS}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder="Select language"
            value={selectedLanguage}
            onFocus={() => setIsDropdownFocus(true)}
            onBlur={() => setIsDropdownFocus(false)}
            onChange={(item) => {
              handleLanguageChange(item.value);
              setIsDropdownFocus(false);
            }}
            renderRightIcon={() => (
              <Ionicons
                name={isDropdownFocus ? "chevron-up" : "chevron-down"}
                size={15}
                color={BASE_COLORS.blue}
              />
            )}
            activeColor={BASE_COLORS.lightBlue}
            containerStyle={styles.dropdownList}
          />
        </Animated.View>

        <View style={styles.listContainer}>{renderList()}</View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Pronounce;
