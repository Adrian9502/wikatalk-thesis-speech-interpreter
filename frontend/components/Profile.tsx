import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Edit } from "lucide-react-native";

// Define interface for user data
interface UserData {
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const { userData, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  (userData as UserData).profilePicture ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton}>
              <Edit size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {(userData as UserData).fullName}
          </Text>
          <Text style={styles.username}>
            @{(userData as UserData).username}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <User size={20} color="#10B981" />
            <Text style={styles.infoText}>
              {(userData as UserData).fullName}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Mail size={20} color="#10B981" />
            <Text style={styles.infoText}>{(userData as UserData).email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#10B981",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#10B981",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    fontSize: 16,
    color: "#f0f0f0",
    marginTop: 5,
  },
  infoContainer: {
    padding: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff4757",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
