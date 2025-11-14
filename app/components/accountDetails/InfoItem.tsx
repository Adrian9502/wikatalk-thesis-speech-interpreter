import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constants/fontSizes";

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: any;
  showDivider?: boolean;
  isLast?: boolean;
}

// Memoize the divider component
const Divider = React.memo(() => <View style={styles.divider} />);

export const InfoItem = React.memo(
  ({
    icon,
    label,
    value,
    theme,
    showDivider = false,
    isLast = false,
  }: InfoItemProps) => {
    // Memoize style objects
    const iconContainerStyle = React.useMemo(
      () => [styles.infoIconContainer, { backgroundColor: theme.lightColor }],
      [theme.lightColor]
    );

    const valueStyle = React.useMemo(
      () => [
        styles.infoValue,
        { color: theme.textColor || BASE_COLORS.darkText },
      ],
      [theme.textColor]
    );

    return (
      <View>
        <View style={styles.infoItem}>
          <View style={iconContainerStyle}>{icon}</View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={valueStyle} numberOfLines={2}>
              {value}
            </Text>
          </View>
        </View>
        {showDivider && !isLast && <Divider />}
      </View>
    );
  }
);

const styles = StyleSheet.create({
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
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: COMPONENT_FONT_SIZES.settings.sectionHeader,
    fontFamily: POPPINS_FONT.regular,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 15,
  },
});

InfoItem.displayName = "InfoItem";
