import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { COLORS } from "../../../colors";
 
interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
}
 
const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Terms and Conditions for Karomanage Software
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
 
          {/* Scrollable Content */}
          <ScrollView style={styles.scrollContent}>
            {/* 1. SMS Service */}
            <Text style={styles.sectionTitle}>1. SMS Service</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • Karomanage provides free SMS messages worth 10 rupees for
                marketing purposes as part of its service.
              </Text>
              <Text style={styles.bulletText}>
                • Once the free SMS credits are exhausted, users must recharge
                their SMS wallet to send additional SMS messages.
              </Text>
              <Text style={styles.bulletText}>
                • SMS charges and recharge packages are subject to change, and
                users will be notified of any updates.
              </Text>
            </View>
 
            {/* 2. WhatsApp Message Service */}
            <Text style={styles.sectionTitle}>2. WhatsApp Message Service</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • No free WhatsApp messages are included in the Karomanage
                services.
              </Text>
              <Text style={styles.bulletText}>
                • Users must purchase WhatsApp message credits through recharge
                or payment options available in the platform to use this
                feature.
              </Text>
              <Text style={styles.bulletText}>
                • Pricing for WhatsApp messages will be displayed clearly during
                the recharge process and is subject to revision.
              </Text>
            </View>
 
            {/* 3. Email Marketing Service */}
            <Text style={styles.sectionTitle}>3. Email Marketing Service</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • Regular emails and email notifications sent by Karomanage,
                such as overdue reminders, upcoming fee notifications, and
                fee-paid confirmations, are provided free of cost as part of the
                service.
              </Text>
              <Text style={styles.bulletText}>
                • Users wishing to create custom email templates and send them
                for marketing or other purposes must recharge their email
                wallet.
              </Text>
              <Text style={styles.bulletText}>
                • Email recharge packages and their pricing will be clearly
                displayed in the platform and are subject to change.
              </Text>
            </View>
 
            {/* 4. Wallet Recharge */}
            <Text style={styles.sectionTitle}>4. Wallet Recharge</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • All wallet recharges are final and non-refundable, except in
                cases of technical errors or unauthorized transactions.
              </Text>
              <Text style={styles.bulletText}>
                • Users can view their wallet balance and transaction history in
                the Karomanage platform.
              </Text>
              <Text style={styles.bulletText}>
                • Wallet credits can only be used for SMS, WhatsApp, and email
                services within the Karomanage platform.
              </Text>
            </View>
 
            {/* 6. Limitation of Liability */}
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • Karomanage is not liable for delivery failures caused by
                incorrect email addresses, network issues, or third-party
                services.
              </Text>
              <Text style={styles.bulletText}>
                • Karomanage does not guarantee 100% delivery of SMS, WhatsApp,
                or email messages.
              </Text>
            </View>
 
            {/* 7. LMS Module Charges */}
            <Text style={styles.sectionTitle}>7. LMS Module Charges</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletText}>
                • Karomanage does not charge any additional fees for course
                management.
              </Text>
              <Text style={styles.bulletText}>
                • However, a 3% fee will be charged on each course purchase. No
                other charges will apply to other services.
              </Text>
            </View>
 
            {/* Footer Text */}
            <Text style={styles.footerText}>
              By using Karomanage services, you agree to these terms and
              conditions. For any queries or support, please contact our
              customer support team.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
 
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    paddingRight: 8,
  },
  closeButton: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  bulletList: {
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 20,
  },
});
 
export default TermsAndConditionsModal;
 