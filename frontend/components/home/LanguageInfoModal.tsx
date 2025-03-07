import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { MapPin, MessageCircle, X, Info } from "react-native-feather";
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

  const languageInfo = LANGUAGE_INFO[languageName];

  // Softer Philippines-inspired colors
  const colors = {
    darkBlue: "#1A365D", // Darker blue for background
    blue: "#2C5282", // Softer blue for sections
    red: "#9B2C2C", // Softer red
    yellow: "#ECC94B", // Softer yellow
    white: "#FFFFFF", // White
    lightGray: "#F7FAFC", // Light gray for subtle contrast
  };

  return (
    <View className="absolute inset-0 flex-1 items-center justify-center bg-black/70">
      <View
        className={`w-11/12 max-w-md rounded-2xl p-5 border ${
          infoSection === "top" ? "rotate-180" : ""
        }`}
        style={{
          backgroundColor: colors.darkBlue,
          borderColor: colors.yellow,
          borderWidth: 2,
        }}
      >
        {/* Header with close button */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center justify-center flex-1">
            <Text
              className="text-2xl text-center font-bold"
              style={{ color: colors.yellow }}
            >
              {languageName} Language
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="rounded-full p-2"
            style={{ backgroundColor: colors.blue }}
          >
            <X width={18} height={18} strokeWidth={2} stroke={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image Banner */}
        <View
          className="mb-4 rounded-lg overflow-hidden"
          style={{ borderColor: colors.blue, borderWidth: 1 }}
        >
          <Image
            source={getLanguageBackground(languageName)}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        </View>

        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          {/* Major Cities */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <MapPin
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text
                className="font-bold text-lg ml-2"
                style={{ color: colors.white }}
              >
                Major Cities
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {languageInfo.majorCities.map((city, index) => (
                <View
                  key={index}
                  className="rounded-full px-3 py-1 mr-2 mb-2"
                  style={{ backgroundColor: colors.blue }}
                >
                  <Text style={{ color: colors.white }}>{city}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Region */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <MapPin
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text
                className="font-bold text-lg ml-2"
                style={{ color: colors.white }}
              >
                Region
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              <View
                className="rounded-full px-3 py-1 mr-2 mb-2"
                style={{ backgroundColor: colors.red, opacity: 0.9 }}
              >
                <Text className="font-bold" style={{ color: colors.white }}>
                  {languageInfo.region}
                </Text>
              </View>
            </View>
          </View>

          {/* Common Phrases */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <MessageCircle
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.yellow}
              />
              <Text
                className="font-bold text-lg ml-2"
                style={{ color: colors.white }}
              >
                Phrases
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                className="flex-1 rounded-xl p-3"
                style={{ backgroundColor: colors.blue }}
              >
                <Text
                  className="text-center font-semibold mb-1.5"
                  style={{ color: colors.yellow }}
                >
                  Hello
                </Text>
                <Text
                  className="font-semibold text-center"
                  style={{ color: colors.white }}
                >
                  {languageInfo.commonGreetings.hello}
                </Text>
              </View>
              <View
                className="flex-1 rounded-xl p-3"
                style={{ backgroundColor: colors.blue }}
              >
                <Text
                  className="mb-1.5 font-semibold text-center"
                  style={{ color: colors.yellow }}
                >
                  Thank You
                </Text>
                <Text
                  className="font-semibold text-center"
                  style={{ color: colors.white }}
                >
                  {languageInfo.commonGreetings.thankYou}
                </Text>
              </View>
            </View>
          </View>

          {/* Cultural Info */}
          <View className="flex-row items-center mb-3">
            <Info
              width={18}
              height={18}
              strokeWidth={2}
              stroke={colors.yellow}
            />
            <Text
              className="font-bold text-lg ml-2"
              style={{ color: colors.white }}
            >
              Cultural Notes
            </Text>
          </View>
          <View
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.blue }}
          >
            <View className="mb-3">
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.yellow }}
              >
                Symbol
              </Text>
              <Text style={{ color: colors.white }}>{languageInfo.symbol}</Text>
            </View>

            <View>
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.yellow }}
              >
                Fun Fact
              </Text>
              <Text style={{ color: colors.white }}>{languageInfo.fact}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default LanguageInfoModal;
