import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export const pronunciationStyles = StyleSheet.create({
  header: {
    marginBottom: 10,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  controlsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  headerDropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  flashListContent: {
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: "transparent",
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
    fontSize: 12,
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dropdownPlaceholder: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  dropdownSelectedText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
  },
  dropdownList: {
    borderRadius: 12,
    fontSize: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});
