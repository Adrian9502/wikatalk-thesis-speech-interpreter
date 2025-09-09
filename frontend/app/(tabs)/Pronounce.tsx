import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { View, Text, RefreshControl } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import { COMPONENT_FONT_SIZES } from "@/constant/fontSizes";

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

    // Actions
    fetchPronunciations,
    setSearchTerm,
    clearCache,
  } = usePronunciationStore();

  const [selectedLanguage, setSelectedLanguage] = useState("Cebuano");
  const [searchInput, setSearchInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const flashListRef = useRef<FlashList<PronunciationItem>>(null);

  const displayData = useMemo(() => {
    // CRITICAL: Check if transformedData exists and has content
    if (!transformedData || Object.keys(transformedData).length === 0) {
      console.log("[Pronounce] No transformed data available");
      return [];
    }

    // FIXED: More flexible language matching
    let languageData = transformedData[selectedLanguage];

    // If exact match fails, try case-insensitive lookup
    if (!languageData) {
      const languageKey = Object.keys(transformedData).find(
        (key) => key.toLowerCase() === selectedLanguage.toLowerCase()
      );
      languageData = languageKey ? transformedData[languageKey] : [];
    }

    // CRITICAL: Ensure we have an array
    if (!Array.isArray(languageData)) {
      console.log(`[Pronounce] Invalid data format for ${selectedLanguage}`);
      return [];
    }

    if (languageData.length === 0) {
      console.log(`[Pronounce] No data for ${selectedLanguage}`);
      return [];
    }

    let data = languageData;

    // FIXED: Only filter if we have a search term
    const trimmedSearch = searchInput.trim();
    if (trimmedSearch) {
      const searchLower = trimmedSearch.toLowerCase();
      data = languageData.filter((item) => {
        // DEFENSIVE: Ensure item properties exist and are strings
        const english = (item.english || "").toLowerCase();
        const translation = (item.translation || "").toLowerCase();
        const pronunciation = (item.pronunciation || "").toLowerCase();

        return (
          english.includes(searchLower) ||
          translation.includes(searchLower) ||
          pronunciation.includes(searchLower)
        );
      });
    }

    return data;
  }, [transformedData, selectedLanguage, searchInput]);

  //  Check if the selected language has any data at all
  const languageHasData = useMemo(() => {
    if (!transformedData || Object.keys(transformedData).length === 0) {
      return false;
    }

    const languageData =
      transformedData[selectedLanguage] ||
      transformedData[
        Object.keys(transformedData).find(
          (key) => key.toLowerCase() === selectedLanguage.toLowerCase()
        ) || ""
      ];

    return Array.isArray(languageData) && languageData.length > 0;
  }, [transformedData, selectedLanguage]);

  //Single effect
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

  // FIXED: Debounced search to reduce excessive filtering
  const debouncedSearchRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchInput(text);

      // FIXED: Debounce the search to reduce excessive logging and filtering
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }

      debouncedSearchRef.current = setTimeout(() => {
        setSearchTerm(text);
      }, 150); // 150ms debounce
    },
    [setSearchTerm]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

  // LANGUAGE HANDLER - Simple
  const handleLanguageChange = useCallback(
    (language: string) => {
      stopAudio();
      setSelectedLanguage(language);
      // Clear search when changing language
      setSearchInput("");
      setSearchTerm("");
    },
    [stopAudio, setSearchTerm]
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

  // RENDER FUNCTIONS
  const renderItem = useCallback(
    ({ item, index }: { item: PronunciationItem; index: number }) => (
      <PronunciationCard item={item} index={index} onPlayPress={playAudio} />
    ),
    [playAudio]
  );

  const keyExtractor = useCallback(
    (item: PronunciationItem, index: number) => {
      // Use a more stable key that includes content hash for better performance
      const contentHash = `${item.english}-${item.translation}-${selectedLanguage}`;
      return `${contentHash}-${index}`;
    },
    [selectedLanguage]
  );

  // UPDATED: Enhanced ListEmptyComponent with props
  const ListEmptyComponent = useMemo(
    () => () =>
      (
        <EmptyState
          searchTerm={searchInput}
          selectedLanguage={selectedLanguage}
          hasData={languageHasData}
        />
      ),
    [searchInput, selectedLanguage, languageHasData]
  );

  const estimatedItemSize = useMemo(() => {
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

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[dynamicStyles.container, { paddingTop: insets.top }]}
    >
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
                size={COMPONENT_FONT_SIZES.card.subtitle} // UPDATED: Use card subtitle size
                color={BASE_COLORS.blue}
              />
            )}
            activeColor={BASE_COLORS.lightBlue}
            containerStyle={styles.dropdownList}
          />
        </View>

        <FlashList
          ref={flashListRef}
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          estimatedItemSize={estimatedItemSize}
          contentContainerStyle={styles.flashListContent}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
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
