import {
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
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
import { User, Mail, Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import styles from "@/utils/AuthStyles";
// Define interfaces
interface SignUpFormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const { signUpSchema } = useValidation();
  const [activeInput, setActiveInput] = useState("");
  const { register, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
  });

  const handleSignUp = async (data: SignUpFormData): Promise<void> => {
    const { fullName, username, email, password, confirmPassword } = data;

    const result = await register(
      fullName,
      username,
      email,
      password,
      confirmPassword
    );

    if (result.success) {
      // Use setTimeout to ensure state updates are complete
      setTimeout(() => {
        router.push("/(auth)/VerifyEmail");
      }, 200);
    }
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
              <Text className="text-4xl -mb-4 text-center font-pbold text-white">
                Sign Up
              </Text>

              {/* Full name */}
              <FormInput
                placeholder="Full Name"
                value={watch("fullName")}
                onChangeText={(text) => setValue("fullName", text)}
                IconComponent={User}
                control={control}
                name="fullName"
                error={errors.fullName?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              {/* Username */}
              <FormInput
                placeholder="Username"
                value={watch("username")}
                onChangeText={(text) => setValue("username", text)}
                IconComponent={User}
                control={control}
                name="username"
                error={errors.username?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              <Text className="text-emerald-500 p-2 font-pmedium bg-white border rounded-lg border-emerald-500 text-sm">
                Note: Enter a{" "}
                <Text className="font-psemibold text-emerald-500">
                  valid email
                </Text>{" "}
                to receive a 6-digit verification code. Check spam/junk if you
                don’t see it.
              </Text>
              {/* Email */}
              <FormInput
                placeholder="Email"
                value={watch("email")}
                onChangeText={(text) => setValue("email", text)}
                keyboardType="email-address"
                IconComponent={Mail}
                control={control}
                name="email"
                error={errors.email?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              {/* Password */}
              <FormInput
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

              {/* Confirm password */}
              <FormInput
                placeholder="Confirm Password"
                secureTextEntry
                value={watch("confirmPassword")}
                onChangeText={(text) => setValue("confirmPassword", text)}
                IconComponent={Lock}
                control={control}
                name="confirmPassword"
                error={errors.confirmPassword?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              {/* Sign up button */}
              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-2 rounded-xl"
                onPress={handleSubmit(handleSignUp)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sign in and Home link */}
              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-white font-pregular">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/SignIn")}>
                  <Text className="text-white font-pbold ml-2">Sign In</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center items-center ">
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
