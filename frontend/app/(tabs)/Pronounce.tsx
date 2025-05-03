import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
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
import PronunciationCard from "@/components/Pronunciation/PronunciationCard";
import SearchBar from "@/components/Pronunciation/SearchBar";
import LanguageDropdown from "@/components/Pronunciation/LanguageDropdown";
import EmptyState from "@/components/Pronunciation/EmptyState";
import ErrorState from "@/components/Pronunciation/ErrorState";

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
  } = usePronunciationStore();

  useEffect(() => {
    fetchPronunciations();
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setCurrentPage(1);
      setHasMoreData(true);
      const ITEMS_PER_PAGE = 25;
      const newData = getFilteredPronunciations(
        selectedLanguage,
        1,
        ITEMS_PER_PAGE
      );
      setAllPronunciationData(newData);
    }
  }, [selectedLanguage, searchInput, isLoading]);

  const handleLanguageChange = (language: string) => {
    stopAudio();
    setSelectedLanguage(language);
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
  }, []);

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
    (item: PronunciationItem, index: number) => `pronunciation-${index}`,
    []
  );

  if (isLoading) return <AppLoading />;

  if (error) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centerContainer]}>
        <ErrorState onRetry={fetchPronunciations} />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        </View>

        <View style={styles.controlsContainer}>
          <SearchBar
            searchInput={searchInput}
            setSearchInput={handleSearchChange}
            setSearchTerm={setSearchTerm}
          />
          <LanguageDropdown
            selectedLanguage={selectedLanguage}
            handleLanguageChange={handleLanguageChange}
          />
        </View>

        <Text style={styles.listHeaderTitle}>{selectedLanguage} Phrases</Text>

        <View style={styles.listContainer}>
          <FlatList
            data={allPronunciationData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={EmptyState}
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
