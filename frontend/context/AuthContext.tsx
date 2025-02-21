import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { router } from "expo-router";
import CustomSnackbar from "@/lib/CustomSnackbar";

// get the api url from the .env file
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

// Type definitions
interface UserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  isLoading: boolean;
  isAppReady: boolean;
  userToken: string | null;
  userData: UserData | null;
  showSnackbar: (
    message: string,
    type?: "success" | "error" | "neutral"
  ) => void;
  error: string | null;
  register: (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<AuthResponse>;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<UserData | undefined>;
  isLoggedIn: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}
// interface for api connection testing
interface ApiResponse {
  message?: string;
  data?: unknown;
}

interface ApiError {
  message: string;
  config?: {
    url?: string;
    method?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "neutral"
  >("neutral");
  const [isAppReady, setIsAppReady] = useState(false);

  // Test API connection on startup
  // if this fails and you are using the expo go app,
  // you may need to update the .env to replace EXPO_PUBLIC_BACKEND_URL
  // to your PC/Laptop IPv4 address so that the app can connect to the backend

  // Heres my set up :
  // EXPO_PUBLIC_BACKEND_URL=http://192.168.18.82:5000
  // This is my IPv4 address, you can find yours by running ipconfig in cmd
  // and replace "192.168.18.82" with your IPv4 address
  useEffect(() => {
    const testAPI = async (): Promise<void> => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/`
        );
        console.log("API test successful:", response.data);
      } catch (error) {
        const apiError = error as ApiError;
        console.error("API test failed:", apiError.message);
        console.error("Request URL:", apiError.config?.url);
        console.error("Request method:", apiError.config?.method);
      }
    };

    testAPI();
  }, []);

  // Load token and user data from storage on startup
  useEffect(() => {
    const loadStorageData = async (): Promise<void> => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserData = await AsyncStorage.getItem("userData");

        if (storedToken && storedUserData) {
          setUserToken(storedToken);
          setUserData(JSON.parse(storedUserData));
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error loading auth info from storage:", error);
      } finally {
        setIsLoading(false);
        setIsAppReady(true); // Mark the app as ready
      }
    };

    loadStorageData();
  }, []);

  // Snackbar helper function to show popup messages
  const showSnackbar = (
    message: string,
    type: "success" | "error" | "neutral" = "neutral"
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Register user
  const register = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        showSnackbar(
          "Registration successful! Redirecting to Sign In..",
          "success"
        );

        setTimeout(() => {
          router.replace("/(auth)/SignIn");
        }, 2000);

        return { success: true };
      } else {
        setError(response.data.message);
        showSnackbar(response.data.message || "Registration error!", "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      showSnackbar(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        usernameOrEmail,
        password,
      });

      if (response.data.success) {
        const { token, ...user } = response.data.data;
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        setUserToken(token);
        setUserData(user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        showSnackbar("Login successful!", "success");
        return { success: true };
      } else {
        setError(response.data.message);
        showSnackbar(response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      showSnackbar(message, "error");
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      setUserToken(null);
      setUserData(null);
      delete axios.defaults.headers.common["Authorization"];

      showSnackbar("Logged out successfully!", "success");
      // automatically redirect to sign in
    } catch (error) {
      console.error("Error during logout:", error);
      showSnackbar("Error logging out", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async (): Promise<UserData | undefined> => {
    try {
      const response = await axios.get(`${API_URL}/profile`);

      if (response.data.success) {
        setUserData(response.data.data);
        return response.data.data;
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        showSnackbar("Session expired. Please login again.", "error");
        logout();
      }
    }
    return undefined;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAppReady,
        userToken,
        userData,
        error,
        register,
        login,
        logout,
        getUserProfile,
        isLoggedIn: !!userToken,
        showSnackbar,
      }}
    >
      {children}
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        type={snackbarType}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
