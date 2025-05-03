import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { BASE_COLORS } from "@/constant/colors";
import {
  usePronunciationStore,
  debouncedSetSearchTerm,
} from "@/store/usePronunciationStore";
import { Search, X } from "react-native-feather";
import AppLoading from "@/components/AppLoading";

interface PronunciationItem {
  english: string;
  translation: string;
  pronunciation: string;
}

const Pronounce = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  const [selectedLanguage, setSelectedLanguage] = useState("Cebuano");
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);
  const [searchInput, setSearchInput] = useState("");

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

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  useEffect(() => {
    fetchPronunciations();
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleLanguageChange = (language: string) => {
    stopAudio();
    setSelectedLanguage(language);
  };

  const languagePronunciationData = getFilteredPronunciations(selectedLanguage);

  const renderItem = useCallback(
    ({ item, index }: { item: PronunciationItem; index: number }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => playAudio(index, item.translation)}
        style={[styles.card, styles.cardContainer]}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.englishText}>{item.english}</Text>
            <Text style={styles.translationText}>{item.translation}</Text>
            <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
          </View>
          <View style={styles.audioContainer}>
            {isAudioLoading && currentPlayingIndex === index ? (
              <ActivityIndicator size="small" color={BASE_COLORS.blue} />
            ) : (
              <View
                style={[
                  styles.playButton,
                  currentPlayingIndex === index && styles.playButtonActive,
                ]}
              >
                <Ionicons
                  name={
                    currentPlayingIndex === index
                      ? "volume-high"
                      : "volume-medium-outline"
                  }
                  size={22}
                  color={
                    currentPlayingIndex === index
                      ? BASE_COLORS.white
                      : BASE_COLORS.blue
                  }
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [currentPlayingIndex, isAudioLoading, playAudio]
  );

  const keyExtractor = useCallback(
    (item: PronunciationItem, index: number) => `pronunciation-${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyStateContainer}>
        <View style={styles.iconWrapper}>
          <Search width={40} height={40} color="#fff" />
        </View>
        <Text style={styles.emptyStateTitle}>No results found</Text>
        <Text style={styles.emptyStateText}>
          Try adjusting your search or selecting a different language.
        </Text>
      </View>
    ),
    []
  );

  if (isLoading) {
    return <AppLoading />;
  }

  if (error) {
    return (
      <SafeAreaView style={[dynamicStyles.container, styles.centerContainer]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={BASE_COLORS.orange} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>
            We couldn't load the pronunciation data
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPronunciations}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pronunciation Guide</Text>
        </View>

        {/* Language Selection with Search Bar */}
        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search width={20} height={20} color={BASE_COLORS.blue} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search words/phrases"
                placeholderTextColor={BASE_COLORS.placeholderText}
                value={searchInput}
                onChangeText={(text) => {
                  setSearchInput(text);
                  debouncedSetSearchTerm(text);
                }}
                returnKeyType="search"
              />
              {searchInput !== "" && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchInput("");
                    setSearchTerm("");
                  }}
                >
                  <X
                    width={16}
                    height={16}
                    color={BASE_COLORS.placeholderText}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.dropdownContainer}>
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
                  size={18}
                  color={BASE_COLORS.blue}
                />
              )}
              activeColor={BASE_COLORS.lightBlue}
              containerStyle={styles.dropdownList}
            />
          </View>
        </View>
        <Text style={styles.listHeaderTitle}>{selectedLanguage} Phrases</Text>
        {/* Pronunciation List */}
        <View style={styles.listContainer}>
          <FlatList
            data={languagePronunciationData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.flatListContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  errorContainer: {
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.white,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  controlsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.darkText,
  },
  clearButton: {
    padding: 4,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    paddingHorizontal: 12,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: BASE_COLORS.white,
  },
  cardContainer: {
    backgroundColor: BASE_COLORS.white,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  englishText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: BASE_COLORS.darkText,
    marginBottom: 2,
  },
  translationText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    color: BASE_COLORS.blue,
    marginBottom: 4,
  },
  pronunciationText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    letterSpacing: 0.5,
    color: BASE_COLORS.orange,
  },
  audioContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.lightBlue,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
  },
  playButtonActive: {
    backgroundColor: BASE_COLORS.blue,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  iconWrapper: {
    backgroundColor: BASE_COLORS.orange,
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 17,
    color: BASE_COLORS.white,
    marginBottom: 10,
  },
  emptyStateText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.borderColor,
    textAlign: "center",
    maxWidth: 280,
  },
});

export default Pronounce;
