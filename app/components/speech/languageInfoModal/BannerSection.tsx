import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BannerSection as BannerSectionType } from "@/types/languageInfo";
import { BASE_COLORS } from "@/constants/colors";
import { FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface BannerSectionProps {
  data: BannerSectionType["data"];
}

const BannerSection: React.FC<BannerSectionProps> = ({ data }) => {
  return (
    <View style={styles.imageBanner}>
      <Image
        source={data.backgroundImage}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent"]}
        style={styles.imageOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.regionBadge}>
        <Text style={styles.regionText}>{data.region}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBanner: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  regionBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 111, 74, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  regionText: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    fontSize: FONT_SIZES.md,
  },
});

export default BannerSection;
