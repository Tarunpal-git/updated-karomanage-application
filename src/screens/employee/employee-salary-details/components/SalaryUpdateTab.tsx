import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../../../colors";
import { useEmployeeDetailsQuery } from "../../../../apis/hooks/employee/query/useEmployeeDetails.query";
import moment from "moment";
 
const Heights = {
  cardHeight: Dimensions.get("window").height * 0.62,
};
 
const SalaryUpdateTab = ({ employeeId }: { employeeId: string }) => {
  const { data, isLoading } = useEmployeeDetailsQuery(employeeId);
 
  const salaryDetails =
    data?.statuscode === 200 ? data?.data?.employeeSalaryDetails?.[0] : null;
 
  const fixedSalary =
    salaryDetails?.salaryType?.fixedSalary?.[0]?.fixedSalaryValue;
 
  const createdDate =
    salaryDetails?.salaryType?.fixedSalary?.[0]?.dateCreated;
 
  if (isLoading) {
    return (
      <View style={{ marginTop: 15 }}>
        <View style={styles.card}>
          <Text>Loading salary details...</Text>
        </View>
      </View>
    );
  }
 
  return (
    <View style={{ marginTop: 15 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Employee Salary Details :</Text>
 
        <View style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Fixed salary amount :</Text>
            <Text style={styles.value}>
              {fixedSalary ? `₹${fixedSalary}` : "-"}
            </Text>
          </View>
 
          <View style={styles.row}>
            <Text style={styles.label}>Salary created date :</Text>
            <Text style={styles.value}>
              {createdDate
                ? moment(createdDate).format("DD/MM/YYYY")
                : "-"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
 
export default SalaryUpdateTab;
 
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
  infoCard: {
    backgroundColor: "#f9fbff",
    borderRadius: 12,
    padding: 18,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6D7A90",
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});
 
 
 