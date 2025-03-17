import React from "react";
import { Text, StyleSheet } from "react-native";
import { User, Lock, Mail } from "lucide-react-native";
import { BASE_COLORS } from "@/constant/colors";
import FormInput from "@/components/FormInput";

interface SignUpFormProps {
  control: any;
  errors: Record<string, any>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ control, errors }) => {
  return (
    <>
      {/* full name */}
      <FormInput
        control={control}
        name="fullName"
        placeholder="Full Name"
        IconComponent={User}
        error={errors.fullName?.message}
        autoCapitalize="words"
      />

      {/* username */}
      <FormInput
        control={control}
        name="username"
        placeholder="Username"
        IconComponent={User}
        error={errors.username?.message}
      />

      {/* Provide a valid email text */}
      <Text style={[styles.helpText, { color: BASE_COLORS.placeholderText }]}>
        Provide a{" "}
        <Text style={[styles.helpTextBold, { color: BASE_COLORS.blue }]}>
          valid email
        </Text>{" "}
        to receive a 6-digit code. Check spam/junk if not received.
      </Text>

      {/* email address */}
      <FormInput
        control={control}
        name="email"
        placeholder="Email"
        keyboardType="email-address"
        IconComponent={Mail}
        error={errors.email?.message}
        autoCapitalize="none"
      />

      {/* password */}
      <FormInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        IconComponent={Lock}
        error={errors.password?.message}
      />

      {/* confirm password */}
      <FormInput
        control={control}
        name="confirmPassword"
        placeholder="Confirm Password"
        secureTextEntry
        IconComponent={Lock}
        error={errors.confirmPassword?.message}
      />
    </>
  );
};

const styles = StyleSheet.create({
  helpText: {
    padding: 4,
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
    fontSize: 13,
  },
  helpTextBold: {
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },
});

export default SignUpForm;
