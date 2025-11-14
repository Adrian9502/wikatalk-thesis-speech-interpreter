import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";

import styles from "@/styles/accountDetailsStyles";
import { useNavigation } from "expo-router";

type HeaderProps = {
  title: string;
  disableBack?: boolean;
  hideBack?: boolean;
  onBackPress?: () => void;
};

export const Header = ({
  title,
  disableBack = false,
  hideBack = false,
  onBackPress,
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (disableBack) return;

    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.headerContainer]}>
      {!hideBack ? (
        <TouchableOpacity
          style={[styles.backButton, disableBack && { opacity: 0.4 }]}
          onPress={handleBackPress}
          disabled={disableBack}
        >
          <ArrowLeft width={18} height={18} color={BASE_COLORS.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderView} />
      )}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.placeholderView} />
    </View>
  );
};
