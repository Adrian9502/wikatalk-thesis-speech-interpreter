import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export default StyleSheet.create({
  headerContainer: {
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
  placeholderView: { width: 40 },
  headerTitle: {
    fontSize: 20,
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
  profileCard: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
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
    padding: 16,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
  },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  dangerIcon: {
    backgroundColor: BASE_COLORS.lightPink,
  },
  dangerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.orange,
  },
});
