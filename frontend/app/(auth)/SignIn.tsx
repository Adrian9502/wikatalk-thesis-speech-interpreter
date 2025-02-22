import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { User, Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import styles from "@/utils/AuthStyles";
// Define interfaces
export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

const SignIn: React.FC = () => {
  const { loginSchema } = useValidation();
  const [activeInput, setActiveInput] = useState("");
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData): Promise<void> => {
    await login(data.usernameOrEmail, data.password);
    // the redirect will be handled by the AuthContext
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
            <AuthLogo />
            {/* Form Section */}
            <View className="py-5 px-16 w-full gap-4 mt-6">
              <Text className="text-4xl mb-6 text-center font-pbold text-white">
                Sign In
              </Text>
              {/* Username or email */}
              <FormInput<LoginFormData>
                placeholder="Username or Email"
                value={watch("usernameOrEmail")}
                onChangeText={(text) => setValue("usernameOrEmail", text)}
                IconComponent={User}
                control={control}
                name="usernameOrEmail"
                error={errors.usernameOrEmail?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />
              {/* Password */}
              <FormInput<LoginFormData>
                placeholder="Password"
                secureTextEntry
                value={watch("password")}
                onChangeText={(text) => setValue("password", text)}
                IconComponent={Lock}
                control={control}
                name="password"
                error={errors.password?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />
              {/* // In your SignIn.tsx, add this after the password input */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/ForgotPassword")}
                className="self-end"
              >
                <Text className="text-white font-pregular">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              {/* Signin Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleSubmit(handleLogin)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
              {/* Register */}
              <View className="flex-row justify-center items-center mt-4 ">
                <Text className="text-white font-pregular">
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/SignUp")}>
                  <Text className="text-white font-pbold ml-2">Sign Up</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center items-center mt-2 mb-6">
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
