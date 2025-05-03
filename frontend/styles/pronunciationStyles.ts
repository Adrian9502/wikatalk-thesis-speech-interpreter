import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export const pronunciationStyles = StyleSheet.create({
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  controlsContainer: {
    flexDirection: "row",
    marginBottom: 16,
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
    fontSize: 17,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
});
