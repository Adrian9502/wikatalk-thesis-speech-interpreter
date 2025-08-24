import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
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
  // Stop speech when tab focused
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

  const {
    // Data
    transformedData,
    isLoading,
    error,

    // Audio
    playAudio,
    stopAudio,
    currentPlayingIndex,
    isAudioLoading,

    // Actions
    fetchPronunciations,
    setSearchTerm,
    clearCache,
  } = usePronunciationStore();

  // LOCAL STATE - Simplified
  const [selectedLanguage, setSelectedLanguage] = useState("Cebuano");
  const [searchInput, setSearchInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // FlashList ref (changed from FlatList)
  const flashListRef = useRef<FlashList<PronunciationItem>>(null);

  // OPTIMIZED: Memoized filtered data with performance tracking
  const displayData = useMemo(() => {
    const startTime = Date.now();

    if (!transformedData?.[selectedLanguage]) {
      console.log(`[Pronounce] No data for ${selectedLanguage}`);
      return [];
    }

    let data = transformedData[selectedLanguage];

    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase();
      data = data.filter(
        (item) =>
          item.english.toLowerCase().includes(searchLower) ||
          item.translation.toLowerCase().includes(searchLower) ||
          item.pronunciation.toLowerCase().includes(searchLower)
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Pronounce] Data filtered in ${duration}ms: ${data.length} items`
    );

    return data;
  }, [transformedData, selectedLanguage, searchInput]);

  // INITIALIZATION - Single effect
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log("[Pronounce] Initializing data...");
        await fetchPronunciations(false);

        if (mounted) {
          setIsInitialized(true);
          console.log("[Pronounce] Initialization complete");
        }
      } catch (error) {
        console.error("[Pronounce] Initialization error:", error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      stopAudio();
    };
  }, [fetchPronunciations, stopAudio]);

  // SEARCH HANDLER - Immediate update
  const handleSearchChange = useCallback(
    (text: string) => {
      console.log(`[Pronounce] Search: "${text}"`);
      setSearchInput(text);
      setSearchTerm(text);
    },
    [setSearchTerm]
  );

  // LANGUAGE HANDLER - Simple
  const handleLanguageChange = useCallback(
    (language: string) => {
      console.log(`[Pronounce] Language changed: ${language}`);
      stopAudio();
      setSelectedLanguage(language);
    },
    [stopAudio]
  );

  // REFRESH HANDLER - Enhanced for FlashList
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log("[Pronounce] Refreshing data...");
      clearCache();
      await fetchPronunciations(true);
    } catch (error) {
      console.error("[Pronounce] Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearCache, fetchPronunciations]);

  // RENDER FUNCTIONS - Optimized for FlashList
  const renderItem = useCallback(
    ({ item, index }: { item: PronunciationItem; index: number }) => (
      <PronunciationCard
        item={item}
        index={index}
        currentPlayingIndex={currentPlayingIndex}
        isAudioLoading={isAudioLoading}
        onPlayPress={playAudio}
      />
    ),
    [currentPlayingIndex, isAudioLoading, playAudio]
  );

  // OPTIMIZED: Enhanced key extractor for FlashList
  const keyExtractor = useCallback(
    (item: PronunciationItem, index: number) => {
      // Use a more stable key that includes content hash for better performance
      const contentHash = `${item.english}-${item.translation}-${selectedLanguage}`;
      return `${contentHash}-${index}`;
    },
    [selectedLanguage]
  );

  // OPTIMIZED: Memoized empty component
  const ListEmptyComponent = useMemo(() => EmptyState, []);

  // PERFORMANCE: Calculate estimated item size based on content
  const estimatedItemSize = useMemo(() => {
    // Base card height + margins + padding
    // Adjust based on your PronunciationCard actual height
    return 140; // Adjust this value based on your card's actual height
  }, []);

  // LOADING STATES
  if (!isInitialized && isLoading) {
    return <AppLoading />;
  }

  if (error && !isInitialized) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centerContainer]}>
        <ErrorState onRetry={() => fetchPronunciations(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        </View>

        {/* Search */}
        <View style={styles.controlsContainer}>
          <SearchBar
            searchInput={searchInput}
            setSearchInput={handleSearchChange}
            setSearchTerm={setSearchTerm}
          />
        </View>

        {/* Language Header & Dropdown */}
        <View style={styles.headerDropdownContainer}>
          <Text style={styles.listHeaderTitle}>
            {selectedLanguage} Vocabulary
          </Text>

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
        </View>
        {/* 

<FlashList
              data={currentData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListEmptyComponent={ListEmptyComponent}
              estimatedItemSize={180}
              contentContainerStyle={styles.flashListContent}
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
*/}
        {/* FLASHLIST - Optimized Implementation */}
        <FlashList
          ref={flashListRef}
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          estimatedItemSize={estimatedItemSize}
          contentContainerStyle={styles.flashListContent}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          drawDistance={200}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[BASE_COLORS.blue]}
              tintColor={activeTheme.secondaryColor}
              titleColor={activeTheme.tabActiveColor}
              title="Pull to refresh"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Pronounce;
