import { useForm, Control, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define Login form values
interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

// Define Sign-Up form values
interface SignUpFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Define the return type for the hook
interface AuthForms {
  signIn: {
    control: Control<LoginFormValues>;
    errors: FieldErrors<LoginFormValues>;
    handleSubmit: ReturnType<typeof useForm<LoginFormValues>>["handleSubmit"];
    reset: ReturnType<typeof useForm<LoginFormValues>>["reset"];
  };
  signUp: {
    control: Control<SignUpFormValues>;
    errors: FieldErrors<SignUpFormValues>;
    handleSubmit: ReturnType<typeof useForm<SignUpFormValues>>["handleSubmit"];
    reset: ReturnType<typeof useForm<SignUpFormValues>>["reset"];
  };
}

// Hook with TypeScript support
export const useAuthForms = (
  signInSchema: yup.ObjectSchema<LoginFormValues>,
  signUpSchema: yup.ObjectSchema<SignUpFormValues>
): AuthForms => {
  // Sign in form
  const {
    control: signInControl,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
    reset: resetSignInForm,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(signInSchema),
  });

  // Sign up form
  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
    reset: resetSignUpForm,
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
  });

  return {
    signIn: {
      control: signInControl,
      errors: signInErrors,
      handleSubmit: handleSignInSubmit,
      reset: resetSignInForm,
    },
    signUp: {
      control: signUpControl,
      errors: signUpErrors,
      handleSubmit: handleSignUpSubmit,
      reset: resetSignUpForm,
    },
  };
};
