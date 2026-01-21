import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../../../colors";
import { useEmployeeDetailsQuery } from "../../../../apis/hooks/employee/query/useEmployeeDetails.query";
 
const Heights = {
  cardHeight: Dimensions.get("window").height * 0.62,
};
 
const BankDetailTab = ({ employeeId }: { employeeId: string }) => {
  const { data, isLoading } = useEmployeeDetailsQuery(employeeId);
 
  const bankDetails =
    data?.statuscode === 200 ? data?.data?.employeeBankDetails : null;
 
  const bankName = bankDetails?.employeeBankName || "-";
  const accountNumber = bankDetails?.employeeAccountNo || "-";
 
  // ✅ FIX HERE
  const ifscCode = bankDetails?.employeeIfsceCode || "-";
 
  if (isLoading) {
    return (
      <View style={{ marginTop: 15 }}>
        <View style={styles.card}>
          <Text>Loading bank details...</Text>
        </View>
      </View>
    );
  }
 
  return (
    <View style={{ marginTop: 15 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Bank Details</Text>
 
        {/* HEADER */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.header}>BANK NAME</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.header}>BANK ACCOUNT NUMBER</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.header, { textAlign: "right" }]}>
              IFSC CODE
            </Text>
          </View>
        </View>
 
        {/* DATA */}
        <View style={[styles.row, { marginTop: 15 }]}>
          <View style={styles.col}>
            <Text style={styles.data}>{bankName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.data}>{accountNumber}</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.data, { textAlign: "right" }]}>
              {ifscCode}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
 
export default BankDetailTab;
 
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
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  col: {
    flex: 1,
  },
  header: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6D7A90",
  },
  data: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
});
 
 
 