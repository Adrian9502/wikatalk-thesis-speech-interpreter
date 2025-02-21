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
      className="flex-row items-center justify-between py-4 border-b border-gray-200"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <FontAwesome5 name={icon} size={22} color="#10b981" />
        <Text className="ml-4 text-base font-medium text-gray-800">
          {label}
        </Text>
      </View>
      {typeof value === "boolean" ? (
        <Switch
          value={value}
          onValueChange={toggleSwitch}
          trackColor={{ false: "#d1d5db", true: "#10b981" }}
          thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
        />
      ) : (
        <View className="flex-row items-center">
          {value && <Text className="mr-2 text-gray-600">{value}</Text>}
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color="#9ca3af"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SettingItem;
