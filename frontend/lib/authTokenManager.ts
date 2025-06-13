// Add or update this file for better token management
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

let currentToken: string | null = null;

export const setToken = (token: string | null) => {
  currentToken = token;

  // Update axios defaults when token changes
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token set in axios headers");
  } else {
    delete axios.defaults.headers.common["Authorization"];
    console.log("Token removed from axios headers");
  }
};

export const getToken = (): string | null => {
  return currentToken;
};

// Initialize token from storage on app start
export const initializeToken = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    if (token) {
      // Validate token format
      if (token.split(".").length !== 3) {
        console.error("Invalid token format in storage");
        await AsyncStorage.removeItem("userToken");
        setToken(null);
        return;
      }

      setToken(token);
      console.log("Token initialized from storage");
    }
  } catch (error) {
    console.error("Failed to initialize token:", error);
  }
};

// Check token validity
export const isTokenValid = (token: string): boolean => {
  // Simple format check (JWT has 3 parts separated by dots)
  return token && token.split(".").length === 3;
};
