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
import { Lock } from "lucide-react-native";
import { useValidation } from "@/context/ValidationContext";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import styles from "@/utils/AuthStyles";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { resetPasswordSchema } = useValidation();
  const [activeInput, setActiveInput] = useState("");
  const { resetPassword, isLoading } = useAuth();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    const result = await resetPassword(token, data.password);
    if (result.success) {
      router.replace("/SignIn");
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
                Reset Password
              </Text>

              <FormInput<ResetPasswordFormData>
                placeholder="New Password"
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

              <FormInput<ResetPasswordFormData>
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

              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white p-3 mt-5 rounded-xl"
                onPress={handleSubmit(handleResetPassword)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text className="text-emerald-500 font-pmedium text-lg uppercase text-center">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPassword;
