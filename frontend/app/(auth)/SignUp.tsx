import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { User, Mail, Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { router } from "expo-router";

const SignUp = () => {
  const { signUpSchema } = useValidation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = (data: any) => {
    const { fullName, email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Proceed with signup logic (e.g., API call, navigation, etc.)
    Alert.alert("Success", `Welcome, ${fullName}!`);
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
                Sign Up
              </Text>

              <FormInput
                placeholder="Full Name"
                value={formData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
                IconComponent={User}
                control={control}
                name="fullName"
                error={errors.fullName?.message}
              />
              <FormInput
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                IconComponent={Mail}
                control={control}
                name="email"
                error={errors.email?.message}
              />
              <FormInput
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                IconComponent={Lock}
                control={control}
                name="password"
                error={errors.password?.message}
              />
              <FormInput
                placeholder="Confirm Password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                IconComponent={Lock}
                control={control}
                name="confirmPassword"
                error={errors.confirmPassword?.message}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleSubmit(handleSignUp)}
              >
                <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                  Sign Up
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-4 mb-6">
                <Text className="text-white font-pregular">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/SignIn")}>
                  <Text className="text-white font-pbold ml-2">Sign In</Text>
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

export default SignUp;

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
