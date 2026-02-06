// import React, { useState } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import { useNavigation } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
// import { StyleSheet, View, Dimensions } from "react-native";
// import { COLORS } from "../../../colors";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { useForm, useFieldArray } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { forms } from "../../../forms";
// import Input from "../../../@ui/input/Input";
// import ControlledSelect from "../../../@ui/controlled-select/ControlledSelect";
// import Button from "../../../@ui/button/Button";
// import { useUpdateCourseMutation } from "../../../apis/hooks/courses/mutation/useUpdateCourse.mutation";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { useQueryClient } from "@tanstack/react-query";
// import { apiUrls } from "../../../apis/urls";

// interface UpdateCourseProps {
//   courseData: any;
//   onClose: () => void;
// }

// const MODE_OPTIONS = [
//   { label: "Offline", value: "offline" },
//   { label: "Online", value: "online" },
// ];

// const DURATION_YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
//   label: `${i} Year${i === 1 ? "" : "s"}`,
//   value: `${i}`,
// }));

// const DURATION_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
//   label: `${i} Month${i === 1 ? "" : "s"}`,
//   value: `${i}`,
// }));

// const INSTALLMENT_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
//   label: `${i + 2}`,
//   value: `${i + 2}`,
// }));

// const UpdateCourse = ({ courseData, onClose }: UpdateCourseProps) => {
//   console.log('UpdateCourse component rendered with data:', courseData);
//   const navigation = useNavigation<TScreenNavigator>();
//   const [confirmation, setConfirmation] = useState(false);
  
//   // Pre-fill form with existing course data
//   const defaultValues = {
//     courseId: courseData?.courseId || "",
//     courseName: courseData?.courseName || "",
//     courseDescription: courseData?.courseDescription || "",
//     courseFee: courseData?.courseFee || "",
//     courseFeeDescription: courseData?.courseFeeDescription || "",
//     courseDurationYear: courseData?.courseDuration ? String(Math.floor(courseData.courseDuration / 12)) : "",
//     courseDurationMonth: courseData?.courseDuration ? String(courseData.courseDuration % 12) : "",
//     maxPaymentInstallment: courseData?.maxPaymentInstallment || "",
//     subjects: courseData?.subjects || [],
//   };

//   const handler = useForm({
//     defaultValues,
//     reValidateMode: "onSubmit",
//     mode: "all",
//   });

//   const { fields, append, remove } = useFieldArray({
//     control: handler.control,
//     name: "subjects",
//   });

//   const { mutateAsync, isPending } = useUpdateCourseMutation();
//   const queryClient = useQueryClient();

//   const onSubmit: Parameters<typeof handler.handleSubmit>[0] = async (values) => {
//     // Check if any fields have been modified
//     const hasChanges = 
//       values.courseName !== courseData?.courseName ||
//       values.courseDescription !== courseData?.courseDescription ||
//       values.courseFee !== courseData?.courseFee ||
//       values.courseFeeDescription !== courseData?.courseFeeDescription ||
//       values.courseDurationYear !== (courseData?.courseDuration ? String(Math.floor(courseData.courseDuration / 12)) : "") ||
//       values.courseDurationMonth !== (courseData?.courseDuration ? String(courseData.courseDuration % 12) : "") ||
//       values.maxPaymentInstallment !== courseData?.maxPaymentInstallment ||
//       JSON.stringify(values.subjects) !== JSON.stringify(courseData?.subjects || []);

//     if (!hasChanges) {
//       // @ts-ignore
//       customAlert.show({ message: "No changes detected. Please modify at least one field before updating." });
//       return;
//     }

//     // Validate mandatory fields and set errors on specific fields
//     let hasErrors = false;

//     if (!values.courseName || values.courseName.trim() === "") {
//       handler.setError("courseName", { type: "required", message: "Course name is required" });
//       hasErrors = true;
//     } else {
//       handler.clearErrors("courseName");
//     }

//     if (!values.courseFee || values.courseFee.toString().trim() === "") {
//       handler.setError("courseFee", { type: "required", message: "Course fee is required" });
//       hasErrors = true;
//     } else if (isNaN(Number(values.courseFee)) || Number(values.courseFee) <= 0) {
//       handler.setError("courseFee", { type: "invalid", message: "Course fee must be a valid number" });
//       hasErrors = true;
//     } else {
//       handler.clearErrors("courseFee");
//     }

//     if (!values.maxPaymentInstallment || values.maxPaymentInstallment.toString().trim() === "") {
//       handler.setError("maxPaymentInstallment", { type: "required", message: "Max installment is required" });
//       hasErrors = true;
//     } else if (isNaN(Number(values.maxPaymentInstallment)) || Number(values.maxPaymentInstallment) <= 0) {
//       handler.setError("maxPaymentInstallment", { type: "invalid", message: "Max installment must be a valid number" });
//       hasErrors = true;
//     } else {
//       handler.clearErrors("maxPaymentInstallment");
//     }

//     // Validate subjects - all subject names are required
//     if (values.subjects && values.subjects.length > 0) {
//       values.subjects.forEach((subject: any, index: number) => {
//         if (!subject.subjectName || subject.subjectName.trim() === "") {
//           handler.setError(`subjects.${index}.subjectName`, { 
//             type: "required", 
//             message: `Subject name is required` 
//           });
//           hasErrors = true;
//         } else {
//           handler.clearErrors(`subjects.${index}.subjectName`);
//         }
//       });
//     }

//     if (hasErrors) {
//       return;
//     }

//     setConfirmation(true);
//   };

//   const handleFinalSubmit = async () => {
//     const values = handler.getValues();
//     const res = await mutateAsync(values);
//     if (res.statusCode === 200) {
//       // @ts-ignore
//       customAlert.show({ message: "Course updated successfully!" });
//       queryClient.invalidateQueries({ queryKey: [apiUrls.course.FETCH_COURSES_LIST] });
//       onClose();
//     } else {
//       // @ts-ignore
//       customAlert.show({ message: res.message || "Course update failed." });
//     }
//     setConfirmation(false);
//   };

//   return (
//     <SafeView>
//       <AppHeader
//         title="Update Course"
//         showDrawer={false}
//         handleBackClick={onClose}
//       />
//       <View style={styles.screenRoot}>
//         <View style={styles.formCard}>
//           <ThemeScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 20 }}>
//             <ScalableText style={styles.sectionTitle} fontFamily="Medium">
//               Course Details
//             </ScalableText>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Name*
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter course name"
//                 name="courseName"
//                 containerStyles={styles.inputContainer}
//                 maxLength={250}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Description
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter course description"
//                 name="courseDescription"
//                 containerStyles={styles.inputContainer}
//                 maxLength={1000}
//                 multiline={false}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Fee*
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter course fee"
//                 name="courseFee"
//                 keyboardType="numeric"
//                 containerStyles={styles.inputContainer}
//                 maxLength={10}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Fee Description
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter fee description"
//                 name="courseFeeDescription"
//                 containerStyles={styles.inputContainer}
//                 maxLength={200}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Duration (Year)
//               </ScalableText>
//               <ControlledSelect
//                 handler={handler}
//                 label="Select year"
//                 name="courseDurationYear"
//                 options={DURATION_YEAR_OPTIONS}
//                 value={DURATION_YEAR_OPTIONS.find((c) => c.value === handler.watch("courseDurationYear")) || { label: "", value: "" }}
//                 dropdownButtonStyle={styles.inputContainer}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Course Duration (Month)
//               </ScalableText>
//               <ControlledSelect
//                 handler={handler}
//                 label="Select month"
//                 name="courseDurationMonth"
//                 options={DURATION_MONTH_OPTIONS}
//                 value={DURATION_MONTH_OPTIONS.find((c) => c.value === handler.watch("courseDurationMonth")) || { label: "", value: "" }}
//                 dropdownButtonStyle={styles.inputContainer}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Max Payment Installment*
//               </ScalableText>
//               <ControlledSelect
//                 handler={handler}
//                 label="Select max installment"
//                 name="maxPaymentInstallment"
//                 options={INSTALLMENT_OPTIONS}
//                 value={INSTALLMENT_OPTIONS.find((c) => c.value === handler.watch("maxPaymentInstallment")) || { label: "2", value: "2" }}
//                 dropdownButtonStyle={styles.inputContainer}
//               />
//             </View>
            
//             <ScalableText style={styles.subjectsTitle} fontFamily="Medium">
//               Subjects
//             </ScalableText>
//             {fields.map((field, index) => (
//               <View key={field.id} style={styles.subjectRow}>
//                 <View style={styles.inputSpacing}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Subject Name*
//                   </ScalableText>
//                   <Input
//                     handler={handler}
//                     label="Subject name"
//                     name={`subjects.${index}.subjectName`}
//                     containerStyles={styles.inputContainer}
//                     maxLength={250}
//                   />
//                 </View>
//                 <View style={styles.inputSpacing}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Subject Description
//                   </ScalableText>
//                   <Input
//                     handler={handler}
//                     label="Subject description"
//                     name={`subjects.${index}.subjectDescription`}
//                     containerStyles={styles.inputContainer}
//                     maxLength={500}
//                   />
//                 </View>
//                 <Button
//                   title="Remove"
//                   onPress={() => remove(index)}
//                   btnStyles={{ width: 80, height: 28, backgroundColor: COLORS.error, marginBottom: 10 }}
//                   btnTxtStyles={{ fontSize: 11 }}
//                 />
//               </View>
//             ))}
//             <Button
//               title="+ Add Subject"
//               onPress={() => append({ subjectName: "", subjectDescription: "" })}
//               btnStyles={{ width: 120, height: 34, borderRadius: 8, marginBottom: 0 }}
//               btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
//             />
//           </ThemeScrollView>
//         </View>
//         <View style={styles.buttonBelowCardWrapper}>
//           <Button
//             onPress={handler.handleSubmit(onSubmit)}
//             title={isPending ? "Updating..." : "Update"}
//             btnStyles={styles.submitBtn}
//             btnTxtStyles={styles.submitBtnText}
//             disabled={isPending}
//           />
//         </View>
//       </View>
//       {confirmation && (
//         <View style={styles.confirmationModal}>
//           <View style={styles.confirmationBox}>
//             <ScalableText style={{ fontSize: 16, marginBottom: 20 }} fontFamily="Medium">
//               Are you sure you want to update this course?
//             </ScalableText>
//             <Button
//               title="Update Course"
//               onPress={handleFinalSubmit}
//               btnStyles={{ marginBottom: 8, width: 120, height: 34, borderRadius: 8 }}
//               btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
//             />
//             <Button
//               title="Cancel"
//               onPress={() => setConfirmation(false)}
//               btnStyles={{ backgroundColor: COLORS.error, width: 120, height: 34, borderRadius: 8 }}
//               btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
//             />
//           </View>
//         </View>
//       )}
//     </SafeView>
//   );
// };

// export default UpdateCourse;

// const styles = StyleSheet.create({
//   screenRoot: {
//     flex: 1, 
//     backgroundColor: COLORS.whiteSmoke,
//     paddingHorizontal: 10,
//     paddingTop: 20,
//   },
//   formCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     padding: 24,
//     marginHorizontal: 8,
//     marginTop: 15,
//     marginBottom: 0,
//     paddingBottom: 0,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.primary,
//     maxHeight: Dimensions.get('window').height * 0.65,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 24,
//     color: COLORS.black,
//   },
//   inputSpacing: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 15,
//     marginBottom: 8,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   inputContainer: {
//     marginTop: 8,
//   },
//   buttonBelowCardWrapper: {
//     marginTop: 16,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   submitBtn: {
//     width: '90%',
//     alignSelf: 'center',
//     borderRadius: 12,
//   },
//   submitBtnText: {
//     fontSize: 18,
//     fontFamily: "Poppins-Medium",
//     color: COLORS.white,
//   },
//   confirmationModal: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   confirmationBox: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 30,
//     alignItems: "center",
//     elevation: 5,
//     width: "80%",
//   },
//   subjectRow: {
//     backgroundColor: COLORS.whiteSmoke,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//     elevation: 1,
//   },
//   subjectsTitle: {
//     fontSize: 16,
//     marginTop: 10,
//     marginBottom: 8,
//     color: COLORS.primary,
//   },
// }); 



import React, { useState } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { useNavigation } from "@react-navigation/native";
import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
import { StyleSheet, View, Dimensions } from "react-native";
import { COLORS } from "../../../colors";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forms } from "../../../forms";
import Input from "../../../@ui/input/Input";
import ControlledSelect from "../../../@ui/controlled-select/ControlledSelect";
import Button from "../../../@ui/button/Button";
import { useUpdateCourseMutation } from "../../../apis/hooks/courses/mutation/useUpdateCourse.mutation";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../apis/urls";
import { store } from "../../../app/store";

interface UpdateCourseProps {
  courseData: any;
  onClose: () => void;
}

const MODE_OPTIONS = [
  { label: "Offline", value: "offline" },
  { label: "Online", value: "online" },
];

const DURATION_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  label: `${i + 1} Year${i === 0 ? "" : "s"}`,
  value: `${i + 1}`,
}));

const DURATION_MONTH_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 1} Month${i === 0 ? "" : "s"}`,
  value: `${i + 1}`,
}));

const INSTALLMENT_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 2}`,
  value: `${i + 2}`,
}));

const UpdateCourse = ({ courseData, onClose }: UpdateCourseProps) => {
  console.log('UpdateCourse component rendered with data:', courseData);
  const navigation = useNavigation<TScreenNavigator>();
  const [confirmation, setConfirmation] = useState(false);
  
  // Get organization data from store for GST calculations
  const organizationData = store.getState().organization.organization;
  const gstRuleData = organizationData?.gstRuleData;
  
  console.log('🏢 UpdateCourse - Organization GST Data:', gstRuleData);
  console.log('🏢 UpdateCourse - GST Inclusion Type:', gstRuleData?.inclusionType);
  console.log('🏢 UpdateCourse - CGST Enabled:', gstRuleData?.cgstEnabled);
  console.log('🏢 UpdateCourse - SGST Enabled:', gstRuleData?.sgstEnabled);
  
  // Pre-fill form with existing course data
  const defaultValues = {
    courseId: courseData?.courseId || "",
    courseName: courseData?.courseName || "",
    courseDescription: courseData?.courseDescription || "",
    courseFee: courseData?.courseFee || "",
    courseFeeDescription: courseData?.courseFeeDescription || "",
    courseDurationYear: courseData?.courseDuration ? String(Math.floor(courseData.courseDuration / 12)) : "",
    courseDurationMonth: courseData?.courseDuration ? String(courseData.courseDuration % 12) : "",
    maxPaymentInstallment: courseData?.maxPaymentInstallment
  ? String(courseData.maxPaymentInstallment)
  : "",

    subjects: courseData?.subjects || [],
  };

  const handler = useForm({
    defaultValues,
    reValidateMode: "onSubmit",
    mode: "all",
  });

  const { fields, append, remove } = useFieldArray({
    control: handler.control,
    name: "subjects",
  });

  const { mutateAsync, isPending } = useUpdateCourseMutation();
  const queryClient = useQueryClient();

  // Function to calculate GST amounts
  const calculateGSTAmounts = (baseAmount: number) => {
    if (!gstRuleData || gstRuleData.inclusionType === 'noGST') {
      return {
        cgstAmount: 0,
        sgstAmount: 0,
        totalGSTAmount: 0,
        amountAfterGST: baseAmount,
        tuitionFee: baseAmount
      };
    }
  
    let cgstAmount = 0;
    let sgstAmount = 0;
    let tuitionFee = baseAmount;
    let amountAfterGST = baseAmount;
  
    if (gstRuleData.inclusionType === 'included') {
      cgstAmount = gstRuleData.cgstEnabled
        ? Math.round((baseAmount * gstRuleData.cgstPercentage) / 100)
        : 0;
  
      sgstAmount = gstRuleData.sgstEnabled
        ? Math.round((baseAmount * gstRuleData.sgstPercentage) / 100)
        : 0;
  
      tuitionFee = baseAmount - (cgstAmount + sgstAmount);
      amountAfterGST = baseAmount;
    }
  
    if (gstRuleData.inclusionType === 'excluded') {
      cgstAmount = gstRuleData.cgstEnabled
        ? Math.round((baseAmount * gstRuleData.cgstPercentage) / 100)
        : 0;
  
      sgstAmount = gstRuleData.sgstEnabled
        ? Math.round((baseAmount * gstRuleData.sgstPercentage) / 100)
        : 0;
  
      tuitionFee = baseAmount;
      amountAfterGST = baseAmount + cgstAmount + sgstAmount;
    }
  
    return {
      cgstAmount,
      sgstAmount,
      totalGSTAmount: cgstAmount + sgstAmount,
      amountAfterGST,
      tuitionFee
    };
  };

  // Get current course fee for GST calculations
  const currentCourseFee = parseFloat(handler.watch('courseFee')) || 0;
  const gstAmounts = calculateGSTAmounts(currentCourseFee);

  const onSubmit: Parameters<typeof handler.handleSubmit>[0] = async (values) => {
    // Check if any fields have been modified
    const hasChanges = 
      values.courseName !== courseData?.courseName ||
      values.courseDescription !== courseData?.courseDescription ||
      values.courseFee !== courseData?.courseFee ||
      values.courseFeeDescription !== courseData?.courseFeeDescription ||
      values.courseDurationYear !== (courseData?.courseDuration ? String(Math.floor(courseData.courseDuration / 12)) : "") ||
      values.courseDurationMonth !== (courseData?.courseDuration ? String(courseData.courseDuration % 12) : "") ||
      values.maxPaymentInstallment !== courseData?.maxPaymentInstallment ||
      JSON.stringify(values.subjects) !== JSON.stringify(courseData?.subjects || []);

    if (!hasChanges) {
      // @ts-ignore
      customAlert.show({ message: "No changes detected. Please modify at least one field before updating." });
      return;
    }

    // Validate mandatory fields and set errors on specific fields
    let hasErrors = false;

    if (!values.courseName || values.courseName.trim() === "") {
      handler.setError("courseName", { type: "required", message: "Course name is required" });
      hasErrors = true;
    } else {
      handler.clearErrors("courseName");
    }

    if (!values.courseFee || values.courseFee.toString().trim() === "") {
      handler.setError("courseFee", { type: "required", message: "Course fee is required" });
      hasErrors = true;
    } else if (isNaN(Number(values.courseFee)) || Number(values.courseFee) <= 0) {
      handler.setError("courseFee", { type: "invalid", message: "Course fee must be a valid number" });
      hasErrors = true;
    } else {
      handler.clearErrors("courseFee");
    }

    if (!values.maxPaymentInstallment || values.maxPaymentInstallment.toString().trim() === "") {
      handler.setError("maxPaymentInstallment", { type: "required", message: "Max installment is required" });
      hasErrors = true;
    } else if (isNaN(Number(values.maxPaymentInstallment)) || Number(values.maxPaymentInstallment) <= 0) {
      handler.setError("maxPaymentInstallment", { type: "invalid", message: "Max installment must be a valid number" });
      hasErrors = true;
    } else {
      handler.clearErrors("maxPaymentInstallment");
    }

    // Validate subjects - all subject names are required
    if (values.subjects && values.subjects.length > 0) {
      values.subjects.forEach((subject: any, index: number) => {
        if (!subject.subjectName || subject.subjectName.trim() === "") {
          handler.setError(`subjects.${index}.subjectName`, { 
            type: "required", 
            message: `Subject name is required` 
          });
          hasErrors = true;
        } else {
          handler.clearErrors(`subjects.${index}.subjectName`);
        }
      });
    }

    if (hasErrors) {
      return;
    }

    setConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    const values = handler.getValues();
    const res = await mutateAsync(values);
    if (res.statusCode === 200) {
      // @ts-ignore
      customAlert.show({ message: "Course updated successfully!" });
      queryClient.invalidateQueries({ queryKey: [apiUrls.course.FETCH_COURSES_LIST] });
      onClose();
    } else {
      // @ts-ignore
      customAlert.show({ message: res.message || "Course update failed." });
    }
    setConfirmation(false);
  };

  return (
    <SafeView>
      <AppHeader
        title="Update Course"
        showDrawer={false}
        handleBackClick={onClose}
      />
      <View style={styles.screenRoot}>
        <View style={styles.formCard}>
          <ThemeScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <ScalableText style={styles.sectionTitle} fontFamily="Medium">
              Course Details
            </ScalableText>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
              Name*
              </ScalableText>
              <Input
                handler={handler}
                label="Enter course name"
                name="courseName"
                containerStyles={styles.inputContainer}
                maxLength={250}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
              Description
              </ScalableText>
              <Input
                handler={handler}
                label="Enter course description"
                name="courseDescription"
                containerStyles={styles.inputContainer}
                maxLength={1000}
                multiline={false}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
               Fee*
              </ScalableText>
              <Input
                handler={handler}
                label="Enter course fee"
                name="courseFee"
                keyboardType="numeric"
                containerStyles={styles.inputContainer}
                maxLength={10}
                onChangeText={(text) => {
                  handler.setValue('courseFee', text);
                }}
                onBlur={() => {
                  // Trim leading/trailing spaces when field loses focus
                  const currentValue = handler.getValues('courseFee');
                  if (currentValue) {
                    handler.setValue('courseFee', currentValue.trim());
                  }
                }}
              />
              
              {/* GST Breakdown Section - Only show when GST is enabled and fee is entered */}
              {gstRuleData && gstRuleData.inclusionType !== 'noGST' && currentCourseFee > 0 && (
                <View style={styles.gstBreakdownContainer}>
                  <ScalableText style={styles.gstBreakdownTitle} fontFamily="Medium">
                  Fee Breakdown
                  </ScalableText>
                  
                  {/* Tuition Fee (Excl. GST) - Show for both included and excluded GST */}
                  <View style={styles.breakdownRow}>
                  <ScalableText style={styles.breakdownLabel} fontFamily="Regular">
  Tuition Fee:{'\n'}(Excl. GST)
</ScalableText>
                    
                    <ScalableText style={styles.breakdownValue} fontFamily="Medium">
                    ₹{gstAmounts.tuitionFee.toLocaleString('en-IN')}.00
                    </ScalableText>
                  </View>
                  
                  {/* CGST */}
                  {gstRuleData.cgstEnabled && (
                    <View style={styles.breakdownRow}>
                      <ScalableText style={styles.breakdownLabel} fontFamily="Regular">
                        CGST ({gstRuleData.cgstPercentage}%):
                      </ScalableText>
                      <ScalableText style={styles.breakdownValue} fontFamily="Medium">
                        ₹{gstAmounts.cgstAmount.toLocaleString('en-IN')}.00
                      </ScalableText>
                    </View>
                  )}
                  
                  {/* SGST */}
                  {gstRuleData.sgstEnabled && (
                    <View style={styles.breakdownRow}>
                      <ScalableText style={styles.breakdownLabel} fontFamily="Regular">
                        SGST ({gstRuleData.sgstPercentage}%):
                      </ScalableText>
                      <ScalableText style={styles.breakdownValue} fontFamily="Medium">
                        ₹{gstAmounts.sgstAmount.toLocaleString('en-IN')}.00
                      </ScalableText>
                    </View>
                  )}
                  
                  {/* Total Course Fee */}
                  <View style={styles.breakdownRow}>
                    <ScalableText style={styles.breakdownLabel} fontFamily="Medium">
                      Course Fee:
                    </ScalableText>
                    <ScalableText style={styles.breakdownValue} fontFamily="Medium">
                      ₹{gstAmounts.amountAfterGST.toLocaleString('en-IN')}.00
                    </ScalableText>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
              Fee Description
              </ScalableText>
              <Input
                handler={handler}
                label="Enter fee description"
                name="courseFeeDescription"
                containerStyles={styles.inputContainer}
                maxLength={200}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
              Duration (Year)
              </ScalableText>
              <ControlledSelect
                handler={handler}
                label="Select year"
                name="courseDurationYear"
                options={DURATION_YEAR_OPTIONS}
                value={DURATION_YEAR_OPTIONS.find((c) => c.value === handler.watch("courseDurationYear")) || { label: "", value: "" }}
                dropdownButtonStyle={styles.inputContainer}
                showClearButton={true}
                onClear={() => {
                  handler.setValue("courseDurationYear", "");
                  handler.setValue("courseDurationMonth", "");
                }}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
              Duration (Month)
              </ScalableText>
              <ControlledSelect
                handler={handler}
                label="Select month"
                name="courseDurationMonth"
                options={DURATION_MONTH_OPTIONS}
                value={DURATION_MONTH_OPTIONS.find((c) => c.value === handler.watch("courseDurationMonth")) || { label: "", value: "" }}
                dropdownButtonStyle={styles.inputContainer}
                showClearButton={true}
                onClear={() => {
                  handler.setValue("courseDurationYear", "");
                  handler.setValue("courseDurationMonth", "");
                }}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Max Payment Installment*
              </ScalableText>
              <ControlledSelect
                handler={handler}
                label="Select max installment"
                name="maxPaymentInstallment"
                options={INSTALLMENT_OPTIONS}
                value={INSTALLMENT_OPTIONS.find((c) => c.value === handler.watch("maxPaymentInstallment")) || { label: "2", value: "2" }}
                dropdownButtonStyle={styles.inputContainer}
              />
            </View>
            
            <ScalableText style={styles.subjectsTitle} fontFamily="Medium">
              Subjects
            </ScalableText>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.subjectRow}>
                <View style={styles.inputSpacing}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Subject Name*
                  </ScalableText>
                  <Input
                    handler={handler}
                    label="Subject name"
                    name={`subjects.${index}.subjectName`}
                    containerStyles={styles.inputContainer}
                    maxLength={250}
                  />
                </View>
                <View style={styles.inputSpacing}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Subject Description
                  </ScalableText>
                  <Input
                    handler={handler}
                    label="Subject description"
                    name={`subjects.${index}.subjectDescription`}
                    containerStyles={styles.inputContainer}
                    maxLength={500}
                  />
                </View>
                <Button
                  title="Remove"
                  onPress={() => remove(index)}
                  btnStyles={{ width: 80, height: 28, backgroundColor: COLORS.error, marginBottom: 10 }}
                  btnTxtStyles={{ fontSize: 11 }}
                />
              </View>
            ))}
            <Button
              title="+ Add Subject"
              onPress={() => append({ subjectName: "", subjectDescription: "" })}
              btnStyles={{ width: 120, height: 34, borderRadius: 8, marginBottom: 0 }}
              btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
            />
          </ThemeScrollView>
        </View>
        <View style={styles.buttonBelowCardWrapper}>
          <Button
            onPress={handler.handleSubmit(onSubmit)}
            title={isPending ? "Updating..." : "Update"}
            btnStyles={styles.submitBtn}
            btnTxtStyles={styles.submitBtnText}
            disabled={isPending}
          />
        </View>
      </View>
      {confirmation && (
        <View style={styles.confirmationModal}>
          <View style={styles.confirmationBox}>
            <ScalableText style={{ fontSize: 16, marginBottom: 20 }} fontFamily="Medium">
              Are you sure you want to update this course?
            </ScalableText>
            <Button
              title="Update Course"
              onPress={handleFinalSubmit}
              btnStyles={{ marginBottom: 8, width: 120, height: 34, borderRadius: 8 }}
              btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
            />
            <Button
              title="Cancel"
              onPress={() => setConfirmation(false)}
              btnStyles={{ backgroundColor: COLORS.error, width: 120, height: 34, borderRadius: 8 }}
              btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
            />
          </View>
        </View>
      )}
    </SafeView>
  );
};

export default UpdateCourse;

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1, 
    backgroundColor: COLORS.whiteSmoke,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 24,
    marginHorizontal: 8,
    marginTop: 15,
    marginBottom: 0,
    paddingBottom: 0,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    maxHeight: Dimensions.get('window').height * 0.65,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: COLORS.black,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: -2,
    color: COLORS.black,
    fontFamily: "Poppins-Medium",
  },
  inputContainer: {
    marginTop: 8,
  },
  gstBreakdownContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gstBreakdownTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-Medium',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  breakdownValue: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: 'Poppins-Medium',
  },
  buttonBelowCardWrapper: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitBtn: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: COLORS.white,
  },
  confirmationModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    elevation: 5,
    width: "80%",
  },
  subjectRow: {
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  subjectsTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    color: COLORS.primary,
  },
}); 

