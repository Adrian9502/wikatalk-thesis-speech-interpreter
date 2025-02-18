import React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, SafeAreaView, ScrollView } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Logo from "@/components/Logo";
const Recent = () => {
  return (
    <SafeAreaView className="flex-1 bg-emerald-500">
      <StatusBar style="dark" />
      {/* Logo */}
      <Logo title="WikaBalikan" />
      {/* History container */}
      <View className="mx-4 p-1 gap-1">
        {/* Date of translated text */}
        <View className=" items-end  justify-center">
          <Text className="rounded-lg px-1 bg-white items-center justify-center  text-emerald-500 font-pmedium">
            Nov. 31, 2025 - 9:09am
          </Text>
        </View>

        <View className="p-3 bg-white rounded-2xl">
          <View className="items-center rounded-xl justify-around flex-row bg-emerald-500">
            <Text className="text-white font-pbold text-xl">Tangalog</Text>

            <View className="h-10 w-10 rounded-full bg-white items-center justify-center">
              <FontAwesome5 name="exchange-alt" size={18} color="#10B981" />
            </View>

            <Text className="text-white font-pbold text-xl">Bisakol</Text>
          </View>

          {/* History with ScrollView */}
          <View className="p-1 flex-row gap-1">
            {/* Original Text Section */}
            <ScrollView className="max-h-96">
              <Text className="text-emerald-500 text-lg font-pmedium">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
                laboriosam nam, est harum dignissimos amet atque, architecto
                nesciunt ratione magni excepturi possimus autem asperiores
                accusantium a rerum suscipit iure libero.
              </Text>
            </ScrollView>

            {/* Divider */}
            <View className="border-l-2 border-emerald-500 h-full" />

            {/* Translated Text Section */}
            <ScrollView className="max-h-96">
              <Text className="text-emerald-500 text-lg font-pmedium">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
                laboriosam nam, est harum dignissimos amet atque, architecto
                nesciunt ratione magni excepturi possimus autem asperiores
                accusantium a rerum suscipit iure libero.
              </Text>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Recent;
