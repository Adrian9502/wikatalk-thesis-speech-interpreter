import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export default StyleSheet.create({
  headerContainer: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderView: { width: 40 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.darkText,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  settingIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
  },
});
