import {
  SafeAreaView,
  Text,
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { User, Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { LoginFormData } from "@/context/ValidationContext";
import { router } from "expo-router";

const SignIn = () => {
  const { loginSchema } = useValidation();
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: "",
    password: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: formData,
  });

  const handleLogin = (data: LoginFormData) => {
    console.log("Login data:", data);
    // Here you would typically make an API call to validate the credentials
    Alert.alert("Success", `Welcome back!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Logo Section */}
            <View style={styles.curvedTopContainer}>
              <Image
                className="w-full"
                source={require("../../assets/images/WikaTalk-logo.png")}
                resizeMode="contain"
              />
              <View className="w-full items-center justify-center">
                <Text className="font-pbold z-50 text-[3rem] -mb-6 text-emerald-500 text-center">
                  WikaTalk
                </Text>
                <Text className="font-pregular text-xl text-emerald-500">
                  Lorem ipsum dolor amet
                </Text>
              </View>
            </View>
            {/* Form Section */}
            <View className="py-5 px-16 w-full gap-4 mt-8">
              <Text className="text-4xl mb-12 text-center font-pbold text-white">
                Sign In
              </Text>

              <FormInput
                placeholder="Username or Email"
                value={formData.usernameOrEmail}
                onChangeText={(text) =>
                  setFormData({ ...formData, usernameOrEmail: text })
                }
                IconComponent={User}
                control={control}
                name="usernameOrEmail"
                error={errors.usernameOrEmail?.message}
              />

              <FormInput
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                IconComponent={Lock}
                control={control}
                name="password"
                error={errors.password?.message}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleSubmit(handleLogin)}
              >
                <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                  Sign In
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-4 mb-6">
                <Text className="text-white font-pregular">
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/SignUp")}>
                  <Text className="text-white font-pbold ml-2">Sign Up</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center items-center mt-4 mb-6">
                <Text
                  onPress={() => router.push("/")}
                  className="text-white font-pregular"
                >
                  Back to <Text className="font-pbold">Home</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10B981",
  },
  curvedTopContainer: {
    width: Dimensions.get("window").width,
    height: 350,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomLeftRadius: "100%", // Curved top left corner
    borderBottomRightRadius: "100%", // Curved top right corner
  },
});
