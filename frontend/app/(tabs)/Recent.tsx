import React from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const Recent = () => {
  return (
    <ImageBackground
      source={require("@/assets/images/ph-flag.jpg")}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[
          "rgba(0, 56, 168, 0.85)",
          "rgba(0, 0, 0, 0.6)",
          "rgba(206, 17, 38, 0.85)",
        ]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 pt-12">
          {/* History container */}
          <View className="mx-4 my-6 p-1 gap-1 ">
            {/* Date of translated text */}
            <View className="items-end justify-center">
              <Text className="rounded-lg px-3 py-1 bg-white items-center justify-center  text-customRed font-pmedium">
                Nov. 31, 2025 - 9:09am
              </Text>
            </View>

            <View className="p-3 bg-white rounded-2xl">
              <LinearGradient
                colors={[
                  "rgba(0, 56, 168, 0.85)",
                  "rgba(0, 0, 0, 0.6)",
                  "rgba(206, 17, 38, 0.85)",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="items-center rounded-lg justify-around flex-row"
              >
                <Text className="text-white font-pbold text-xl">Tagalog</Text>

                <View className="h-10 w-10 rounded-full bg-yellow-400/80 items-center justify-center ">
                  <FontAwesome5 name="exchange-alt" size={18} color="#CE1126" />
                </View>

                <Text className="text-white font-pbold text-xl">Bisaya</Text>
              </LinearGradient>
              {/* History with ScrollView */}
              <View className="p-1 flex-row gap-1">
                {/* Original Text Section */}
                <ScrollView className="max-h-96">
                  <Text className="text-customBlue text-lg font-pmedium">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Fuga laboriosam nam, est harum dignissimos amet atque,
                    architecto nesciunt ratione magni excepturi possimus autem
                    asperiores accusantium a rerum suscipit iure libero.
                  </Text>
                </ScrollView>

                {/* Divider */}
                <View className="border-l-2 mx-2 border-customRed h-full" />

                {/* Translated Text Section */}
                <ScrollView className="max-h-96">
                  <Text className="text-customRed text-lg font-pmedium">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Fuga laboriosam nam, est harum dignissimos amet atque,
                    architecto nesciunt ratione magni excepturi possimus autem
                    asperiores accusantium a rerum suscipit iure libero.
                  </Text>
                </ScrollView>
              </View>
            </View>
          </View>
          {/* History container */}
          <View className="mx-4 my-6 p-1 gap-1 ">
            {/* Date of translated text */}
            <View className="items-end justify-center">
              <Text className="rounded-lg px-3 py-1 bg-white items-center justify-center  text-customRed font-pmedium">
                Nov. 31, 2025 - 9:09am
              </Text>
            </View>

            <View className="p-3 bg-white rounded-2xl">
              <LinearGradient
                colors={[
                  "rgba(0, 56, 168, 0.85)",
                  "rgba(0, 0, 0, 0.6)",
                  "rgba(206, 17, 38, 0.85)",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="items-center rounded-lg justify-around flex-row"
              >
                <Text className="text-white font-pbold text-xl">Tagalog</Text>

                <View className="h-10 w-10 rounded-full bg-yellow-400/80 items-center justify-center ">
                  <FontAwesome5 name="exchange-alt" size={18} color="#CE1126" />
                </View>

                <Text className="text-white font-pbold text-xl">Bisaya</Text>
              </LinearGradient>
              {/* History with ScrollView */}
              <View className="p-1 flex-row gap-1">
                {/* Original Text Section */}
                <ScrollView className="max-h-96">
                  <Text className="text-customBlue text-lg font-pmedium">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Fuga laboriosam nam, est harum dignissimos amet atque,
                    architecto nesciunt ratione magni excepturi possimus autem
                    asperiores accusantium a rerum suscipit iure libero.
                  </Text>
                </ScrollView>

                {/* Divider */}
                <View className="border-l-2 mx-2 border-customRed h-full" />

                {/* Translated Text Section */}
                <ScrollView className="max-h-96">
                  <Text className="text-customRed text-lg font-pmedium">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Fuga laboriosam nam, est harum dignissimos amet atque,
                    architecto nesciunt ratione magni excepturi possimus autem
                    asperiores accusantium a rerum suscipit iure libero.
                  </Text>
                </ScrollView>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Recent;
