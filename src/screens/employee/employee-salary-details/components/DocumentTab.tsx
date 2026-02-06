import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { COLORS } from "../../../../colors";
import { useEmployeeDetailsQuery } from "../../../../apis/hooks/employee/query/useEmployeeDetails.query";
 
const Heights = {
  cardHeight: Dimensions.get("window").height * 0.62,
};
 
const DocumentTab = ({ employeeId }: { employeeId: string }) => {
  const { data, isLoading } = useEmployeeDetailsQuery(employeeId);
 
  const professionalDetails =
    data?.statuscode === 200 ? data.data.employeeProfessionalDetails : null;
 
  const aadharImage = professionalDetails?.employeeAadharCard;
  const panImage = professionalDetails?.employeePanCard;
 
  if (isLoading) {
    return (
      <View style={{ marginTop: 15, padding: 20 }}>
        <Text>Loading documents...</Text>
      </View>
    );
  }
 
  return (
    <View style={{ marginTop: 15 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Documents</Text>
 
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ===== AADHAR CARD ===== */}
          <View style={styles.docBlock}>
            <Text style={styles.docTitle}>Aadhar Card</Text>
 
            <View style={styles.placeholderBox}>
              {aadharImage ? (
                <Image
                  source={{ uri: aadharImage }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>
                  No Aadhar Card photo uploaded
                </Text>
              )}
            </View>
          </View>
 
          {/* ===== PAN CARD ===== */}
          <View style={styles.docBlock}>
            <Text style={styles.docTitle}>Pan Card</Text>
 
            <View style={styles.placeholderBox}>
              {panImage ? (
                <Image
                  source={{ uri: panImage }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>
                  No Pan Card photo uploaded
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
 
export default DocumentTab;
 
/* ================= STYLES ================= */
 
const styles = StyleSheet.create({
  card: {
    width: "108%",
    height: Heights.cardHeight,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 6,
    paddingTop: 18,
    paddingHorizontal: 25,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    alignSelf: "center",
  },
 
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#000",
  },
 
  docBlock: {
    marginBottom: 30,
  },
 
  docTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
 
  placeholderBox: {
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
 
  placeholderText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
 
  image: {
    width: "100%",
    height: "100%",
  },
});
 
 