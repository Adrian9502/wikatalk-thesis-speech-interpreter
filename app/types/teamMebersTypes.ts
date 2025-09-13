import { ImageSourcePropType } from "react-native";

// Define the type for social media links
export type SocialLinkType =
  | "facebook"
  | "github"
  | "twitter"
  | "mail"
  | "linkedin"
  | "instagram"
  | "other";
export interface SocialLink {
  type: SocialLinkType;
  url: string;
}
// Define the team member interface
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: ImageSourcePropType;
  socialLinks: SocialLink[];
}
