import { SafeAreaView, Text, View, Image } from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
const Home = () => {
  const [tagalogText, setTagalogText] = useState("");
  const [bisayaText, setBisayaText] = useState("");

  return (
    <SafeAreaView className="h-screen bg-white flex items-center justify-around flex-1 pt-10">
      <StatusBar style="dark" />
      <View className="flex items-center relative justify-center w-full h-full">
        {/* Top section */}
        <View className="w-full h-1/2 bg-white pt-6 flex items-center justify-end relative">
          <View className="p-3 absolute top-12 border-4 border-emerald-500 rounded-full">
            <Image
              source={require("@/assets/images/mic-emerald.png")}
              className="w-12 h-12 rotate-180"
            />
          </View>
          <Text className="text-emerald-500 rotate-180 text-2xl p-5">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Porro
            placeat id asperiores excepturi sapiente quod nihil facilis tenetur
            odio nobis, aut voluptate, totam reiciendis repellat ad ipsam
            dolores iusto tempora!
          </Text>
        </View>
        {/* Exchange icon and language translation */}
        <View className="flex-row relative items-center justify-between w-full">
          <Text className="font-pregular text-emerald-500 w-1/2 text-xl py-3 px-2">
            Bisakol
          </Text>

          {/* Centered Circular Icon */}
          <View className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-emerald-500 bg-white items-center justify-center z-50">
            <FontAwesome5 name="exchange-alt" size={28} color="#10B981" />
          </View>

          <Text className="font-pregular py-3 px-2 text-white w-1/2 bg-emerald-500 text-xl text-end rotate-180">
            Tangalog
          </Text>
        </View>
        {/* bottom section */}
        <View className="w-full relative h-1/2 bg-emerald-500 pb-6 flex items-center justify-start p-3">
          <Text className="text-white p-5 lin text-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
            repellat dolor nisi ad libero, dignissimos error amet est ut
            obcaecati doloribus asperiores sit, facere reiciendis nemo
            architecto. Labore, iste officiis?
          </Text>
          <View className="absolute bottom-12 p-3 border-4 border-white bg-emerald-500 rounded-full">
            <Image
              source={require("@/assets/images/mic-white.png")}
              className="w-12 h-12"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
