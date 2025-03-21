import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import ConfirmationModal from "@/components/ConfirmationModal";

// Define types
type TabType = "Speech" | "Translate" | "Scan";

interface HistoryItem {
  id: string;
  date: string;
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
}

interface HistoryItems {
  Speech: HistoryItem[];
  Translate: HistoryItem[];
  Scan: HistoryItem[];
}

const RecentTranslations: React.FC = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  // State to track active tab
  const [activeTab, setActiveTab] = useState<TabType>("Speech");

  // State for delete confirmation
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Mock data for history items
  const [historyItems, setHistoryItems] = useState<HistoryItems>({
    Speech: [
      {
        id: "1",
        date: "Mar. 20, 2025 - 10:30am",
        fromLanguage: "Tagalog",
        toLanguage: "Bisaya",
        originalText: "Kumusta ka? Maganda ang araw ngayon.",
        translatedText: "Kumusta ka? Nindot ang adlaw karon.",
      },
      {
        id: "2",
        date: "Mar. 19, 2025 - 3:45pm",
        fromLanguage: "Bisaya",
        toLanguage: "Tagalog",
        originalText: "Unsa imong pangalan? Taga asa ka?",
        translatedText: "Ano ang pangalan mo? Taga saan ka?",
      },
    ],
    Translate: [
      {
        id: "3",
        date: "Mar. 18, 2025 - 2:15pm",
        fromLanguage: "English",
        toLanguage: "Tagalog",
        originalText: "I would like to learn more about Filipino culture.",
        translatedText: "Gusto kong matuto pa tungkol sa kulturang Pilipino.",
      },
    ],
    Scan: [
      {
        id: "4",
        date: "Mar. 17, 2025 - 9:20am",
        fromLanguage: "English",
        toLanguage: "Bisaya",
        originalText: "No parking. Violators will be towed.",
        translatedText: "Ayaw pagparking. Ang mga malapas kuhaon.",
      },
    ],
  });

  // Handle delete confirmation
  const handleDeletePress = (id: string): void => {
    setItemToDelete(id);
    setDeleteConfirmVisible(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (): void => {
    if (itemToDelete) {
      // Create a new object to avoid mutating state directly
      const updatedHistoryItems = { ...historyItems };

      // Filter out the item to delete
      updatedHistoryItems[activeTab] = historyItems[activeTab].filter(
        (item) => item.id !== itemToDelete
      );

      // Update state
      setHistoryItems(updatedHistoryItems);

      // Close confirmation and reset item to delete
      setDeleteConfirmVisible(false);
      setItemToDelete(null);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = (): void => {
    setDeleteConfirmVisible(false);
    setItemToDelete(null);
  };

  // Get icon for each tab type
  const getTabIcon = (type: TabType): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "Speech":
        return "mic";
      case "Translate":
        return "globe";
      case "Scan":
        return "camera";
      default:
        return "clock";
    }
  };

  // Render tab buttons
  const renderTabs = (): React.ReactNode => {
    const tabs: TabType[] = ["Speech", "Translate", "Scan"];

    return (
      <View style={styles.tabOuterContainer}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Feather
                name={getTabIcon(tab)}
                size={20}
                color={activeTab === tab ? BASE_COLORS.white : BASE_COLORS.blue}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Feather
            name={getTabIcon(activeTab)}
            size={32}
            color={TITLE_COLORS.customWhite}
          />
        </View>
        <Text style={styles.emptyTitle}>No {activeTab} Records</Text>
        <Text style={styles.emptyText}>
          Your {activeTab.toLowerCase()} translations will appear here
        </Text>
      </View>
    );
  };

  // Render history items for the active tab
  const renderHistoryItems = (): React.ReactNode => {
    const items = historyItems[activeTab] || [];

    if (items.length === 0) {
      return renderEmptyState();
    }

    return items.map((item) => (
      <View key={item.id} style={styles.historyContainer}>
        {/* Date and Delete button */}
        <View style={styles.headerContainer}>
          <View style={styles.dateContainer}>
            <Calendar
              width={14}
              height={14}
              color={BASE_COLORS.blue}
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => handleDeletePress(item.id)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={BASE_COLORS.orange}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Language Header */}
          <View style={styles.languageHeaderContainer}>
            <LinearGradient
              colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.languageHeaderContent}
            >
              <View style={styles.languageBlock}>
                <Text style={styles.languageLabel}>From</Text>
                <Text style={styles.languageText}>{item.fromLanguage}</Text>
              </View>

              <LinearGradient
                colors={["#4A6FFF", "#9C4AFF"]}
                style={styles.exchangeIconContainer}
              >
                <Feather
                  name="repeat"
                  size={16}
                  color={TITLE_COLORS.customWhite}
                />
              </LinearGradient>

              <View style={styles.languageBlock}>
                <Text style={styles.languageLabel}>To</Text>
                <Text style={styles.languageText}>{item.toLanguage}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Content Container */}
          <View style={styles.translationContainer}>
            {/* Original Text Section */}
            <View style={styles.textSection}>
              <View style={styles.textLabelContainer}>
                <Text style={styles.textLabel}>Original</Text>
              </View>
              <ScrollView
                style={styles.textScrollView}
                contentContainerStyle={styles.textScrollContent}
              >
                <Text style={styles.originalText}>{item.originalText}</Text>
              </ScrollView>
            </View>

            {/* Translated Text Section */}
            <View style={styles.textSection}>
              <View style={styles.textLabelContainer}>
                <Text style={styles.textLabel}>Translation</Text>
              </View>
              <ScrollView
                style={styles.textScrollView}
                contentContainerStyle={styles.textScrollContent}
              >
                <Text style={styles.translatedText}>{item.translatedText}</Text>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={dynamicStyles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeAreaView}>
        {/* Header */}
        <View style={styles.header}>
          <WikaTalkLogo title="Recent" />
        </View>

        {/* Tabs */}
        {renderTabs()}

        {/* History Items */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHistoryItems()}
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={deleteConfirmVisible}
          title="Delete Translation"
          text="Are you sure you want to delete this translation? This action cannot be undone."
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          confirmButtonText="Delete"
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabOuterContainer: {
    borderWidth: 2,
    borderColor: BASE_COLORS.lightBlue,
    borderRadius: 14,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: BASE_COLORS.blue,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
  },
  activeTabText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
  historyContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateContainer: {
    borderRadius: 8,
    backgroundColor: BASE_COLORS.lightBlue,
    borderColor: BASE_COLORS.white,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
  },
  dateIcon: {
    marginRight: 6,
  },
  dateText: {
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
    fontSize: 12,
  },
  deleteIcon: {
    padding: 4,
    backgroundColor: BASE_COLORS.lightPink,
    borderRadius: 8,
  },
  contentContainer: {
    backgroundColor: BASE_COLORS.white,
    borderColor: BASE_COLORS.lightBlue,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  languageHeaderContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  languageHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  languageBlock: {
    alignItems: "center",
    flex: 1,
  },
  languageLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: TITLE_COLORS.customWhite,
    opacity: 0.9,
    marginBottom: 2,
  },
  languageText: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customWhite,
  },
  exchangeIconContainer: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: BASE_COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  translationContainer: {
    padding: 12,
    flexDirection: "row",
    gap: 16,
  },
  textSection: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customWhite,
    borderRadius: 8,
    padding: 12,
  },
  textLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.placeholderText,
    marginRight: 6,
  },

  textScrollView: {
    maxHeight: 100,
  },
  textScrollContent: {
    paddingRight: 8,
  },
  originalText: {
    color: BASE_COLORS.blue,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  translatedText: {
    color: BASE_COLORS.orange,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TITLE_COLORS.customBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: TITLE_COLORS.customNavyBlue,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: BASE_COLORS.placeholderText,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});

export default RecentTranslations;
