import React from "react";
import {
  GestureResponderEvent,
  Text,
  View,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import { FeatherIconName } from "@/types/types";
import useThemeStore from "@/store/useThemeStore";

interface SettingItemProps {
  icon: FeatherIconName;
  label: string;
  value?: boolean | string;
  onPress?: (event: GestureResponderEvent) => void;
  toggleSwitch?: () => void;
  customIconColor?: string;
  customContainerStyle?: object;
  customLabelStyle?: object;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  description?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  onPress,
  customIconColor,
  customContainerStyle,
  customLabelStyle,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  description,
}) => {
  const { activeTheme } = useThemeStore();

  const handlePress = (event: GestureResponderEvent) => {
    // If it's a switch item, toggle the switch instead of calling onPress
    if (showSwitch && onSwitchChange) {
      onSwitchChange(!switchValue);
    } else if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, customContainerStyle]}
      onPress={handlePress}
      activeOpacity={showSwitch ? 1 : 0.7}
    >
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: activeTheme.lightColor },
          ]}
        >
          <Feather
            name={icon}
            size={15}
            color={customIconColor || activeTheme.secondaryColor}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, customLabelStyle]}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>

      {/* Show either switch or chevron based on showSwitch prop */}
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{
            false: "#767577",
            true: activeTheme.secondaryColor + "80",
          }}
          thumbColor={switchValue ? activeTheme.secondaryColor : "#f4f3f4"}
        />
      ) : (
        <Feather
          name="chevron-right"
          size={16}
          color={activeTheme.secondaryColor}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: COMPONENT_FONT_SIZES.settings.sectionHeader,
    color: BASE_COLORS.darkText,
    fontFamily: POPPINS_FONT.regular,
  },
  description: {
    fontSize: COMPONENT_FONT_SIZES.settings.itemDescription,
    color: BASE_COLORS.placeholderText,
    fontFamily: POPPINS_FONT.regular,
    marginTop: 2,
    lineHeight: 14,
  },
});

export default SettingItem;
