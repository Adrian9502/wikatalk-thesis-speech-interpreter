// Add or update this file for better token management
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

let currentToken: string | null = null;

export const setToken = (token: string | null) => {
  // Log detailed token information for debugging
  console.log(
    "Setting token:",
    token ? `${token.substring(0, 10)}...` : "null"
  );

  currentToken = token;

  // Update axios defaults when token changes
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token set in axios headers");
  } else {
    // Don't clear the token during verification flow - modify this to use an
    // immediately invoked async function instead of direct AsyncStorage access
    (async () => {
      try {
        const tempData = await AsyncStorage.getItem("tempUserData");
        // Use proper boolean check with the string result
        const inVerificationFlow = tempData !== null;

        if (inVerificationFlow) {
          // We're in verification flow - don't clear the token
          console.log("Prevented token removal during verification flow");
          return;
        }

        // Otherwise proceed with token removal
        delete axios.defaults.headers.common["Authorization"];
        console.log("Token removed from axios headers");
      } catch (err) {
        // If we can't check, proceed with normal token removal
        delete axios.defaults.headers.common["Authorization"];
        console.log("Token removed from axios headers (error path)");
      }
    })();
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
    } else {
      // If no token in storage, check temp token for verification flow
      const tempData = await AsyncStorage.getItem("tempUserData");
      if (tempData) {
        try {
          const parsedData = JSON.parse(tempData);
          if (parsedData.tempToken) {
            console.log("Using tempToken for verification flow");
            setToken(parsedData.tempToken);
          }
        } catch (e) {
          console.error("Error parsing temp user data:", e);
        }
      }
    }
  } catch (error) {
    console.error("Failed to initialize token:", error);
  }
};

// Check token validity
export const isTokenValid = (token: string): boolean => {
  // Simple format check (JWT has 3 parts separated by dots)
  if (!token) return false;
  return token.split(".").length === 3;
};
