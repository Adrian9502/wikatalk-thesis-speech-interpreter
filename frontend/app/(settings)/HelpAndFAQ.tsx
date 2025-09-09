import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ChevronDown, ChevronUp, Search, X } from "react-native-feather";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import faqItems from "@/utils/helpAndFAQ/faqItems";
import { FAQItem } from "@/types/faqItems";
import categories from "@/utils/helpAndFAQ/categories";
import ContactSupportModal from "@/components/helpAndFAQ/ContactSupportModal";
import { Header } from "@/components/Header";
import { useHardwareBack } from "@/hooks/useHardwareBack";

const HelpFAQ = () => {
  // Get the dynamic styles based on the current theme
  const { activeTheme } = useThemeStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "general"
  );
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(faqItems);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFAQs(faqItems);
    } else {
      const filtered = faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFAQs(filtered);
    }
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionId: number) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter((id) => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  useHardwareBack({
    enabled: true,
    fallbackRoute: "/(settings)/Settings",
    useExistingHeaderLogic: true,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
          <StatusBar
            backgroundColor={activeTheme.backgroundColor}
            barStyle="light-content"
          />
          {/* Header */}
          <View style={styles.headerContainer}>
            <Header title="Help & FAQ" />
          </View>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar]}>
              <Search
                width={16}
                height={16}
                color={BASE_COLORS.darkText}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search FAQs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <X width={16} height={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <ScrollView
            bounces={false}
            overScrollMode="never"
            style={styles.container}
          >
            {searchQuery.trim() === "" ? (
              // Show categories when not searching
              categories.map((category) => (
                <View key={category.id} style={styles.categoryContainer}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.categoryHeader,
                      { backgroundColor: activeTheme.secondaryColor },
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={[styles.categoryHeaderText]}>
                      {category.title}
                    </Text>
                    {expandedCategory === category.id ? (
                      <ChevronUp
                        width={16}
                        height={16}
                        color={BASE_COLORS.white}
                      />
                    ) : (
                      <ChevronDown
                        width={16}
                        height={16}
                        color={BASE_COLORS.white}
                      />
                    )}
                  </TouchableOpacity>

                  {expandedCategory === category.id && (
                    <View style={styles.questionsContainer}>
                      {faqItems
                        .filter((item) => item.category === category.id)
                        .map((item) => (
                          <View
                            key={item.id}
                            style={[styles.questionContainer]}
                          >
                            <TouchableOpacity
                              activeOpacity={0.9}
                              style={styles.questionHeader}
                              onPress={() => toggleQuestion(item.id)}
                            >
                              <Text style={[styles.questionText]}>
                                {item.question}
                              </Text>
                              {expandedQuestions.includes(item.id) ? (
                                <ChevronUp
                                  width={16}
                                  height={16}
                                  color={BASE_COLORS.darkText}
                                />
                              ) : (
                                <ChevronDown
                                  width={16}
                                  height={16}
                                  color={BASE_COLORS.darkText}
                                />
                              )}
                            </TouchableOpacity>

                            {expandedQuestions.includes(item.id) && (
                              <View style={styles.answerContainer}>
                                <Text style={[styles.answerText]}>
                                  {item.answer}
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              // Show search results
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsTitle}>
                  Search Results ({filteredFAQs.length})
                </Text>
                {filteredFAQs.length === 0 ? (
                  <Text
                    style={[styles.noResultsText, { color: BASE_COLORS.white }]}
                  >
                    No results found. Try a different search term.
                  </Text>
                ) : (
                  filteredFAQs.map((item) => (
                    <View key={item.id} style={[styles.questionContainer]}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.questionHeader}
                        onPress={() => toggleQuestion(item.id)}
                      >
                        <Text style={[styles.questionText]}>
                          {item.question}
                        </Text>
                        {expandedQuestions.includes(item.id) ? (
                          <ChevronUp
                            width={16}
                            height={16}
                            color={BASE_COLORS.darkText}
                          />
                        ) : (
                          <ChevronDown
                            width={16}
                            height={16}
                            color={BASE_COLORS.darkText}
                          />
                        )}
                      </TouchableOpacity>
                      {expandedQuestions.includes(item.id) && (
                        <View style={styles.answerContainer}>
                          <Text style={[styles.answerText]}>{item.answer}</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            <View style={styles.contactContainer}>
              <Text style={styles.contactTitle}>Still need help?</Text>
              <TouchableOpacity
                style={[
                  styles.contactButton,
                  { backgroundColor: activeTheme.secondaryColor },
                ]}
                onPress={() => setContactModalVisible(true)}
              >
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <ContactSupportModal
            visible={contactModalVisible}
            onClose={() => setContactModalVisible(false)}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  container: {
    marginTop: 32,
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderView: {
    width: 40,
  },
  headerText: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.navigation.headerTitle,
    color: BASE_COLORS.white,
  },
  searchContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: BASE_COLORS.white,
  },
  clearButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: COMPONENT_FONT_SIZES.input.text,
    fontFamily: POPPINS_FONT.regular,
  },
  categoryContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  categoryHeaderText: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
  },
  questionsContainer: {
    width: "100%",
  },
  questionContainer: {
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  questionHeader: {
    backgroundColor: BASE_COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  answerText: {
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    lineHeight: 20,
  },
  searchResultsContainer: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  searchResultsTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.regular,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    textAlign: "center",
    padding: 20,
  },
  contactContainer: {
    padding: 24,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  contactTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.regular,
    marginBottom: 16,
  },
  contactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  contactButtonText: {
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
  },
});

export default HelpFAQ;
