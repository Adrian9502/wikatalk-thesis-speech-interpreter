import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Notifier,
  Easing,
  ShowNotificationParams,
} from "react-native-notifier";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_COLORS } from "@/constant/colors";
import { Ionicons } from "@expo/vector-icons";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface ShowNotificationData {
  type: "success" | "error" | "info";
  title: string;
  description: string;
}

// Custom safe area aware notification component
const SafeAreaNotification: React.FC<ShowNotificationData> = ({
  type,
  title,
  description,
}) => {
  const insets = useSafeAreaInsets();

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          borderColor: BASE_COLORS.success,
          iconName: "checkmark-circle" as const,
          iconColor: BASE_COLORS.success,
        };
      case "error":
        return {
          borderColor: BASE_COLORS.danger,
          iconName: "alert-circle" as const,
          iconColor: BASE_COLORS.danger,
        };
      case "info":
      default:
        return {
          borderColor: BASE_COLORS.blue,
          iconName: "information-circle" as const,
          iconColor: BASE_COLORS.blue,
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: insets.top + 5,
          borderLeftColor: typeConfig.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={typeConfig.iconName}
          size={24}
          color={typeConfig.iconColor}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const showNotification = ({
  type,
  title,
  description,
}: ShowNotificationData) => {
  Notifier.showNotification<React.FC<ShowNotificationData>>({
    Component: SafeAreaNotification,
    componentProps: {
      type,
      title,
      description,
    },
    duration: 3000,
    showAnimationDuration: 500,
    showEasing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    onHidden: () => console.log("Notification hidden"),
    onPress: () => Notifier.hideNotification(),
    hideOnPress: true,
  } as ShowNotificationParams<React.FC<ShowNotificationData>>);
};

export default showNotification;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 60,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: "#333",
    marginBottom: 2,
  },
  description: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    lineHeight: 16,
  },
});
