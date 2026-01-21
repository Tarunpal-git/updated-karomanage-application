import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../../../../colors";
 
import { useEmployeeDetailsQuery } from "../../../../apis/hooks/employee/query/useEmployeeDetails.query";
import Pdf from "react-native-pdf";
 
const Heights = {
  cardHeight: Dimensions.get("window").height * 0.62,
};
 
const EducationDetailTab = ({ employeeId }: { employeeId: string }) => {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "MARKSHEET">("DETAILS");
   
    const { data, isLoading, refetch } = useEmployeeDetailsQuery(employeeId);
    const employeeData = data?.statuscode === 200 ? data.data : null;
    const educationDetails = employeeData?.employeeProfessionalDetails; // या जो भी field name हो API में
   
    console.log("Full API Response:", data);
  console.log("Employee Data:", employeeData);
 
    // ✅ STEP 4: sections array modify करें (Line 356 के बाद)
    const sections = [
      {
        title: "HIGH SCHOOL",
        fields: [
          {
            label: "Name",
            value: educationDetails?.employeeHighSchoolName || "-"
          },
          {
            label: "Address",
            value: educationDetails?.employeeHighSchoolAddress || "-"
          },
          {
            label: "Percentage",
            value: educationDetails?.employeeHighSchoolPercentage || "-"
          },
          {
            label: "Board",
            value: educationDetails?.employeeHighSchoolBoard || "-"
          },
        ],
      },
      {
        title: "HIGHER SECONDARY SCHOOL",
        fields: [
          {
            label: "Name",
            value: educationDetails?.employeeHigherSecondarySchoolName || "-"
          },
          {
            label: "Address",
            value: educationDetails?.employeeHigherSecondarySchoolAddress || "-"
          },
          {
            label: "Percentage",
            value: educationDetails?.employeeHigherSecondarySchoolPercentage || "-"
          },
          {
            label: "Board",
            value: educationDetails?.employeeHigherSecondarySchoolBoard || "-"
          },
        ],
      },
      {
        title: "GRADUATION COLLEGE",
        fields: [
          {
            label: "Name",
            value: educationDetails?.employeeUnderGraduationCollegeName || "-"
          },
          {
            label: "Address",
            value: educationDetails?.employeeUnderGraduationCollegeAddress || "-"
          },
          {
            label: "Percentage",
            value: educationDetails?.employeeUnderGraduationCollegePercentage || "-"
          },
          {
            label: "Course",
            value: educationDetails?.employeeUnderGraduationCollegeCourseName || "-"
          },
        ],
      },
      {
        title: "POST GRADUATION COLLEGE",
        fields: [
          {
            label: "Name",
            value: educationDetails?.employeePostGraduationCollegeName || "-"
          },
          {
            label: "Address",
            value: educationDetails?.employeePostGraduationCollegeAddress || "-"
          },
          {
            label: "Percentage",
            value: educationDetails?.employeePostGraduationCollegePercentage || "-"
          },
          {
            label: "Course",
            value: educationDetails?.employeePostGraduationCollegeCourseName || "-"
          },
        ],
      },
   
      // {
      //   title: "POST GRADUATION COLLEGE",
      //   fields: [
      //     {
      //       label: "Name",
      //       value: employeeData?.employeePostGraduationCollegeName || "-"
      //     },
      //     {
      //       label: "Address",
      //       value: employeeData?.employeePostGraduationCollegeAddress || "-"
      //     },
      //     {
      //       label: "Percentage",
      //       value: employeeData?.employeePostGraduationCollegePercentage || "-"
      //     },
      //     {
      //       label: "Course",
      //       value: employeeData?.["employeePost GraduationCollegeCourseName"] || "-"
      //     },
      //   ],
      // },
    ];
    if (isLoading) {
      return (
        <View style={{ marginTop: 15, padding: 20 }}>
          <Text>Loading education details...</Text>
        </View>
      );
    }
 
 
  return (
    <View style={{ marginTop: 15 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Education Details</Text>
 
        {/* ===== SUB TABS ===== */}
        <View style={styles.tabRow}>
          {["DETAILS", "MARKSHEET"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t as any)}
              style={[
                styles.tabBtn,
                activeTab === t && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t && styles.activeTabText,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        {/* ===== CONTENT ===== */}
        <ScrollView
          nestedScrollEnabled
          overScrollMode="never"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* ===== DETAILS TAB ===== */}
          {activeTab === "DETAILS" &&
            sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
 
                {section.fields.map((f, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{f.label}</Text>
                    <Text style={styles.value}>{f.value}</Text>
                  </View>
                ))}
 
                {index !== sections.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
 
                           {/* ===== MARKSHEET TAB ===== */}
                   {/* ===== MARKSHEET TAB ===== */}
                   {activeTab === "MARKSHEET" && (
            <View>
              {[
                {
                  title: "High School Marksheet",
                  url: educationDetails?.employeeHighSchoolCertificate || null
                },
                {
                  title: "Higher Secondary Marksheet",
                  url: educationDetails?.employeeHigherSecondarySchoolCertificate || null
                },
                {
                  title: "Graduation Marksheet",
                  url: educationDetails?.employeeUnderGraduationCollegeCertificate || null
                },
                {
                  title: "Post Graduation Marksheet",
                  url: educationDetails?.employeePostGraduationCollegeCertificate || null
                },
              ].map((item, i) => (
                <View key={i} style={styles.marksheetCard}>
                  <Text style={styles.marksheetTitle}>{item.title}</Text>
                  <View style={styles.previewBox}>
                  {item.url ? (
  (() => {
    const isPdf = item.url?.toLowerCase().endsWith('.pdf') ||
                  item.url?.includes('application/pdf') ||
                  item.url?.includes('.pdf');
   
    return isPdf ? (
      <Pdf
  source={{ uri: item.url }}
  style={{ flex: 1, width: '100%', minHeight: 200 }}
  onError={(error) => {
    console.log('PDF Error:', error);
  }}
  showsVerticalScrollIndicator={true}  // 👈 Ye add karo scrolling ke liye
  enablePaging={false}  // 👈 Optional: agar false hoga to continuous scroll hoga
/>
    ) : (
      <Image
        source={{ uri: item.url }}
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
    );
  })()
) : (
  <Text style={styles.previewText}>No marksheet uploaded</Text>
)}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
 
export default EducationDetailTab;
 
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
    marginBottom: 15,
  },
 
  /* Tabs */
  tabRow: {
    flexDirection: "row",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
 
  tabBtn: {
    paddingVertical: 8,
    marginRight: 20,
  },
 
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
 
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
 
  activeTabText: {
    color: COLORS.primary,
  },
 
  /* Details */
  section: {
    marginBottom: 15,
  },
 
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
 
 
  row: {
    flexDirection: "row",
    paddingVertical: 6,
  },
 
  label: {
    width: "40%",          // 👈 fixed width
    fontSize: 14,
    color: "#555",
  },
 
  value: {
    width: "60%",          // 👈 right side area
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",    // 👈 RIGHT ALIGN
  },
 
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginTop: 10,
  },
 
  /* Marksheet */
  marksheetCard: {
    marginBottom: 20,
  },
 
  marksheetTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
 
  previewBox: {
    height: 200,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
 
  previewText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
});
 
 