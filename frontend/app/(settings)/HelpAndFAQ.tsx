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
import faqItems from "@/utils/HelpAndFAQ/faqItems";
import { FAQItem } from "@/types/faqItems";
import categories from "@/utils/HelpAndFAQ/categories";
import ContactSupportModal from "@/components/helpAndFAQ/ContactSupportModal";
import { Header } from "@/components/Header";
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
          <Header title="Help & FAQ" />
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar]}>
              <Search
                width={20}
                height={20}
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
          <ScrollView style={styles.container}>
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
                      <ChevronUp width={24} height={24} color="#ffffff" />
                    ) : (
                      <ChevronDown width={24} height={24} color="#ffffff" />
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
                                  width={24}
                                  height={24}
                                  color={BASE_COLORS.darkText}
                                />
                              ) : (
                                <ChevronDown
                                  width={24}
                                  height={24}
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
                  <Text style={[styles.noResultsText, { color: "#fff" }]}>
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
                            width={20}
                            height={20}
                            color={BASE_COLORS.darkText}
                          />
                        ) : (
                          <ChevronDown
                            width={20}
                            height={20}
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
    fontFamily: "Poppins-Medium",
    fontSize: 20,
    color: "#ffffff",
  },
  searchContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
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
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  categoryContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center", // Center categories when collapsed
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    width: "100%", // Ensure the header takes full width
  },
  categoryHeaderText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
  questionsContainer: {
    width: "100%",
  },
  questionContainer: {
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  questionHeader: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  answerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  searchResultsContainer: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  searchResultsTitle: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
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
    fontSize: 15,
    color: "#fff",
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
  },
  contactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    fontFamily: "Poppins-Regular",
    color: "#ffffff",
    fontSize: 13,
  },
});

export default HelpFAQ;
