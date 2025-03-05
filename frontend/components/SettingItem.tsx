import {
  GestureResponderEvent,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Switch,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React from "react";

interface SettingItemProps {
  icon: string;
  label: string;
  value?: boolean | string;
  onPress?: (event: GestureResponderEvent) => void;
  toggleSwitch?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onPress,
  toggleSwitch,
}) => {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4 bg-white rounded-lg mb-2 shadow-sm"
      onPress={onPress}
    >
      {/* Left Side: Icon and Label */}
      <View className="flex-row items-center">
        <FontAwesome5 name={icon} size={20} color="#0038A8" />
        <Text className="ml-3 text-base font-medium text-gray-800">
          {label}
        </Text>
      </View>

      {/* Right Side: Toggle or Arrow */}
      {typeof value === "boolean" ? (
        <Switch
          value={value}
          onValueChange={toggleSwitch}
          trackColor={{ false: "#d1d5db", true: "#FACC15" }}
          thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
        />
      ) : (
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};

export default SettingItem;
