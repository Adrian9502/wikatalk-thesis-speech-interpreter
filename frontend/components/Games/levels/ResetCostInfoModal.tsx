import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Info, Clock } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import costTiers from "@/utils/games/costTiers";
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
            colors={NAVIGATION_COLORS.indigo}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Info width={20} height={20} color={BASE_COLORS.white} />
              </View>
              <Text style={styles.title}>Reset Cost Information</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X width={20} height={20} color={BASE_COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Reset costs vary based on time spent to encourage efficient
              gameplay:
            </Text>

            {/* Cost Tiers */}
            <ScrollView style={styles.tiersContainer}>
              {costTiers.map((tier, index) => (
                <View key={index} style={styles.tierItem}>
                  <View style={styles.tierLeft}>
                    <Clock
                      width={16}
                      height={16}
                      color={iconColors.brightYellow}
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
    padding: 20,
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
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  coinImage: {
    width: 16,
    height: 16,
    alignSelf: "center",
  },
  title: {
    flex: 1,
    fontSize: 17,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
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
    marginBottom: 8,
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
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  tierDesc: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
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
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#FFC107",
    marginLeft: 4,
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});

export default ResetCostInfoModal;
