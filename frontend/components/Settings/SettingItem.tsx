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
  onPress,
  customIconColor,
  customContainerStyle,
  customLabelStyle,
}) => {
  const { activeTheme } = useThemeStore();

  return (
    <TouchableOpacity
      style={[styles.container, customContainerStyle]}
      onPress={onPress}
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
            size={16}
            color={customIconColor || activeTheme.secondaryColor}
          />
        </View>
        <Text style={[styles.label, customLabelStyle]}>{label}</Text>
      </View>

      <Feather
        name="chevron-right"
        size={16}
        color={activeTheme.secondaryColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  label: {
    fontSize: 13,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
  },
});

export default SettingItem;
