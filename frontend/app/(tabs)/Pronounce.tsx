import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated, // NEW: Added Animated import
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

  // NEW: Animation state
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const controlsFadeAnim = useRef(new Animated.Value(0)).current;
  const listHeaderFadeAnim = useRef(new Animated.Value(0)).current;
  const animationStartedRef = useRef(false);

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

  // NEW: Start header animations when data is ready
  useEffect(() => {
    if (
      !isLoading &&
      !animationStartedRef.current &&
      allPronunciationData.length > 0
    ) {
      animationStartedRef.current = true;

      // Staggered header animations
      Animated.sequence([
        // First: Header title
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Then: Controls (search + dropdown)
        Animated.timing(controlsFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Finally: List header
        Animated.timing(listHeaderFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isLoading,
    allPronunciationData.length,
    headerFadeAnim,
    controlsFadeAnim,
    listHeaderFadeAnim,
  ]);

  const handleLanguageChange = (language: string) => {
    stopAudio();
    setSelectedLanguage(language);

    // Reset animation when language changes
    animationStartedRef.current = false;
    headerFadeAnim.setValue(0);
    controlsFadeAnim.setValue(0);
    listHeaderFadeAnim.setValue(0);
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

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchInput(text);
      debouncedSetSearchTerm(text);

      // Reset animation when searching
      animationStartedRef.current = false;
      headerFadeAnim.setValue(0);
      controlsFadeAnim.setValue(0);
      listHeaderFadeAnim.setValue(0);
    },
    [headerFadeAnim, controlsFadeAnim, listHeaderFadeAnim]
  );

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
      const baseDelay = 1400; // Wait for header animations to complete
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
        {/* NEW: Animated Header */}
        <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
          <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        </Animated.View>

        {/* NEW: Animated Controls */}
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

        {/* NEW: Animated List Header */}
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
