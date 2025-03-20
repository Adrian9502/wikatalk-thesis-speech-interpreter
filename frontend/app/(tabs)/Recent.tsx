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
  Image,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@/styles/globalStyles";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import { Ionicons } from "@expo/vector-icons";
import { AlertCircle, Calendar, Trash2 } from "react-native-feather";

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

interface DeleteConfirmationProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <AlertCircle
              width={24}
              height={24}
              color={TITLE_COLORS.customRed}
            />
            <Text style={styles.modalTitle}>Delete Translation</Text>
          </View>

          <Text style={styles.modalText}>
            Are you sure you want to delete this translation? This action cannot
            be undone.
          </Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RecentTranslations: React.FC = () => {
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

  // Render tab indicator
  const renderTabIndicator = () => {
    const tabs: TabType[] = ["Speech", "Translate", "Scan"];
    const index = tabs.indexOf(activeTab);
    const itemWidth = 100 / tabs.length;
    const offset = index * itemWidth;

    return (
      <View
        style={[
          styles.tabIndicator,
          { left: `${offset}%`, width: `${itemWidth}%` },
        ]}
      />
    );
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
              style={styles.tabButton}
              onPress={() => setActiveTab(tab)}
            >
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
          {renderTabIndicator()}
        </View>
      </View>
    );
  };

  // Get icon for each tab type
  const getTabIcon = (type: TabType): string => {
    switch (type) {
      case "Speech":
        return "microphone";
      case "Translate":
        return "language";
      case "Scan":
        return "camera";
      default:
        return "history";
    }
  };

  // Render history items for the active tab
  const renderHistoryItems = (): React.ReactNode => {
    const items = historyItems[activeTab] || [];

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome5
            name={getTabIcon(activeTab)}
            size={48}
            color={BASE_COLORS.placeholderText}
          />
          <Text style={styles.emptyText}>No {activeTab} history yet</Text>
        </View>
      );
    }

    return items.map((item) => (
      <View key={item.id} style={styles.historyContainer}>
        {/* Date and Delete button */}
        <View style={styles.headerContainer}>
          <View style={styles.dateContainer}>
            <Calendar
              width={17}
              height={17}
              color={BASE_COLORS.darkText}
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => handleDeletePress(item.id)}
          >
            <Trash2 width={19} height={19} color={BASE_COLORS.orange} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Language Header */}
          <View style={styles.languageHeaderContainer}>
            <View style={styles.languageBlock}>
              <Text style={styles.languageLabel}>From</Text>
              <Text style={styles.languageText}>{item.fromLanguage}</Text>
            </View>

            <View style={styles.exchangeIconContainer}>
              <LinearGradient
                colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exchangeGradient}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={20}
                  color={BASE_COLORS.white}
                />
              </LinearGradient>
            </View>

            <View style={styles.languageBlock}>
              <Text style={styles.languageLabel}>To</Text>
              <Text style={styles.languageText}>{item.toLanguage}</Text>
            </View>
          </View>

          {/* Content Container */}
          <View style={styles.translationContainer}>
            {/* Original Text Section */}
            <View style={styles.textSection}>
              <Text style={styles.textLabel}>Original</Text>
              <ScrollView
                style={styles.textScrollView}
                contentContainerStyle={styles.textScrollContent}
              >
                <Text style={styles.originalText}>{item.originalText}</Text>
              </ScrollView>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Translated Text Section */}
            <View style={styles.textSection}>
              <Text style={styles.textLabel}>Translation</Text>
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
    <View style={globalStyles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeAreaView}>
        {/* WikaTalk Logo */}
        <WikaTalkLogo title="Recent" />

        {/* Tabs */}
        {renderTabs()}

        {/* History Items */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderHistoryItems()}
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          visible={deleteConfirmVisible}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabOuterContainer: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 1,
  },
  tabIndicator: {
    position: "absolute",
    height: 4,
    backgroundColor: BASE_COLORS.blue,
    bottom: 0,
    borderRadius: 2,
    zIndex: 0,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
  },
  activeTabText: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-SemiBold",
  },
  historyContainer: {
    marginBottom: 16,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateContainer: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: BASE_COLORS.lightBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dateIcon: {
    marginRight: 6,
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    fontSize: 15,
  },
  deleteIcon: {
    backgroundColor: BASE_COLORS.white,
    padding: 8,
    borderRadius: 8,
  },
  contentContainer: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  languageHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: BASE_COLORS.lightBlue,
  },
  languageBlock: {
    alignItems: "center",
    flex: 1,
  },
  languageLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    opacity: 0.7,
    marginBottom: 2,
  },
  languageText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.darkText,
  },
  exchangeIconContainer: {
    paddingHorizontal: 16,
  },
  exchangeGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  translationContainer: {
    flexDirection: "row",
    padding: 16,
  },
  textSection: {
    flex: 1,
  },
  textLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.placeholderText,
    marginBottom: 8,
  },
  textScrollView: {
    maxHeight: 120,
  },
  textScrollContent: {
    paddingRight: 8,
  },
  originalText: {
    color: BASE_COLORS.blue,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 24,
  },
  translatedText: {
    color: BASE_COLORS.orange,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 24,
  },
  divider: {
    width: 1,
    backgroundColor: BASE_COLORS.borderColor,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: BASE_COLORS.placeholderText,
    fontFamily: "Poppins-Medium",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.darkText,
    marginLeft: 12,
  },
  modalText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: BASE_COLORS.lightBlue,
  },
  deleteButton: {
    backgroundColor: TITLE_COLORS.customRed,
  },
  cancelButtonText: {
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Medium",
  },
  deleteButtonText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
  },
});

export default RecentTranslations;
