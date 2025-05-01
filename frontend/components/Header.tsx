import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import styles from "@/styles/accountDetailsStyles";
import { useNavigation } from "expo-router";

type HeaderProps = {
  title: string;
};
export const Header = ({ title }: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft width={30} height={30} color={BASE_COLORS.white} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.placeholderView} />
    </View>
  );
};
