import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export const pronunciationStyles = StyleSheet.create({
  header: {
    marginBottom: 10,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  controlsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  //  Combined header and dropdown container
  headerDropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  listContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden", // keeps rounded corners clean
    height: "80%", // or any fixed percentage/px height
  },
  flatListContent: {
    paddingBottom: 20,
  },
  listHeaderTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.blue,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Dropdown styles
  dropdown: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 150,
    maxWidth: 200,
  },
  dropdownList: {
    borderRadius: 20,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  dropdownPlaceholder: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  dropdownSelectedText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
  },
});
