import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
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

  // FIXED: Remove the non-existent getAllPronunciationData
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

  // Animation - Single fade only
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isInitialized, setIsInitialized] = useState(false);

  // FlatList ref
  const flatListRef = useRef<FlatList>(null);

  // SIMPLIFIED: Get filtered data directly from store
  const displayData = React.useMemo(() => {
    if (!transformedData?.[selectedLanguage]) return [];

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

          // Start simple fade animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();

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
  }, []);

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

  // REFRESH HANDLER - Clean
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

  // RENDER FUNCTIONS - Optimized
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

  const keyExtractor = useCallback(
    (item: PronunciationItem, index: number) =>
      `${selectedLanguage}-${index}-${item.english}`,
    [selectedLanguage]
  );

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
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
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
        <FlatList
          ref={flatListRef}
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.flatListContent}
          style={[{ flex: 1 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          maxToRenderPerBatch={8}
          windowSize={8}
          initialNumToRender={8}
          updateCellsBatchingPeriod={100}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          nestedScrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[BASE_COLORS.blue]}
              tintColor={BASE_COLORS.white}
              titleColor={BASE_COLORS.white}
              title="Pull to refresh"
            />
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default Pronounce;
