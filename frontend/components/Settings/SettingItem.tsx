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
import { BASE_COLORS } from "@/constant/colors";
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
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onPress,
  toggleSwitch,
  customIconColor,
  customContainerStyle,
  customLabelStyle,
}) => {
  const { activeTheme } = useThemeStore();

  const isToggleItem = typeof value === "boolean";

  return (
    <TouchableOpacity
      style={[styles.container, customContainerStyle]}
      onPress={onPress}
      disabled={isToggleItem}
    >
      {/* Left Side: Icon and Label */}
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: activeTheme.lightColor },
          ]}
        >
          <Feather
            name={icon}
            size={18}
            color={customIconColor || activeTheme.secondaryColor}
          />
        </View>
        <Text style={[styles.label, customLabelStyle]}>{label}</Text>
      </View>

      {/* Right Side: Toggle or Arrow */}
      {isToggleItem ? (
        <Switch
          value={value}
          onValueChange={toggleSwitch}
          trackColor={{
            false: BASE_COLORS.borderColor,
            true: activeTheme.secondaryColor,
          }}
          thumbColor={"#FFFFFF"}
          ios_backgroundColor={BASE_COLORS.borderColor}
        />
      ) : (
        <Feather
          name="chevron-right"
          size={20}
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
    padding: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
  },
});

export default SettingItem;
