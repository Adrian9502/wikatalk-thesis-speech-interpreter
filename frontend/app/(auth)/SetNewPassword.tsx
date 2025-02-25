import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Mail } from "lucide-react-native";
import styles from "@/utils/AuthStyles";
import { StatusBar } from "expo-status-bar";
import FormInput from "@/components/FormInput";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AuthLogo from "@/components/AuthLogo";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useValidation } from "@/context/ValidationContext";
import { Lock } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const SetNewPassword: React.FC = () => {
  const { resetPassword, isLoading, showSnackbar } = useAuth();
  const { resetPasswordSchema } = useValidation();
  const [activeInput, setActiveInput] = useState<string>("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  // Load reset token
  useEffect(() => {
    const loadResetToken = async () => {
      try {
        console.log("Loading reset token from storage");
        const token = await AsyncStorage.getItem("resetToken");
        console.log("Token loaded:", !!token);

        if (!token) {
          console.log("No token found in storage");
          showSnackbar("Reset session expired. Please try again.", "error");
          router.replace("/(auth)/ResetPassword");
          return;
        }

        setResetToken(token);
      } catch (error) {
        console.error("Failed to load reset token:", error);
        router.replace("/(auth)/ResetPassword");
      }
    };

    loadResetToken();
  }, []);

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("resetEmailAddress");
      setEmail(storedEmail); // Set email in state
    };

    fetchEmail();
  }, []);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    console.log("Starting reset password process");
    console.log("Token available:", !!resetToken);

    if (!resetToken) {
      showSnackbar("Reset session expired. Please try again.", "error");
      router.replace("/(auth)/ResetPassword");
      return;
    }

    try {
      console.log("Sending reset request with token");
      const result = await resetPassword(resetToken, data.password);
      console.log("Reset result:", result);

      if (result.success) {
        console.log("Reset successful, clearing storage");
        // Storage clearing is now handled in the resetPassword function
      }
    } catch (error) {
      console.error("Reset error in component:", error);
      showSnackbar("Failed to reset password. Please try again.", "error");
    }
  };

  if (!resetToken) {
    return (
      <SafeAreaView className="bg-emerald-500 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="min-h-screen bg-emerald-500 flex-1">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center px-8">
            <AuthLogo />
            <View className="py-5 px-8 w-full gap-4 mt-2">
              <Text className="text-3xl mb-2 text-center font-pbold text-white">
                Set New Password
              </Text>
              <Text className="text-white text-center font-pregular mb-4">
                Create a new password for your account
              </Text>

              <View style={styles.container}>
                <View
                  className="flex-row items-center"
                  style={{
                    borderBottomWidth: 1,
                    paddingBottom: 6,
                    borderColor: "white",
                    marginBottom: 6,
                  }}
                >
                  {/* Email Icon */}
                  <Mail size={21} color="white" style={{ marginRight: 8 }} />

                  {/* Uneditable Email Text */}
                  <Text className="flex-1 text-white font-pregular text-lg">
                    {email ?? "Loading..."}
                  </Text>
                </View>
              </View>

              <FormInput<ResetPasswordFormData>
                placeholder="New Password"
                value={watch("password")}
                onChangeText={(text) => setValue("password", text)}
                IconComponent={Lock}
                secureTextEntry
                control={control}
                name="password"
                error={errors.password?.message}
                activeInput={activeInput}
                setActiveInput={setActiveInput}
              />

              <FormInput<ResetPasswordFormData>
                placeholder="Confirm New Password"
                value={watch("confirmPassword")}
                onChangeText={(text) => setValue("confirmPassword", text)}
                IconComponent={Lock}
                secureTextEntry
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetNewPassword;
