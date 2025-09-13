// This file is used in Edit Profile Modal
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { Platform, StatusBar } from "react-native";
import { debounce } from "lodash";
import { useAuthStore } from "@/store/useAuthStore";
import { passwordPattern, userNamePattern } from "@/context/ValidationContext";

// Form type definition
type ProfileFormType = {
  fullName: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

// Create validation schema - memoize it
const createFormSchema = (changePasswordEnabled: boolean) => {
  return yup.object({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
    username: yup
      .string()
      .required("Username is required")
      .matches(
        userNamePattern,
        "Username can only contain letters, numbers, and underscores"
      ),
    currentPassword: yup.string().when([], {
      is: () => changePasswordEnabled,
      then: (schema) => schema.required("Current password is required"),
      otherwise: (schema) => schema.optional(),
    }),
    newPassword: yup.string().when([], {
      is: () => changePasswordEnabled,
      then: (schema) =>
        schema
          .required("New password is required")
          .matches(
            passwordPattern,
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
          ),
      otherwise: (schema) => schema.optional(),
    }),
    confirmPassword: yup.string().when([], {
      is: () => changePasswordEnabled,
      then: (schema) =>
        schema
          .required("Please confirm your password")
          .oneOf([yup.ref("newPassword")], "Passwords must match"),
      otherwise: (schema) => schema.optional(),
    }),
  });
};

export const useProfileForm = ({ userData, visible, onSave }: any) => {
  // State management
  const [profilePicture, setProfilePicture] = useState<string | null>(
    userData?.profilePicture || null
  );
  const [changePassword, setChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageChanged, setImageChanged] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Get validateCurrentPassword from auth store
  const validateCurrentPassword = useAuthStore(
    (state) => state.validateCurrentPassword
  );

  // Memoize the debounced validator to prevent recreation
  const debouncedPasswordValidator = useMemo(
    () =>
      debounce(async (password: string) => {
        if (!password || password.length < 6) return;

        setIsValidating(true);
        try {
          const result = await validateCurrentPassword(password);
          setIsPasswordValid(result.success);
        } catch (error) {
          setIsPasswordValid(false);
          console.log("Password validation error:", error);
        } finally {
          setIsValidating(false);
        }
      }, 800),
    [validateCurrentPassword]
  );

  // Memoize the form schema
  const formSchema = useMemo(
    () => createFormSchema(changePassword),
    [changePassword]
  );

  // Initialize form
  const { control, handleSubmit, reset, formState, watch } =
    useForm<ProfileFormType>({
      defaultValues: {
        fullName: userData?.fullName || "",
        username: userData?.username || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      resolver: yupResolver(formSchema),
      context: { changePassword },
    });

  // Memoize watched values to prevent unnecessary re-renders
  const formValues = useMemo(
    () => ({
      fullName: watch("fullName"),
      username: watch("username"),
      currentPassword: watch("currentPassword"),
      newPassword: watch("newPassword"),
      confirmPassword: watch("confirmPassword"),
    }),
    [watch]
  );

  // Memoized callbacks
  const togglePasswordChange = useCallback(() => {
    setChangePassword(!changePassword);
    if (!changePassword) {
      setPasswordError("");
    }
  }, [changePassword]);

  const validateForm = useCallback(() => {
    setError("");
    setPasswordError("");

    if (!formValues.fullName.trim() || !formValues.username.trim()) {
      setError("Full name and username cannot be empty");
      return false;
    }

    const basicInfoChanged =
      formValues.fullName.trim() !== userData?.fullName?.trim() ||
      formValues.username.trim() !== userData?.username?.trim() ||
      imageChanged;

    if (!changePassword && !basicInfoChanged) {
      setError(
        "Looks like nothing was changed. Please update your details to save."
      );
      return false;
    }

    return true;
  }, [formValues, userData, imageChanged, changePassword]);

  const handleSelectImage = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const approximateSize = (base64Image.length * 0.75) / (1024 * 1024);

        if (approximateSize > 10) {
          setError(
            `Image too large (${approximateSize.toFixed(
              1
            )}MB). Please choose a smaller image.`
          );
          return;
        }

        setProfilePicture(base64Image);
        setImageChanged(true);
      }
    } catch (err) {
      console.error("Error selecting image:", err);
      setError("Failed to select image. Please try again.");
    }
  }, []);

  const onFormSubmit = useCallback(
    async (data: ProfileFormType) => {
      if (!validateForm()) return;

      try {
        setIsLoading(true);
        const updateData: any = {
          fullName: data.fullName,
          username: data.username,
        };

        if (imageChanged && profilePicture) {
          updateData.profilePicture = profilePicture;
        }

        if (changePassword) {
          updateData.currentPassword = data.currentPassword;
          updateData.newPassword = data.newPassword;
        }

        await onSave(updateData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";

        if (changePassword && errorMsg.toLowerCase().includes("password")) {
          setPasswordError(errorMsg);
        } else {
          setError(errorMsg);
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, onSave, imageChanged, profilePicture, changePassword]
  );

  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      reset({
        fullName: userData?.fullName || "",
        username: userData?.username || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfilePicture(userData?.profilePicture || null);
      setChangePassword(false);
      setImageChanged(false);
      setError("");
      setPasswordError("");
    }
  }, [visible, userData, reset]);

  // Handle status bar appearance
  useEffect(() => {
    const setStatusBar = (style: "default" | "light-content") => {
      StatusBar.setBarStyle(style);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent");
      }
    };

    if (visible) setStatusBar("light-content");
    return () => setStatusBar("default");
  }, [visible]);

  // Watch the current password field
  const currentPassword = watch("currentPassword");

  // Effect to validate password when it changes
  useEffect(() => {
    if (changePassword && currentPassword) {
      debouncedPasswordValidator(currentPassword);
    } else {
      setIsPasswordValid(null);
    }
  }, [currentPassword, changePassword, debouncedPasswordValidator]);

  // Reset validation state when modal visibility changes
  useEffect(() => {
    if (!visible) {
      setIsPasswordValid(null);
    }
  }, [visible]);

  // Memoize return values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      control,
      handleSubmit,
      formState,
      profileValues: formValues,
      imageState: { profilePicture, imageChanged },
      passwordState: { changePassword, passwordError },
      errorState: { error },
      isLoading,
      handleSelectImage,
      onFormSubmit,
      togglePasswordChange,
      passwordValidation: {
        isPasswordValid,
        isValidating,
      },
    }),
    [
      control,
      handleSubmit,
      formState,
      formValues,
      profilePicture,
      imageChanged,
      changePassword,
      passwordError,
      error,
      isLoading,
      handleSelectImage,
      onFormSubmit,
      togglePasswordChange,
      isPasswordValid,
      isValidating,
    ]
  );
};
