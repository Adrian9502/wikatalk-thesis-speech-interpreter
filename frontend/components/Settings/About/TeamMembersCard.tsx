import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  ImageSourcePropType,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { SocialLink, SocialLinkType } from "@/types/teamMebersTypes";

// Define props interface for the component
interface TeamMemberCardProps {
  name: string;
  role: string;
  image?: ImageSourcePropType;
  bio?: string;
  socialLinks?: SocialLink[];
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  image,
  bio,
  socialLinks = [],
}) => {
  const handleOpenLink = (url: string): void => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showNotification("Cannot open URL. Link copied to clipboard instead!");
        copyToClipboard(url);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    showNotification("Link copied to clipboard!");
  };

  const showNotification = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Success", message);
    }
  };

  const renderSocialIcon = (type: SocialLinkType) => {
    switch (type) {
      case "facebook":
        return <Feather name="facebook" size={22} color="#3b5998" />;
      case "github":
        return <Feather name="github" size={22} color="#333" />;
      case "twitter":
        return <Feather name="twitter" size={22} color="#1DA1F2" />;
      case "linkedin":
        return <Feather name="linkedin" size={22} color="#0077B5" />;
      case "mail":
        return <Feather name="mail" size={22} color="#ce1126" />;
      case "instagram":
        return <Feather name="instagram" size={22} color="#E1306C" />;
      default:
        return <Feather name="link" size={22} color="#555" />;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {image ? (
          <Image source={image} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      {bio && <Text style={styles.bio}>{bio}</Text>}

      <View style={styles.socialLinksContainer}>
        {socialLinks.map((link, index) => (
          <View key={index} style={styles.linkItem}>
            <View style={styles.socialButtonContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleOpenLink(link.url)}
              >
                {renderSocialIcon(link.type)}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(link.url)}
              >
                <Feather
                  name="link"
                  size={12}
                  color={BASE_COLORS.placeholderText}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  bio: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  socialLinksContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  linkItem: {
    marginRight: 12,
    marginBottom: 8,
  },
  socialButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 2,
  },
  socialButton: {
    padding: 8,
    alignItems: "center",
  },
  copyButton: {
    padding: 6,
    marginLeft: 2,
    marginRight: 2,
  },
});

export default TeamMemberCard;
