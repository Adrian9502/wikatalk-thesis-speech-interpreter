import React, { useState } from "react";
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
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "@/components/FormInput";
import { Mail } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import styles from "@/utils/AuthStyles";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { forgotPasswordSchema } = useValidation();
  const [activeInput, setActiveInput] = useState("");
  const { forgotPassword, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      router.push("/CheckEmail");
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
            <AuthLogo />
            <View className="py-5 px-16 w-full gap-4 mt-6">
              <Text className="text-4xl mb-6 text-center font-pbold text-white">
                Forgot Password
              </Text>
              <Text className="text-white text-center mb-4 font-pregular">
                Enter your email address and we'll send you a link to reset your
                password
              </Text>

              <FormInput<ForgotPasswordFormData>
                placeholder="Email"
                value={watch("email")}
                onChangeText={(text) => setValue("email", text)}
                IconComponent={Mail}
                control={control}
                name="email"
                error={errors.email?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleSubmit(handleForgotPassword)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-4">
                <TouchableOpacity onPress={() => router.push("/SignIn")}>
                  <Text className="text-white font-pbold">Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
