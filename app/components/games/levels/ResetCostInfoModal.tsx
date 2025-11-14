import React from "react";
import { Modal, View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, ICON_COLORS } from "@/constants/colors";
import { NAVIGATION_COLORS } from "@/constants/colors";
import costTiers from "@/utils/games/costTiers";
import CloseButton from "../buttons/CloseButton";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
interface ResetCostInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const ResetCostInfoModal: React.FC<ResetCostInfoModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={NAVIGATION_COLORS.blue}
            style={styles.modalContent}
          >
            <CloseButton size={14} onPress={onClose}></CloseButton>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset Cost Information</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Reset costs vary based on time spent to encourage efficient
              gameplay:
            </Text>

            {/* Cost Tiers */}
            <ScrollView
              bounces={false}
              overScrollMode="never"
              showsVerticalScrollIndicator={false}
              style={styles.tiersContainer}
            >
              {costTiers.map((tier, index) => (
                <View key={index} style={styles.tierItem}>
                  <View style={styles.tierLeft}>
                    <Clock
                      width={15}
                      height={15}
                      color={ICON_COLORS.brightYellow}
                    />
                    <View style={styles.tierInfo}>
                      <Text style={styles.tierTime}>{tier.timeRange}</Text>
                      <Text style={styles.tierDesc}>{tier.description}</Text>
                    </View>
                  </View>
                  <View style={styles.tierCost}>
                    <Image
                      source={require("@/assets/images/coin.png")}
                      style={styles.coinImage}
                    />
                    <Text style={styles.costText}>{tier.cost}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💡 Tip: Complete levels quickly to get lower reset costs!
              </Text>
            </View>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  coinImage: {
    width: 15,
    height: 15,
    alignSelf: "center",
  },
  title: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  description: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  tiersContainer: {
    maxHeight: 240,
    marginBottom: 16,
  },
  tierItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  tierLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tierInfo: {
    marginLeft: 10,
    flex: 1,
  },
  tierTime: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  tierDesc: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
  },
  tierCost: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  costText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: ICON_COLORS.brightYellow,
    marginLeft: 6,
    marginTop: 2,
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
  },
  footerText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});

export default ResetCostInfoModal;
