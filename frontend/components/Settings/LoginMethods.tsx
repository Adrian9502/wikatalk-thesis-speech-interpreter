import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BASE_COLORS } from "@/constant/colors";
import { UserData } from "@/store/useAuthStore";

interface LoginMethodsProps {
  userData: UserData;
}

const LoginMethods: React.FC<LoginMethodsProps> = ({ userData }) => {
  const getAvailableMethods = (authProvider: string) => {
    switch (authProvider) {
      case "manual":
        return ["Username/Email & Password"];
      case "google":
        return ["Google Account"];
      case "both":
        return ["Username/Email & Password", "Google Account"];
      default:
        return ["Username/Email & Password"];
    }
  };

  // Get the actual login method used in current session
  const getCurrentSessionLoginMethod = () => {
    const loginMethod = userData.currentLoginMethod || "manual";

    if (loginMethod === "google") {
      return { method: "Google", icon: "logo-google" };
    } else {
      return { method: "Username/Email & Password", icon: "mail" };
    }
  };

  const currentLogin = getCurrentSessionLoginMethod();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Login Methods</Text>
      <View style={styles.card}>
        <View style={styles.accountLinkingContainer}>
          {/* Available Login Methods Section */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionSubtitle}>Available Login Methods</Text>
            {getAvailableMethods(userData.authProvider || "manual").map(
              (method, index) => (
                <View key={index} style={styles.methodItem}>
                  <Ionicons
                    name={method === "Google Account" ? "logo-google" : "mail"}
                    size={16}
                    color={
                      method === "Google Account" ? "#DB4437" : BASE_COLORS.blue
                    }
                  />
                  <Text style={styles.methodText}>
                    {method === "Google Account"
                      ? "Google Account"
                      : "Username/Email & Password"}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Current Session Login Method */}
          <View style={styles.currentLoginSection}>
            <Text style={styles.sectionSubtitle}>
              You're now logged in using
            </Text>
            <View style={styles.currentMethodContainer}>
              <View style={styles.currentMethodItem}>
                <Ionicons
                  name={currentLogin.icon}
                  size={16}
                  color={
                    currentLogin.method === "Google"
                      ? "#DB4437"
                      : BASE_COLORS.blue
                  }
                />
                <Text style={styles.currentMethodText}>
                  {currentLogin.method}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 5,
  },
  card: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  accountLinkingContainer: {
    padding: 16,
  },
  methodsSection: {
    marginBottom: 20,
  },
  currentLoginSection: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#666",
    marginBottom: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(59, 111, 229, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  methodText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#333",
    marginLeft: 12,
  },
  currentMethodContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.success,
  },
  currentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  currentMethodText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#333",
    marginLeft: 12,
  },
});

export default LoginMethods;
