import React, { createContext, useContext, ReactNode } from "react";
import * as yup from "yup";

// Define form data types
export interface SignUpFormData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  usernameOrEmail: string; // Changed to match the form field
  password: string;
}

// Define the context type
interface ValidationContextType {
  signUpSchema: yup.ObjectSchema<SignUpFormData>;
  loginSchema: yup.ObjectSchema<LoginFormData>;
}

// Create the context
const ValidationContext = createContext<ValidationContextType | undefined>(
  undefined
);

// Regex patterns
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userNamePattern = /^[a-zA-Z0-9_]+$/;

// Validation schemas
const signUpSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

  userName: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .matches(
      userNamePattern,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: yup
    .string()
    .required("Email is required")
    .matches(emailPattern, "Please enter a valid email address"),

  password: yup
    .string()
    .required("Password is required")
    .matches(
      passwordPattern,
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const loginSchema = yup.object().shape({
  usernameOrEmail: yup
    .string()
    .required("Username or email is required")
    .test("isUsernameOrEmail", "Enter a valid username or email", (value) => {
      if (!value) return false;
      // Check if the value matches either email or username pattern
      return emailPattern.test(value) || userNamePattern.test(value);
    }),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

interface ValidationProviderProps {
  children: ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({
  children,
}) => {
  return (
    <ValidationContext.Provider
      value={{
        signUpSchema,
        loginSchema,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error("useValidation must be used within a ValidationProvider");
  }
  return context;
};
