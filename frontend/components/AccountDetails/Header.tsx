import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import styles from "@/styles/accountDetailsStyles";

type HeaderProps = {
  title: string;
  onBackPress: () => void;
};
export const Header = ({ title, onBackPress }: HeaderProps) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
      <ChevronLeft width={30} height={30} color={BASE_COLORS.white} />
    </TouchableOpacity>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <View style={styles.placeholderView} />
  </View>
);
