import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { useNavigation } from "expo-router";

type HeaderProps = {
  title: string;
  disableBack?: boolean;
  hideBack?: boolean;
  onBackPress?: () => void;
};

const GameHeader = ({
  title,
  disableBack = false,
  hideBack = false,
  onBackPress,
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (disableBack) return;

    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left section - Back button */}
      {!hideBack ? (
        <TouchableOpacity
          style={[styles.backButton, disableBack && styles.disabledButton]}
          onPress={handleBackPress}
          disabled={disableBack}
          activeOpacity={0.7}
        >
          <ArrowLeft width={20} height={20} color={BASE_COLORS.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Center section - Title with game styling */}
      <View style={styles.titleContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.titleUnderline} />
        </View>
      </View>

      {/* Right section - Placeholder for symmetry */}
      <View style={styles.placeholder} />
    </View>
  );
};

export default React.memo(GameHeader);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 56,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.4,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  titleWrapper: {
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 2,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 1,
    marginTop: 4,
    opacity: 0.8,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
});
