
// import React from "react";
// import { StyleSheet, View, Dimensions, ScrollView, Alert } from "react-native";
// import { useRoute } from "@react-navigation/native";
// import { useNavigation } from "@react-navigation/native";
// import { useQueryClient } from "@tanstack/react-query";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import Button from "../../../@ui/button/Button";
// import { useCreateEmployeeMutation } from "../../../apis/hooks/employee/mutation/useCreateEmployee.mutation";
// import { store } from "../../../app/store";
// import { COLORS } from "../../../colors";
// import { apiUrls } from "../../../apis/urls";
// import RNPrint from 'react-native-print';

// export default function ReviewScreenUI() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const queryClient = useQueryClient();
//   const createEmployeeMutation = useCreateEmployeeMutation();
//   const employeeData = (route.params as any)?.employeeData || {};
//   const employeeType = (route.params as any)?.employeeType || "";
//   const salaryType = (route.params as any)?.salaryType || "";
//   const fixedSalary = (route.params as any)?.fixedSalary || "";
//   const designation = (route.params as any)?.designation || "";
//   const salaryAmount = (route.params as any)?.salaryAmount || "";
//   const bankDetailsData = (route.params as any)?.bankDetailsData || {};
//   const educationDetailsData = (route.params as any)?.educationDetailsData || {}
//   const highestQualificationData = (route.params as any)?.highestQualificationData || "";
//   const orgPrefix = React.useMemo(() => {
//     const orgName =
//       store.getState().auth.selectedOrganization?.organizationName || "";
  
//     return orgName
//       .trim()
//       .split(/\s+/)
//       .map(word => word.charAt(0).toUpperCase())
//       .join("");
//   }, []);
  
//   // ⭐ Final Employee ID: RCO-bu32d
//   const generatedEmployeeId = React.useMemo(() => {
//     const randomPart = Math.random().toString(36).substring(2, 7);
//     return `${orgPrefix}-${randomPart}`;
//   }, [orgPrefix]);

//   // Debug: Check what data we're receiving
//   console.log("🔍 Review Page - Employee Type:", employeeType);
//   console.log("🔍 Review Page - Salary Type:", salaryType);
//   console.log("🔍 Review Page - Fixed Salary:", fixedSalary);
//   console.log("🔍 Review Page - Designation:", designation);
//   console.log("🔍 Review Page - Salary Amount:", salaryAmount);

//   const onBack = () => {
//     (navigation as any).navigate("BankDetails", route.params);
//   };
//   const onPrint = async () => {
//     try {
//       // Format date helper
//       const formatDateForPrint = (dateValue: any) => {
//         if (!dateValue || dateValue === "" || dateValue === null || dateValue === undefined) {
//           return "";
//         }
//         try {
//           let date: Date;
//           if (dateValue instanceof Date) {
//             date = dateValue;
//           } else if (typeof dateValue === 'string') {
//             date = new Date(dateValue);
//             if (isNaN(date.getTime())) {
//               return String(dateValue);
//             }
//           } else {
//             return String(dateValue);
//           }
//           const day = String(date.getDate()).padStart(2, '0');
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const year = date.getFullYear();
//           return `${day}/${month}/${year}`;
//         } catch (error) {
//           return String(dateValue);
//         }
//       };

//       // Format skills
//       const formatSkills = () => {
//         if (!employeeData.skills) return "";
//         if (Array.isArray(employeeData.skills)) {
//           return employeeData.skills.join(", ");
//         }
//         return String(employeeData.skills);
//       };

//       // Current date and time
//       const currentDate = new Date();
//       const formattedDate = currentDate.toLocaleDateString('en-GB', { 
//         day: '2-digit', 
//         month: '2-digit', 
//         year: 'numeric' 
//       });
//       const formattedTime = currentDate.toLocaleTimeString('en-GB', { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       });

//       // HTML content for print
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <meta charset="UTF-8">
//             <title>Employee Review Page</title>
//             <style>
//               @media print {
//                 body { margin: 0; }
//                 .no-print { display: none; }
//               }
//               body {
//                 font-family: Arial, sans-serif;
//                 padding: 20px;
//                 color: #000;
//               }
//               .header {
//                 text-align: center;
//                 margin-bottom: 30px;
//                 border-bottom: 2px solid #000;
//                 padding-bottom: 15px;
//               }
//               .header h1 {
//                 margin: 0;
//                 font-size: 24px;
//                 font-weight: bold;
//               }
//               .header p {
//                 margin: 5px 0;
//                 font-size: 14px;
//               }
//               .section {
//                 margin-bottom: 25px;
//                 page-break-inside: avoid;
//               }
//               .section-title {
//                 font-weight: bold;
//                 font-size: 18px;
//                 margin-bottom: 15px;
//                 border-bottom: 1px solid #ccc;
//                 padding-bottom: 5px;
//               }
//               .row {
//                 display: flex;
//                 margin-bottom: 8px;
//                 font-size: 14px;
//               }
//               .label {
//                 font-weight: bold;
//                 width: 220px;
//                 min-width: 220px;
//               }
//               .value {
//                 flex: 1;
//                 word-wrap: break-word;
//               }
//               .footer {
//                 margin-top: 40px;
//                 text-align: center;
//                 font-size: 12px;
//                 color: #666;
//                 border-top: 1px solid #ccc;
//                 padding-top: 15px;
//               }
//               .url {
//                 margin-top: 10px;
//                 font-size: 11px;
//                 color: #999;
//               }
//             </style>
//           </head>
//           <body>
//             <div class="header">
//               <h1>Employee Review Page</h1>
//               <p>Karomanage</p>
//               <p>${formattedDate}, ${formattedTime}</p>
//             </div>
            
//             <div class="section">
//               <div class="section-title">Personal Details</div>
//               <div class="row">
//                 <span class="label">First name:</span>
//                 <span class="value">${getFieldValue(employeeData.first)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Last name:</span>
//                 <span class="value">${getFieldValue(employeeData.last)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Mobile number:</span>
//                 <span class="value">${getFieldValue(employeeData.phone)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">E-mail:</span>
//                 <span class="value">${getFieldValue(employeeData.email)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Date of birth:</span>
//                 <span class="value">${formatDateForPrint(employeeData.dob)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Father's name:</span>
//                 <span class="value">${getFieldValue(employeeData.father)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Father's phone number:</span>
//                 <span class="value">${getFieldValue(employeeData.fphone)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Department:</span>
//                 <span class="value">${getFieldValue(employeeData.department)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Employee skills:</span>
//                 <span class="value">${formatSkills() || "-"}</span>
//               </div>
//             </div>
            
//             <div class="section">
//               <div class="section-title">Salary Details</div>
//               <div class="row">
//                 <span class="label">Employee designation:</span>
//                 <span class="value">${employeeType === "Teacher" ? "Teacher" : getFieldValue(designation)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Salary flat value:</span>
//                 <span class="value">${getFieldValue(fixedSalary || salaryAmount)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Salary type:</span>
//                 <span class="value">${getFieldValue(salaryType)}</span>
//               </div>
//             </div>
            
//             <div class="section">
//               <div class="section-title">Bank Details</div>
//               <div class="row">
//                 <span class="label">Bank name:</span>
//                 <span class="value">${getFieldValue(bankDetailsData.bankName)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">Account number:</span>
//                 <span class="value">${getFieldValue(bankDetailsData.accountNo)}</span>
//               </div>
//               <div class="row">
//                 <span class="label">IFSC code:</span>
//                 <span class="value">${getFieldValue(bankDetailsData.ifsc)}</span>
//               </div>
//             </div>
            
//             <div class="footer">
//               <div class="url">https://portal.karomanage.com/employee/employeeRegistration/</div>
//               <p>© ${currentDate.getFullYear()} Karomanage Powered by Bytomanage Innovation Private Limited</p>
//             </div>
//           </body>
//         </html>
//       `;

//       // Print dialog open karo
//       await RNPrint.print({
//         html: htmlContent
//       });
      
//     } catch (error) {
//       console.error('Print error:', error);
//       Alert.alert('Error', 'Failed to print. Please try again.');
//     }
//   };
//   const onSubmit = async () => {
//     try {
//       // Store se user aur organization data
//       const user = store.getState().auth.authUser;
//       const selectedOrganization = store.getState().auth.selectedOrganization;
      
//       // Payload prepare karein
//       const payload = {
//         user: {
//           userCustomerId: user?.customerId,
//           userCustomerName: user?.customerName,
//           userCustomerEmail: user?.customerEmail,
//           roleName: user?.roleName || "",
//           roleId: user?.roleId || "",
//           userEmployeeId: user?.employeeId || "",
//         },
//         customerId: selectedOrganization?.customerId,
//         organizationId: selectedOrganization?.organizationId,
//         employeeId: generatedEmployeeId,

//         employeeType: employeeType === "Teacher" ? "teacher" : "other",
//         employeeCode: employeeData.code || "",
//         referralAmount: 0,
//         referralpaymentStatus: '',
//         referralPaymentMethod: '',
//         employeePersonalDetails: {
//           employeeFirstname: employeeData.first || '',
//           employeeLastname: employeeData.last || '',
//           employeeEmail: employeeData.email || '',
//           employeePhoneNumber: employeeData.phone || '',
//           employeeCode: employeeData.code || '',
//           employeeGurdianName: employeeData.father || '',
//           employeeGurdianContactNumber: employeeData.fphone || '',
//           employeeAddress: employeeData.address || '',
//           employeeDateOfBirth: employeeData.dob || '',
//           employeeDepartment: employeeData.department || '',
//           employeeDesignation: employeeType === "Teacher" ? "teacher" : designation || '',
//           employeeEducationDetails: highestQualificationData || '',
//           employeeGender: '',
//           referenceByEmployee: ''
//         },
//         employeeProfessionalDetails: {
//           employeeSkills: employeeData.skills ? (Array.isArray(employeeData.skills) ? employeeData.skills : [employeeData.skills]) : [],
//           dateOfJoining: employeeData.doj || '',
//           releventExperienceYear: employeeData.experience || '',
//           referedBy: '',
//           employeeHighSchoolName: educationDetailsData.hs_name || '',
//           employeeHighSchoolPercentage: educationDetailsData.hs_percentage || '',
//           employeeHighSchoolBoard: educationDetailsData.hs_board || '',
//           employeeHighSchoolAddress: educationDetailsData.hs_address || '',
//           employeeHighSchoolCertificate: educationDetailsData.hs_certificate || '',
//           employeeHigherSecondarySchoolName: educationDetailsData.hsc_name || '',
//           employeeHigherSecondarySchoolPercentage: educationDetailsData.hsc_percentage || '',
//           employeeHigherSecondarySchoolBoard: educationDetailsData.hsc_board || '',
//           employeeHigherSecondarySchoolAddress: educationDetailsData.hsc_address || '',
//           employeeHigherSecondarySchoolCertificate: educationDetailsData.hsc_certificate || '',
//           employeeUnderGraduationCollegeName: educationDetailsData.grad_name || '',
//           employeeUnderGraduationCollegeCourseName: educationDetailsData.grad_course || '',
//           employeeUnderGraduationCollegeAddress: educationDetailsData.grad_address || '',
//           employeeUnderGraduationCollegePercentage: educationDetailsData.grad_percentage || '',
//           employeeUnderGraduationCollegeCertificate: educationDetailsData.grad_certificate || '',
//           employeePostGraduationCollegeName: educationDetailsData.pg_name || '',
//           employeePostGraduationCollegeCourseName: educationDetailsData.pg_course || '',
//           employeePostGraduationCollegeAddress: educationDetailsData.pg_address || '',
//           employeePostGraduationCollegePercentage: educationDetailsData.pg_percentage || '',
//           employeePostGraduationCollegeCertificate: educationDetailsData.pg_certificate || '',
//           employeeAadharCard: employeeData.aadharImageUri || "",
//           employeePanCard: employeeData.panImageUri || "",

        
//         },
//         employeeBankDetails: {
//           employeeBankName: bankDetailsData.bankName || '',
//           employeeAccountNo: bankDetailsData.accountNo || '',
//           employeeIfsceCode: bankDetailsData.ifsc || ''
//         },
//         employeeSalaryDetails: {
//           type: salaryType === "Fixed Salary Per Month" ? "fixedSalary" : 
//                 salaryType === "Percentage Salary" ? "percentageSalary" :
//                 salaryType === "Fixed and Percentage" ? "fixedAndPercentage" :
//                 salaryType === "Lecture Based" ? "lectureBased" : 
//                 employeeType === "Other" ? "fixedSalary" : "fixedSalary",
//           batchId: "",
//           salaryType: {
//             fixedSalary: (salaryType === "Fixed Salary Per Month" || salaryType === "Fixed and Percentage" || employeeType === "Other") ? {
//               fixedSalaryValue: employeeType === "Other" ? (parseInt(salaryAmount) || 0) : (parseInt(fixedSalary) || 0)
//             } : {},
//             percentageSalary: (salaryType === "Percentage Salary" || salaryType === "Fixed and Percentage") ? {
//               percentageSalaryValue: parseInt(salaryAmount || fixedSalary) || 0
//             } : {},
//             lectureBased: salaryType === "Lecture Based" ? [{
//               batchId: '',
//               subjects: [{
//                 subjectId: '',
//                 lectureAmount: parseInt(fixedSalary) || 0
//               }]
//             }] : {}
//           }
//         }
//       };
  
//       console.log('📤 Sending employee data:', JSON.stringify(payload, null, 2));
  
//       // API call
//       const response = await createEmployeeMutation.mutateAsync(payload);
      
//       console.log('📥 API Response:', response);
      
//       if (response?.statusCode === 200) {
//         // Success
//         console.log("✅ Employee created successfully!");
//         // Invalidate employee list queries to refresh the list automatically
//         queryClient.invalidateQueries({ queryKey: [apiUrls.employees.FETCH_EMPLOYEES_LIST] });
//         queryClient.invalidateQueries({ queryKey: [apiUrls.employees.LIST_ALL_EMPLOYEES] });
//         (navigation as any).navigate("EmployeeList");
//       } else {
//         console.error("❌ Error:", response?.message || "Failed to create employee");
//       }
//     } catch (error) {
//       console.error("❌ Error creating employee:", error);
//     }
//   };
//   const getFieldValue = (value: any) => {
//     if (!value || value === "" || value === null || value === undefined) {
//       return "-";
//     }
//     return String(value);
//   };

//   // Format date to DD-MM-YYYY format
//   const formatDate = (dateValue: any) => {
//     if (!dateValue || dateValue === "" || dateValue === null || dateValue === undefined) {
//       return "-";
//     }
    
//     try {
//       // If it's already a Date object
//       let date: Date;
//       if (dateValue instanceof Date) {
//         date = dateValue;
//       } else if (typeof dateValue === 'string') {
//         // Try to parse the string date (handles ISO strings, date strings, etc.)
//         date = new Date(dateValue);
//         // Check if date is valid
//         if (isNaN(date.getTime())) {
//           return String(dateValue); // Return as is if can't parse
//         }
//       } else {
//         return String(dateValue);
//       }

//       // Format to DD-MM-YYYY
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
      
//       return `${day}-${month}-${year}`;
//     } catch (error) {
//       // If any error, return original value as string
//       return String(dateValue);
//     }
//   };

//   // ⭐ Updated row layout with aligned colon
//   const Row = ({ label, value }: any) => (
//     <View style={styles.row}>

//       <View style={styles.leftSide}>
//         <ScalableText style={styles.rowLabel}>{label}</ScalableText>
//         <ScalableText style={styles.colonText}>:</ScalableText>
//       </View>

//       <ScalableText style={styles.rowValue}>{value}</ScalableText>
//     </View>
//   );

//   const renderSection = (title: string, children: any) => (
//     <View style={styles.section}>
//       <View style={styles.sectionHeader}>
//         <ScalableText style={styles.sectionTitle}>{title}</ScalableText>
//       </View>
//       <View style={styles.sectionContent}>{children}</View>
//     </View>
//   );

//   return (
//     <SafeView>
//       <AppHeader
//         title="Review Page"
//         showDrawer={false}
//         handleBackClick={onBack}
//       />

//       <View style={styles.screenRoot}>
        
//         <View style={styles.mainContainer}>
          
//           <View style={styles.fullWidthPanel}>
//             <ScrollView
//               style={styles.scrollView}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.scrollContent}
//             >

//               <View style={styles.reviewHeader}>
//                 <ScalableText style={styles.stepIndicator}>
//                   Check Your Filled Details
//                 </ScalableText>
//               </View>

//               {renderSection("👔 Employee Personal Details", (
//                 <>
//                 <Row label="First Name" value={getFieldValue(employeeData.first)} />
//                 <Row label="Last Name" value={getFieldValue(employeeData.last)} />
//                 <Row label="Mobile Number" value={getFieldValue(employeeData.phone)} />
//                 <Row label="Email" value={getFieldValue(employeeData.email)} />
//                <Row label="Date of Birth" value={formatDate(employeeData.dob)} />
//                 <Row label="Father Name" value={getFieldValue(employeeData.father)} />
//                 <Row label="Father Mobile No" value={getFieldValue(employeeData.fphone)} />
//                 <Row label="Department" value={getFieldValue(employeeData.department)} />
//                 <Row label="Employee Skills" value={getFieldValue(employeeData.skills)} />
//          </>
//          ))}  

// {highestQualificationData && Object.keys(highestQualificationData).length > 0 && educationDetailsData && Object.keys(educationDetailsData).length > 0 && renderSection("🎓 Education Details", (
//   <>
//     {/* High School - Always show if education details exist */}
//     {educationDetailsData.hs_name && (
//       <>
//         <Row label="High School Name" value={getFieldValue(educationDetailsData.hs_name)} />
//         <Row label="HS Percentage" value={getFieldValue(educationDetailsData.hs_percentage)} />
//         <Row label="HS Board" value={getFieldValue(educationDetailsData.hs_board)} />
//         <Row label="HS Address" value={getFieldValue(educationDetailsData.hs_address)} />
//       </>
//     )}
    
//     {/* Higher Secondary - Show if hsc_name exists */}
//     {educationDetailsData.hsc_name && (
//       <>
//         <Row label="Higher Secondary School Name" value={getFieldValue(educationDetailsData.hsc_name)} />
//         <Row label="HSC Percentage" value={getFieldValue(educationDetailsData.hsc_percentage)} />
//         <Row label="HSC Board" value={getFieldValue(educationDetailsData.hsc_board)} />
//         <Row label="HSC Address" value={getFieldValue(educationDetailsData.hsc_address)} />
//       </>
//     )}
    
//     {/* Graduation - Show if grad_name exists */}
//     {educationDetailsData.grad_name && (
//       <>
//         <Row label="Graduation College Name" value={getFieldValue(educationDetailsData.grad_name)} />
//         <Row label="Graduation Percentage" value={getFieldValue(educationDetailsData.grad_percentage)} />
//         <Row label="Graduation Course" value={getFieldValue(educationDetailsData.grad_course)} />
//         <Row label="Graduation Address" value={getFieldValue(educationDetailsData.grad_address)} />
//       </>
//     )}
    
//     {/* Post Graduation - Show if pg_name exists */}
//     {educationDetailsData.pg_name && (
//       <>
//         <Row label="Post Graduation College Name" value={getFieldValue(educationDetailsData.pg_name)} />
//         <Row label="PG Percentage" value={getFieldValue(educationDetailsData.pg_percentage)} />
//         <Row label="PG Course" value={getFieldValue(educationDetailsData.pg_course)} />
//         <Row label="PG Address" value={getFieldValue(educationDetailsData.pg_address)} />
//       </>
//     )}
//   </>
// ))}

//               {renderSection("💰 Monthly Salary", (
//                 <>
//                   {/* Designation Field */}
//                   <Row 
//                     label="Employee designation" 
//                     value={getFieldValue(employeeType === "Teacher" ? "Teacher" : designation)} 
//                   />
                  
//                   {/* Salary Type Field - Show "Fixed Salary" for Other type, otherwise show salaryType */}
//                   <Row 
//                     label="Salary type" 
//                     value={getFieldValue(employeeType === "Other" ? "Fixed Salary" : salaryType)} 
//                   />
                  
//                   {/* For Other employee type */}
//                   {employeeType === "Other" && (
//                     <Row label="Salary flat value" value={getFieldValue(salaryAmount)} />
//                   )}
                  
//                   {/* Salary Values - Conditional based on salaryType (for Teacher type) */}
//                   {employeeType === "Teacher" && salaryType === "Fixed Salary Per Month" && (
//                     <Row label="Salary flat value" value={getFieldValue(fixedSalary)} />
//                   )}
                  
//                   {employeeType === "Teacher" && salaryType === "Percentage Salary" && (
//                     <Row label="Salary percentage value" value={getFieldValue(fixedSalary)} />
//                   )}
                  
//                   {employeeType === "Teacher" && salaryType === "Fixed and Percentage" && (
//                     <>
//                       <Row label="Salary flat value" value={getFieldValue(fixedSalary)} />
//                       <Row label="Salary percentage value" value={getFieldValue(salaryAmount)} />
//                     </>
//                   )}
                  
//                   {employeeType === "Teacher" && salaryType === "Lecture Based" && (
//                     <Row label="Salary per lecture" value={getFieldValue(fixedSalary)} />
//                   )}
//                 </>
//               ))}

//               {renderSection("🏦 Bank Details", (
//                 <>
//                   <Row label="Bank Name" value={getFieldValue(bankDetailsData.bankName)} />
//                   <Row label="Account Number" value={getFieldValue(bankDetailsData.accountNo)} />
//                   <Row label="IFSC Code" value={getFieldValue(bankDetailsData.ifsc)} />
//                 </>
//               ))}

//             </ScrollView>
//           </View>

//         </View>

//         {/* bottom buttons */}
//         <View style={styles.buttonBelowCardWrapper}>
//           <View style={styles.buttonRow}>
//             <Button 
//               title="BACK" 
//               onPress={onBack}
//               btnStyles={styles.backBtn}
//               btnTxtStyles={styles.backBtnText}
//             />
//             <Button 
//               title="PRINT"
//               onPress={onPrint}
//               btnStyles={styles.printBtn}
//               btnTxtStyles={styles.printBtnText}
//             />
//             <Button 
//              title={createEmployeeMutation.isPending ? "SUBMITTING..." : "SUBMIT"}
//              onPress={onSubmit}
//              btnStyles={styles.submitBtn}
//              btnTxtStyles={styles.submitBtnText}
//              disabled={createEmployeeMutation.isPending}
//             />
//           </View>
//         </View>

//       </View>
//     </SafeView>
//   );
// }

// const styles = StyleSheet.create({
//   screenRoot: {
//     flex: 1, 
//     backgroundColor: COLORS.whiteSmoke,
//     paddingHorizontal: 8,
//     paddingTop: 20,
//   },
//   mainContainer: { flex: 1 },
//   fullWidthPanel: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     elevation: 3,
//     maxHeight: Dimensions.get("window").height * 0.65,
//   },
//   scrollView: { flex: 1 },
//   scrollContent: { padding: 24, paddingBottom: 40 },

//   reviewHeader: {
//     marginBottom: 24,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   stepIndicator: { fontSize: 16, color: "#666" },

//   section: {
//     marginBottom: 24,
//     backgroundColor: "#FAFAFA",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   sectionHeader: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     color: COLORS.white,
//     fontWeight: "600",
//   },
//   sectionContent: { padding: 20 },

//   // ⭐ Perfect colon alignment here
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     marginBottom: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E6E6E6",
//   },
//   leftSide: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "48%"    // makes colon fixed alignment ⭐
//   },
//   rowLabel: {
//     fontSize: 14,
//     color: "#555",
//   },
//   colonText: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   rowValue: {
//     flex: 1,
//     fontSize: 14,
//     color: COLORS.black,
//     fontWeight: "500",
//     textAlign: "left",
//   },

//   buttonBelowCardWrapper: {
//     marginTop: 16,
//     alignItems: "center",
//     marginBottom: "30%",
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "90%",
//     gap: 12,
//   },
//   backBtn: {
//     flex: 1,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//   },
//   backBtnText: { 
//     fontSize: 16, 
//     color: COLORS.white
//   },

//   printBtn: {
//     flex: 1,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//   },
//   printBtnText: { 
//     fontSize: 16, 
//     color: COLORS.white 
//   },

//   submitBtn: {
//     flex: 1,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//   },
//   submitBtnText: { 
//     fontSize: 16, 
//     color: COLORS.white 
//   },
// });



import React from "react";
import { StyleSheet, View, Dimensions, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import Button from "../../../@ui/button/Button";
import { useCreateEmployeeMutation } from "../../../apis/hooks/employee/mutation/useCreateEmployee.mutation";
import { useCreateTeacherMutation } 
from "../../../apis/hooks/teachers/mutation/useCreateTeacher.mutation";
import { store } from "../../../app/store";
import { COLORS } from "../../../colors";
import { apiUrls } from "../../../apis/urls";
import RNPrint from 'react-native-print';

export default function ReviewScreenUI() {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const createEmployeeMutation = useCreateEmployeeMutation();
  const createTeacherMutation = useCreateTeacherMutation();
  const employeeData = (route.params as any)?.employeeData || {};
  const employeeType = (route.params as any)?.employeeType || "";
  const salaryType = (route.params as any)?.salaryType || "";
  const fixedSalary = (route.params as any)?.fixedSalary || "";
  const designation = (route.params as any)?.designation || "";
  const salaryAmount = (route.params as any)?.salaryAmount || "";
  const bankDetailsData = (route.params as any)?.bankDetailsData || {};
  const educationDetailsData = (route.params as any)?.educationDetailsData || {}
  const highestQualificationData = (route.params as any)?.highestQualificationData || "";
  const orgPrefix = React.useMemo(() => {
    const orgName =
      store.getState().auth.selectedOrganization?.organizationName || "";
  
    return orgName
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join("");
  }, []);
  
  // ⭐ Final Employee ID: RCO-bu32d
  const generatedEmployeeId = React.useMemo(() => {
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${orgPrefix}-${randomPart}`;
  }, [orgPrefix]);

  // Debug: Check what data we're receiving
  console.log("🔍 Review Page - Employee Type:", employeeType);
  console.log("🔍 Review Page - Salary Type:", salaryType);
  console.log("🔍 Review Page - Fixed Salary:", fixedSalary);
  console.log("🔍 Review Page - Designation:", designation);
  console.log("🔍 Review Page - Salary Amount:", salaryAmount);
  console.log("🔍 Review Page - Employee Data:", employeeData);
  console.log("🔍 Review Page - Gender:", employeeData?.gender);
  console.log("🔍 Review Page - Experience:", employeeData?.experience);
  console.log("🔍 Review Page - Referral Amount:", employeeData?.referralAmount);
  console.log("🔍 Review Page - Referral Payment Status:", employeeData?.referralPaymentStatus);
  console.log("🔍 Review Page - Referral Payment Mode:", employeeData?.referralPaymentMode);
  console.log("🔍 Review Page - Referred By ID:", employeeData?.referredById);

  const onBack = () => {
    (navigation as any).navigate("BankDetails", route.params);
  };
  const onPrint = async () => {
    try {
      // Format date helper
      const formatDateForPrint = (dateValue: any) => {
        if (!dateValue || dateValue === "" || dateValue === null || dateValue === undefined) {
          return "";
        }
        try {
          let date: Date;
          if (dateValue instanceof Date) {
            date = dateValue;
          } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              return String(dateValue);
            }
          } else {
            return String(dateValue);
          }
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        } catch (error) {
          return String(dateValue);
        }
      };

      // Format skills
      const formatSkills = () => {
        if (!employeeData.skills) return "";
        if (Array.isArray(employeeData.skills)) {
          return employeeData.skills.join(", ");
        }
        return String(employeeData.skills);
      };

      // Current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const formattedTime = currentDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // HTML content for print
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Employee Review Page</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #000;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .header p {
                margin: 5px 0;
                font-size: 14px;
              }
              .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .section-title {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 15px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
              }
              .row {
                display: flex;
                margin-bottom: 8px;
                font-size: 14px;
              }
              .label {
                font-weight: bold;
                width: 220px;
                min-width: 220px;
              }
              .value {
                flex: 1;
                word-wrap: break-word;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 15px;
              }
              .url {
                margin-top: 10px;
                font-size: 11px;
                color: #999;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Employee Review Page</h1>
              <p>Karomanage</p>
              <p>${formattedDate}, ${formattedTime}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Personal Details</div>
              <div class="row">
                <span class="label">First name:</span>
                <span class="value">${getFieldValue(employeeData.first)}</span>
              </div>
              <div class="row">
                <span class="label">Last name:</span>
                <span class="value">${getFieldValue(employeeData.last)}</span>
              </div>
              <div class="row">
                <span class="label">Mobile number:</span>
                <span class="value">${getFieldValue(employeeData.phone)}</span>
              </div>
              <div class="row">
                <span class="label">E-mail:</span>
                <span class="value">${getFieldValue(employeeData.email)}</span>
              </div>
              <div class="row">
                <span class="label">Date of birth:</span>
                <span class="value">${formatDateForPrint(employeeData.dob)}</span>
              </div>
              <div class="row">
                <span class="label">Father's name:</span>
                <span class="value">${getFieldValue(employeeData.father)}</span>
              </div>
              <div class="row">
                <span class="label">Father's phone number:</span>
                <span class="value">${getFieldValue(employeeData.fphone)}</span>
              </div>
              <div class="row">
                <span class="label">Department:</span>
                <span class="value">${getFieldValue(employeeData.department)}</span>
              </div>
              <div class="row">
                <span class="label">Employee skills:</span>
                <span class="value">${formatSkills() || "-"}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Salary Details</div>
              <div class="row">
                <span class="label">Employee designation:</span>
                <span class="value">${employeeType === "Teacher" ? "Teacher" : getFieldValue(designation)}</span>
              </div>
              <div class="row">
                <span class="label">Salary flat value:</span>
                <span class="value">${getFieldValue(fixedSalary || salaryAmount)}</span>
              </div>
              <div class="row">
                <span class="label">Salary type:</span>
                <span class="value">${getFieldValue(salaryType)}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Bank Details</div>
              <div class="row">
                <span class="label">Bank name:</span>
                <span class="value">${getFieldValue(bankDetailsData.bankName)}</span>
              </div>
              <div class="row">
                <span class="label">Account number:</span>
                <span class="value">${getFieldValue(bankDetailsData.accountNo)}</span>
              </div>
              <div class="row">
                <span class="label">IFSC code:</span>
                <span class="value">${getFieldValue(bankDetailsData.ifsc)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="url">https://portal.karomanage.com/employee/employeeRegistration/</div>
              <p>© ${currentDate.getFullYear()} Karomanage Powered by Bytomanage Innovation Private Limited</p>
            </div>
          </body>
        </html>
      `;

      // Print dialog open karo
      await RNPrint.print({
        html: htmlContent
      });
      
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print. Please try again.');
    }
  };
  const onSubmit = async () => {
    try {
      // Store se user aur organization data
      const user = store.getState().auth.authUser;
      const selectedOrganization = store.getState().auth.selectedOrganization;
      
      // Extract referral data from employeeData
      const referralAmount = employeeData?.referralAmount || 0;
      const referralPaymentStatus = employeeData?.referralPaymentStatus || '';
      const referralPaymentMethod = employeeData?.referralPaymentMode || '';
      const referredById = employeeData?.referredById || '';
      
      // Payload prepare karein
      const payload = {
        user: {
          userCustomerId: user?.customerId,
          userCustomerName: user?.customerName,
          userCustomerEmail: user?.customerEmail,
          roleName: user?.roleName || "",
          roleId: user?.roleId || "",
          userEmployeeId: user?.employeeId || "",
        },
        customerId: selectedOrganization?.customerId,
        organizationId: selectedOrganization?.organizationId,
        employeeId: generatedEmployeeId,

        employeeType: employeeType === "Teacher" ? "teacher" : "other",
        employeeCode: employeeData.code || "",
        referralAmount: referralAmount,
        referralpaymentStatus: referralPaymentStatus,
        referralPaymentMethod: referralPaymentMethod,
        employeePersonalDetails: {
          employeeFirstname: employeeData.first || '',
          employeeLastname: employeeData.last || '',
          employeeEmail: employeeData.email || '',
          employeePhoneNumber: employeeData.phone || '',
          employeeCode: employeeData.code || '',
          employeeGurdianName: employeeData.father || '',
          employeeGurdianContactNumber: employeeData.fphone || '',
          employeeAddress: employeeData.address || '',
          employeeDateOfBirth: employeeData.dob || '',
          employeeDepartment: employeeData.department || '',
          employeeDesignation: employeeType === "Teacher" ? "teacher" : designation || '',
          employeeEducationDetails: highestQualificationData || '',
          employeeGender: employeeData.gender || '',
          referenceByEmployee: referredById
        },
        employeeProfessionalDetails: {
          employeeSkills: employeeData.skills ? (Array.isArray(employeeData.skills) ? employeeData.skills : [employeeData.skills]) : [],
          dateOfJoining: employeeData.doj || '',
          releventExperienceYear: employeeData.experience || '',
          referedBy: referredById,
          employeeHighSchoolName: educationDetailsData.hs_name || '',
          employeeHighSchoolPercentage: educationDetailsData.hs_percentage || '',
          employeeHighSchoolBoard: educationDetailsData.hs_board || '',
          employeeHighSchoolAddress: educationDetailsData.hs_address || '',
          employeeHighSchoolCertificate: educationDetailsData.hs_certificate || '',
          employeeHigherSecondarySchoolName: educationDetailsData.hsc_name || '',
          employeeHigherSecondarySchoolPercentage: educationDetailsData.hsc_percentage || '',
          employeeHigherSecondarySchoolBoard: educationDetailsData.hsc_board || '',
          employeeHigherSecondarySchoolAddress: educationDetailsData.hsc_address || '',
          employeeHigherSecondarySchoolCertificate: educationDetailsData.hsc_certificate || '',
          employeeUnderGraduationCollegeName: educationDetailsData.grad_name || '',
          employeeUnderGraduationCollegeCourseName: educationDetailsData.grad_course || '',
          employeeUnderGraduationCollegeAddress: educationDetailsData.grad_address || '',
          employeeUnderGraduationCollegePercentage: educationDetailsData.grad_percentage || '',
          employeeUnderGraduationCollegeCertificate: educationDetailsData.grad_certificate || '',
          employeePostGraduationCollegeName: educationDetailsData.pg_name || '',
          employeePostGraduationCollegeCourseName: educationDetailsData.pg_course || '',
          employeePostGraduationCollegeAddress: educationDetailsData.pg_address || '',
          employeePostGraduationCollegePercentage: educationDetailsData.pg_percentage || '',
          employeePostGraduationCollegeCertificate: educationDetailsData.pg_certificate || '',
          employeeAadharCard: employeeData.aadharImageUri || "",
          employeePanCard: employeeData.panImageUri || "",

        
        },
        employeeBankDetails: {
          employeeBankName: bankDetailsData.bankName || '',
          employeeAccountNo: bankDetailsData.accountNo || '',
          employeeIfsceCode: bankDetailsData.ifsc || ''
        },
        employeeSalaryDetails: {
          type: salaryType === "Fixed Salary Per Month" ? "fixedSalary" : 
                salaryType === "Percentage Salary" ? "percentageSalary" :
                salaryType === "Fixed and Percentage" ? "fixedAndPercentage" :
                salaryType === "Lecture Based" ? "lectureBased" : 
                employeeType === "Other" ? "fixedSalary" : "fixedSalary",
          batchId: "",
          salaryType: {
            fixedSalary: (salaryType === "Fixed Salary Per Month" || salaryType === "Fixed and Percentage" || employeeType === "Other") ? {
              fixedSalaryValue: employeeType === "Other" ? (parseInt(salaryAmount) || 0) : (parseInt(fixedSalary) || 0)
            } : {},
            percentageSalary: (salaryType === "Percentage Salary" || salaryType === "Fixed and Percentage") ? {
              percentageSalaryValue: parseInt(salaryAmount || fixedSalary) || 0
            } : {},
            lectureBased: salaryType === "Lecture Based" ? [{
              batchId: '',
              subjects: [{
                subjectId: '',
                lectureAmount: parseInt(fixedSalary) || 0
              }]
            }] : {}
          }
        }
      };
  
      console.log('📤 Sending employee data:', JSON.stringify(payload, null, 2));
      console.log('📤 Referral Details:', {
        referralAmount: referralAmount,
        referralPaymentStatus: referralPaymentStatus,
        referralPaymentMethod: referralPaymentMethod,
        referredById: referredById
      });
  
      // API call
      const response = await createEmployeeMutation.mutateAsync(payload);

if (response?.statusCode === 200) {
  console.log("✅ Employee created successfully!");

  // ⭐⭐⭐ TEACHER API CALL (ONLY IF TEACHER) ⭐⭐⭐
  if (employeeType === "Teacher") {

    const teacherPayload = {
      user: {
        userCustomerId: user?.customerId,
        userCustomerName: user?.customerName,
        userCustomerEmail: user?.customerEmail,
        roleName: user?.roleName,
        roleId: user?.roleId,
        userEmployeeId: user?.employeeId || "",
      },
      customerId: selectedOrganization?.customerId,
      organizationId: selectedOrganization?.organizationId,

      // ⭐ SAME AS employeeId (WEBSITE JAISE)
      teacherId: generatedEmployeeId,

      teacherFirstName: employeeData.first,
      teacherEmail: employeeData.email,
      teacherPhoneNumber: employeeData.phone,
      dateOfBirth: employeeData.dob,

      batch: [
        {
          subjects: [{}]
        }
      ]
    };

    console.log("📤 Teacher Payload:", JSON.stringify(teacherPayload, null, 2));

    await createTeacherMutation.mutateAsync(teacherPayload);
    console.log("🎉 Teacher created successfully!");
  }

  // refresh employee list
  queryClient.invalidateQueries({ queryKey: [apiUrls.employees.FETCH_EMPLOYEES_LIST] });
  queryClient.invalidateQueries({ queryKey: [apiUrls.employees.LIST_ALL_EMPLOYEES] });
  queryClient.invalidateQueries({
    queryKey: [apiUrls.teacher.FETCH_TEACHERS_LIST],
  });
  (navigation as any).navigate("EmployeeList");
}
 else {
        console.error("❌ Error:", response?.message || "Failed to create employee");
      }
    } catch (error) {
      console.error("❌ Error creating employee:", error);
    }
  };
  const getFieldValue = (value: any) => {
    if (!value || value === "" || value === null || value === undefined) {
      return "-";
    }
    return String(value);
  };

  // Format date to DD-MM-YYYY format
  const formatDate = (dateValue: any) => {
    if (!dateValue || dateValue === "" || dateValue === null || dateValue === undefined) {
      return "-";
    }
    
    try {
      // If it's already a Date object
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Try to parse the string date (handles ISO strings, date strings, etc.)
        date = new Date(dateValue);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return String(dateValue); // Return as is if can't parse
        }
      } else {
        return String(dateValue);
      }

      // Format to DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      // If any error, return original value as string
      return String(dateValue);
    }
  };

  // ⭐ Updated row layout with aligned colon
  const Row = ({ label, value }: any) => (
    <View style={styles.row}>

      <View style={styles.leftSide}>
        <ScalableText style={styles.rowLabel}>{label}</ScalableText>
        <ScalableText style={styles.colonText}>:</ScalableText>
      </View>

      <ScalableText style={styles.rowValue}>{value}</ScalableText>
    </View>
  );

  const renderSection = (title: string, children: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ScalableText style={styles.sectionTitle}>{title}</ScalableText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <SafeView>
      <AppHeader
        title="Review Page"
        showDrawer={false}
        handleBackClick={onBack}
      />

      <View style={styles.screenRoot}>
        
        <View style={styles.mainContainer}>
          
          <View style={styles.fullWidthPanel}>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >

              <View style={styles.reviewHeader}>
                {/* <ScalableText style={styles.stepIndicator}>
                  Check Your Filled Details
                </ScalableText> */}
              </View>

              {renderSection("👔 Employee Personal Details", (
                <>
                <Row label="First Name" value={getFieldValue(employeeData.first)} />
                <Row label="Last Name" value={getFieldValue(employeeData.last)} />
                <Row label="Mobile Number" value={getFieldValue(employeeData.phone)} />
                <Row label="Email" value={getFieldValue(employeeData.email)} />
               <Row label="Date of Birth" value={formatDate(employeeData.dob)} />
                <Row label="Father Name" value={getFieldValue(employeeData.father)} />
                <Row label="Father Mobile No" value={getFieldValue(employeeData.fphone)} />
                <Row label="Department" value={getFieldValue(employeeData.department)} />
                <Row label="Employee Skills" value={getFieldValue(employeeData.skills)} />
         </>
         ))}  

{highestQualificationData && Object.keys(highestQualificationData).length > 0 && educationDetailsData && Object.keys(educationDetailsData).length > 0 && renderSection("🎓 Education Details", (
  <>
    {/* High School - Always show if education details exist */}
    {educationDetailsData.hs_name && (
      <>
        <Row label="High School Name" value={getFieldValue(educationDetailsData.hs_name)} />
        <Row label="HS Percentage" value={getFieldValue(educationDetailsData.hs_percentage)} />
        <Row label="HS Board" value={getFieldValue(educationDetailsData.hs_board)} />
        <Row label="HS Address" value={getFieldValue(educationDetailsData.hs_address)} />
      </>
    )}
    
    {/* Higher Secondary - Show if hsc_name exists */}
    {educationDetailsData.hsc_name && (
      <>
        <Row label="Higher Secondary School Name" value={getFieldValue(educationDetailsData.hsc_name)} />
        <Row label="HSC Percentage" value={getFieldValue(educationDetailsData.hsc_percentage)} />
        <Row label="HSC Board" value={getFieldValue(educationDetailsData.hsc_board)} />
        <Row label="HSC Address" value={getFieldValue(educationDetailsData.hsc_address)} />
      </>
    )}
    
    {/* Graduation - Show if grad_name exists */}
    {educationDetailsData.grad_name && (
      <>
        <Row label="Graduation College Name" value={getFieldValue(educationDetailsData.grad_name)} />
        <Row label="Graduation Percentage" value={getFieldValue(educationDetailsData.grad_percentage)} />
        <Row label="Graduation Course" value={getFieldValue(educationDetailsData.grad_course)} />
        <Row label="Graduation Address" value={getFieldValue(educationDetailsData.grad_address)} />
      </>
    )}
    
    {/* Post Graduation - Show if pg_name exists */}
    {educationDetailsData.pg_name && (
      <>
        <Row label="Post Graduation College Name" value={getFieldValue(educationDetailsData.pg_name)} />
        <Row label="PG Percentage" value={getFieldValue(educationDetailsData.pg_percentage)} />
        <Row label="PG Course" value={getFieldValue(educationDetailsData.pg_course)} />
        <Row label="PG Address" value={getFieldValue(educationDetailsData.pg_address)} />
      </>
    )}
  </>
))}

              {renderSection("💰 Monthly Salary", (
                <>
                  {/* Designation Field */}
                  <Row 
                    label="Employee designation" 
                    value={getFieldValue(employeeType === "Teacher" ? "Teacher" : designation)} 
                  />
                  
                  {/* Salary Type Field - Show "Fixed Salary" for Other type, otherwise show salaryType */}
                  <Row 
                    label="Salary type" 
                    value={getFieldValue(employeeType === "Other" ? "Fixed Salary" : salaryType)} 
                  />
                  
                  {/* For Other employee type */}
                  {employeeType === "Other" && (
                    <Row label="Salary flat value" value={getFieldValue(salaryAmount)} />
                  )}
                  
                  {/* Salary Values - Conditional based on salaryType (for Teacher type) */}
                  {employeeType === "Teacher" && salaryType === "Fixed Salary Per Month" && (
                    <Row label="Salary flat value" value={getFieldValue(fixedSalary)} />
                  )}
                  
                  {employeeType === "Teacher" && salaryType === "Percentage Salary" && (
                    <Row label="Salary percentage value" value={getFieldValue(fixedSalary)} />
                  )}
                  
                  {employeeType === "Teacher" && salaryType === "Fixed and Percentage" && (
                    <>
                      <Row label="Salary flat value" value={getFieldValue(fixedSalary)} />
                      <Row label="Salary percentage value" value={getFieldValue(salaryAmount)} />
                    </>
                  )}
                  
                  {employeeType === "Teacher" && salaryType === "Lecture Based" && (
                    <Row label="Salary per lecture" value={getFieldValue(fixedSalary)} />
                  )}
                </>
              ))}

              {renderSection("🏦 Bank Details", (
                <>
                  <Row label="Bank Name" value={getFieldValue(bankDetailsData.bankName)} />
                  <Row label="Account Number" value={getFieldValue(bankDetailsData.accountNo)} />
                  <Row label="IFSC Code" value={getFieldValue(bankDetailsData.ifsc)} />
                </>
              ))}

            </ScrollView>
          </View>

        </View>

        {/* bottom buttons */}
        <View style={styles.buttonBelowCardWrapper}>
          <View style={styles.buttonRow}>
            <Button 
              title="BACK" 
              onPress={onBack}
              btnStyles={styles.backBtn}
              btnTxtStyles={styles.backBtnText}
            />
            <Button 
              title="PRINT"
              onPress={onPrint}
              btnStyles={styles.printBtn}
              btnTxtStyles={styles.printBtnText}
            />
            <Button 
             title={createEmployeeMutation.isPending ? "SUBMITTING..." : "SUBMIT"}
             onPress={onSubmit}
             btnStyles={styles.submitBtn}
             btnTxtStyles={styles.submitBtnText}
             disabled={createEmployeeMutation.isPending}
            />
          </View>
        </View>

      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1, 
    backgroundColor: COLORS.whiteSmoke,
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  mainContainer: { flex: 1 },
  fullWidthPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
    maxHeight: Dimensions.get("window").height * 0.65,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },

  reviewHeader: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  stepIndicator: { fontSize: 16, color: "#666" },

  section: {
    marginBottom: 24,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "600",
  },
  sectionContent: { padding: 20 },

  // ⭐ Perfect colon alignment here
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%"    // makes colon fixed alignment ⭐
  },
  rowLabel: {
    fontSize: 14,
    color: "#555",
  },
  colonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "600",
    marginLeft: 4,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
    textAlign: "left",
  },

  buttonBelowCardWrapper: {
    marginTop: 16,
    alignItems: "center",
    marginBottom: "30%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    gap: 12,
  },
  backBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  backBtnText: { 
    fontSize: 16, 
    color: COLORS.white
  },

  printBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  printBtnText: { 
    fontSize: 16, 
    color: COLORS.white 
  },

  submitBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  submitBtnText: { 
    fontSize: 16, 
    color: COLORS.white 
  },
});