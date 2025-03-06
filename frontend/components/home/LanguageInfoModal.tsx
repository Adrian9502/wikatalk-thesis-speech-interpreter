import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";

interface LanguageInfoModalProps {
  visible: boolean;
  languageName: string;
  infoSection: "top" | "bottom" | null;
  onClose: () => void;
}

const LanguageInfoModal: React.FC<LanguageInfoModalProps> = ({
  visible,
  languageName,
  infoSection,
  onClose,
}) => {
  if (!visible || !languageName || !LANGUAGE_INFO[languageName]) {
    return null;
  }

  return (
    <View className="absolute inset-0 flex-1 items-center justify-center bg-black/70">
      <View
        className={`bg-gray-900 w-4/5 rounded-xl p-5 border border-yellow-400 ${
          infoSection === "top" ? "rotate-180" : ""
        }`}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-yellow-400 text-xl font-bold">
            {languageName} Language
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={18} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <Image
          source={getLanguageBackground(languageName)}
          className="w-full h-40 rounded-lg mb-3"
          resizeMode="cover"
        />

        <View className="space-y-4 p-4 bg-gray-800 rounded-lg shadow-md">
          {[
            {
              label: "Region",
              value: LANGUAGE_INFO[languageName].region,
            },
            {
              label: "Symbol",
              value: LANGUAGE_INFO[languageName].symbol,
            },
            {
              label: "Fun Fact",
              value: LANGUAGE_INFO[languageName].fact,
            },
          ].map((item, index) => (
            <View key={index} className="flex-row flex-wrap items-start">
              <Text className="text-yellow-400 font-semibold w-24">
                {item.label}:
              </Text>
              <Text className="text-white flex-1">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default LanguageInfoModal;
