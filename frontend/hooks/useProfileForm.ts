// This file is used in Edit Profile Modal
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { Platform, StatusBar } from "react-native";

// Form type definition
type ProfileFormType = {
  fullName: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

// Create validation schema
const createFormSchema = (changePasswordEnabled: boolean) => {
  return yup.object({
    fullName: yup.string().required("Full name is required"),
    username: yup.string().required("Username is required"),
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
          .min(6, "Password must be at least 6 characters"),
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
      resolver: yupResolver(createFormSchema(changePassword)),
      context: { changePassword },
    });

  // Monitor form values
  const formValues = {
    fullName: watch("fullName"),
    username: watch("username"),
    currentPassword: watch("currentPassword"),
    newPassword: watch("newPassword"),
    confirmPassword: watch("confirmPassword"),
  };

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

  const togglePasswordChange = () => {
    setChangePassword(!changePassword);
    if (!changePassword) {
      setPasswordError("");
    }
  };

  const validateForm = () => {
    // Reset errors
    setError("");
    setPasswordError("");

    // Check for empty required fields
    if (!formValues.fullName.trim() || !formValues.username.trim()) {
      setError("Full name and username cannot be empty");
      return false;
    }

    // Check if anything has changed
    const basicInfoChanged =
      formValues.fullName.trim() !== userData?.fullName?.trim() ||
      formValues.username.trim() !== userData?.username?.trim() ||
      imageChanged;

    // If nothing has changed
    if (!changePassword && !basicInfoChanged) {
      setError(
        "Looks like nothing was changed. Please update your details to save."
      );
      return false;
    }

    return true;
  };

  const handleSelectImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access camera roll is required!");
        return;
      }

      // Use improved settings for smaller image size
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Reduced quality for smaller size
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Convert to base64 with size limit check
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        // Check approximate size (base64 is ~33% larger than actual file)
        const approximateSize = (base64Image.length * 0.75) / (1024 * 1024);

        if (approximateSize > 10) {
          // If larger than 10MB
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
  };

  const onFormSubmit = async (data: ProfileFormType) => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const updateData: any = {
        fullName: data.fullName,
        username: data.username,
      };

      // Only include profile picture if it was changed
      if (imageChanged && profilePicture) {
        updateData.profilePicture = profilePicture;
      }

      // Include password fields if changing password
      if (changePassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      // Try to save the profile
      await onSave(updateData);
    } catch (err) {
      // Handle errors - check if it's a password error
      const errorMsg = err instanceof Error ? err.message : "Unknown error";

      if (changePassword && errorMsg.toLowerCase().includes("password")) {
        // Show password error in the password section
        setPasswordError(errorMsg);
        console.log("Password error:", errorMsg);
      } else {
        // Show general error
        setError(errorMsg);
        console.log("General error:", errorMsg);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
