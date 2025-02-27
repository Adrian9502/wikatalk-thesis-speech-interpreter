import { SafeAreaView, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MicButton from "@/components/MicButton";
import { Audio } from "expo-av";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import * as Speech from "expo-speech";

const Home = () => {
  const [upperTextfield, setUpperTextfield] = useState("...");
  const [bottomTextfield, setBottomTextfield] = useState("...");
  const [language1, setLanguage1] = useState("Tagalog");
  const [language2, setLanguage2] = useState("Cebuano");
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [user, setUser] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  useEffect(() => {
    if (loading) {
      console.log("loading..");
    }
  }, [loading]);

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    console.log("Recording stopped and stored at", uri);
    if (!uri) {
      console.error("No recording URI found");
      return;
    }
  }

  async function translateRecord(srcLang: string, tgtLang: string) {
    const FILEUPLOAD_URL = process.env.EXPO_PUBLIC_NGROK_FILEUPLOAD_URL;
    if (!FILEUPLOAD_URL) {
      console.error("No file upload URL found");
      return;
    }
    const uri = recording?.getURI();
    const formData = new FormData();
    const filetype = uri?.split(".").pop();
    const filename = uri?.split("/").pop();
    setLoading(true);
    formData.append("file", {
      uri: uri,
      type: `audio/${filetype}`,
      name: filename,
    });
    formData.append("tgtLang", tgtLang);
    formData.append("srcLang", srcLang);
    console.log(formData);
    console.log("File upload URL: ", FILEUPLOAD_URL);
    axios
      .post(FILEUPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setLoading(false);
        console.log("Response: ", response.data);
        handleTextfield(
          response?.data["translated_text"],
          response?.data["transcribed_text"]
        );
        synthesis(response?.data["translated_text"]);
      })
      .catch((error) => {
        console.log("Error translationg record: ", error);
      });
  }

  const synthesis = (text: string, language: string = "fil-PH") => {
    Speech.speak(text, { language: language, rate: 0.75 });
  };

  const handleTextfield = (text1: string, text2: string) => {
    if (user == 1) {
      setUpperTextfield(text1);
      setBottomTextfield(text2);
    } else {
      setUpperTextfield(text2);
      setBottomTextfield(text1);
    }
  };

  const handlePress = async (event: number) => {
    if (event == 1) {
      console.log("Mic 1 pressed!");
      setUser(1);
      if (recording) {
        await stopRecording();
        await translateRecord(language1, language2);
      } else {
        startRecording();
      }
    } else if (event == 2) {
      console.log("Mic 2 pressed!");
      setUser(2);
      if (recording) {
        await stopRecording();
        await translateRecord(language2, language1);
      } else {
        startRecording();
      }
    }
  };

  return (
    <SafeAreaView className="h-screen bg-white flex items-center justify-around flex-1 pt-10">
      <StatusBar style="dark" />
      <View className="flex items-center relative justify-center w-full h-full">
        {/* Top section */}
        <View className="w-full h-1/2 bg-white pt-6 flex items-center justify-end relative">
          <View className="p-3 absolute top-12 border-4 border-emerald-500 rounded-full ">
            <MicButton
              source={require("@/assets/images/mic-emerald.png")}
              imgClassname={"w-12 h-12 rotate-180"}
              onPress={() => handlePress(2)}
            />
          </View>
          <Text className="text-emerald-500 font-pregular rotate-180 text-2xl p-5">
            {upperTextfield}
          </Text>
        </View>
        {/* Exchange icon and language translation */}
        <View className="flex-row relative items-center justify-between w-full">
          <Text className="font-pregular text-emerald-500 w-1/2 text-xl py-3 px-2">
            {language2}
          </Text>

          {/* Centered Circular Icon */}
          <View className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-emerald-500 bg-white items-center justify-center z-50">
            <FontAwesome5 name="exchange-alt" size={28} color="#10B981" />
          </View>

          <Text className="font-pregular py-3 px-2 text-white w-1/2 bg-emerald-500 text-xl text-end rotate-180">
            {language1}
          </Text>
        </View>
        {/* bottom section */}
        <View className="w-full relative h-1/2 bg-emerald-500 pb-6 flex items-center justify-start p-3">
          <Text className="text-white p-5 text-2xl font-pregular">
            {bottomTextfield}
          </Text>
          <View className="absolute bottom-12 p-3 border-4 border-white bg-emerald-500 rounded-full">
            <MicButton
              source={require("@/assets/images/mic-white.png")}
              onPress={() => handlePress(1)}
              imgClassname="w-12 h-12"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
