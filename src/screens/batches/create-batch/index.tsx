// import React, { useMemo, useState, useEffect } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import { useNavigation } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
// import { StyleSheet, View, Dimensions } from "react-native";
// import { COLORS } from "../../../colors";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { forms } from "../../../forms";
// import Input from "../../../@ui/input/Input";
// import ControlledSelect from "../../../@ui/controlled-select/ControlledSelect";
// import CalendarInput from "../../../@ui/calendar-input/CalendarInput";
// import Button from "../../../@ui/button/Button";
// import { useCourseListsQuery } from "../../../apis/hooks/course/query/useCourseLists.query";
// import { useCreateBatchMutation } from "../../../apis/hooks/batch/mutation/useCreateBatch.mutation";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { useQueryClient } from "@tanstack/react-query";
// import { apiUrls } from "../../../apis/urls";

// const CreateBatch = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const [confirmation, setConfirmation] = useState(false);
//   const handler = useForm({
//     defaultValues: forms.createBatch.values,
//     resolver: yupResolver(forms.createBatch.validation),
//     reValidateMode: "onChange",
//     mode: "onChange",
//   });
//   const { mutateAsync, isPending } = useCreateBatchMutation();
//   const queryClient = useQueryClient();
//   const { data: courseData, isLoading: courseLoading } = useCourseListsQuery();

//   // Function to calculate default batch dates based on course data
//   const calculateDefaultBatchDates = (courseId: string) => {
//     if (!courseData?.data) return { startDate: null, endDate: null };
    
//     const selectedCourse = courseData.data.find((course: any) => course.courseId === courseId);
//     if (!selectedCourse) return { startDate: null, endDate: null };
    
//     console.log('=== BATCH DATE CALCULATION DEBUG ===');
//     console.log('Selected Course:', selectedCourse);
//     console.log('Course Date Created:', selectedCourse.dateCreated);
//     console.log('Course Expiry Date:', selectedCourse.courseExpiryDate);
    
//     // Use course creation date as batch start date
//     const startDate = new Date(selectedCourse.dateCreated);
    
//     // Use course expiry date as batch end date (only if it exists)
//     let endDate = null;
//     if (selectedCourse.courseExpiryDate) {
//       // Parse the expiry date (format: "29-10-2026")
//       const expiryDateParts = selectedCourse.courseExpiryDate.split('-');
//       endDate = new Date(
//         parseInt(expiryDateParts[2]), // year
//         parseInt(expiryDateParts[1]) - 1, // month (0-indexed)
//         parseInt(expiryDateParts[0]) // day
//       );
//     }
    
//     console.log('Parsed Start Date (from course creation):', startDate);
//     console.log('Parsed End Date (from course expiry):', endDate);
    
//     // Format dates in YYYY-MM-DD format for CalendarInput
//     const formatDateForInput = (date: Date) => {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };
    
//     const result = {
//       startDate: formatDateForInput(startDate),
//       endDate: endDate ? formatDateForInput(endDate) : null
//     };
    
//     console.log('Final Start Date:', result.startDate);
//     console.log('Final End Date:', result.endDate);
//     console.log('=== END BATCH DATE CALCULATION DEBUG ===');
    
//     return result;
//   };

//   // Handle course selection and set default dates
//   const handleCourseChange = (courseId: string) => {
//     console.log('=== COURSE CHANGE HANDLER DEBUG ===');
//     console.log('Course ID received:', courseId);
    
//     if (courseId) {
//       // Log the selected course data for debugging
//       const selectedCourse = courseData?.data?.find((course: any) => course.courseId === courseId);
//       console.log('Selected course data:', selectedCourse);
//       console.log('Course duration from API:', selectedCourse?.courseDuration);
      
//       const defaultDates = calculateDefaultBatchDates(courseId);
//       console.log('Default dates calculated:', defaultDates);
      
//       if (defaultDates.startDate) {
//         console.log('Setting start date to:', defaultDates.startDate);
//         handler.setValue('batchStartDate', defaultDates.startDate);
//       }
//       if (defaultDates.endDate) {
//         console.log('Setting end date to:', defaultDates.endDate);
//         handler.setValue('batchEndDate', defaultDates.endDate);
//       }
      
//       // Verify the values were set
//       console.log('Form values after setting dates:', handler.getValues());
      
//       // Force form to re-render with new values
//       handler.trigger(['batchStartDate', 'batchEndDate']);
      
//       // Additional debugging for CalendarInput
//       setTimeout(() => {
//         console.log('Form values after timeout:', handler.getValues());
//         console.log('batchStartDate value:', handler.watch('batchStartDate'));
//         console.log('batchEndDate value:', handler.watch('batchEndDate'));
//       }, 100);
//     }
//     console.log('=== END COURSE CHANGE HANDLER DEBUG ===');
//   };

//   // Watch for course changes and update dates automatically
//   useEffect(() => {
//     const selectedCourseId = handler.watch('courseId');
//     if (selectedCourseId && courseData?.data) {
//       console.log('Course changed to:', selectedCourseId);
//       handleCourseChange(selectedCourseId);
//     }
//   }, [handler.watch('courseId'), courseData]);

//   // Watch for date field changes to debug CalendarInput
//   useEffect(() => {
//     const subscription = handler.watch((value, { name }) => {
//       if (name === 'batchStartDate' || name === 'batchEndDate') {
//         console.log(`Field ${name} changed to:`, value[name]);
//       }
//     });
//     return () => subscription.unsubscribe();
//   }, [handler]);

//   const COURSES_LIST = useMemo(() => {
//     return courseData?.data
//       ? courseData.data.map((course: { courseName: string; courseId: string }) => ({
//           label: course.courseName,
//           value: course.courseId,
//         }))
//       : [];
//   }, [courseData]);

//   const onSubmit: Parameters<typeof handler.handleSubmit>[0] = async (values) => {
//     setConfirmation(true);
//   };

//   const handleFinalSubmit = async () => {
//     const values = handler.getValues();
//     const res = await mutateAsync(values);
//     if (res.statusCode === 200) {
//       // @ts-ignore
//       customAlert.show({ message: "Batch created successfully!" });
//       queryClient.invalidateQueries({ queryKey: [apiUrls.batch.FETCH_BATCHES_LIST] });
//       handler.reset();
//       navigation.goBack();
//     } else {
//       // @ts-ignore
//       customAlert.show({ message: res.message || "Batch creation failed." });
//     }
//     setConfirmation(false);
//   };

//   const TIME_OPTIONS = Array.from({ length: 72 }, (_, i) => {
//     const hour = Math.floor(i / 4) + 6; // Start at 6:00 AM
//     const minute = (i % 4) * 15;
//     const date = new Date();
//     date.setHours(hour, minute, 0, 0);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const displayHour = hour % 12 === 0 ? 12 : hour % 12;
//     const label = `${displayHour.toString().padStart(2, '0')}:${minute
//       .toString()
//       .padStart(2, '0')} ${ampm}`;
//     return { label, value: label };
//   });

//   return (
//     <SafeView>
//       <AppHeader
//         title="Add Batch"
//         showDrawer={false}
//         handleBackClick={() => navigation.goBack()}
//       />
//       <View style={styles.screenRoot}>
//         <View style={styles.formCard}>
//           <ThemeScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom:20}}>
//             <ScalableText style={styles.sectionTitle} fontFamily="Medium">
//               Batch Details
//             </ScalableText>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Batch Name*
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter batch name"
//                 name="batchName"
//                 containerStyles={styles.inputContainer}
//                 maxLength={250}
//                 onChangeText={(text) => {
//                   handler.setValue('batchName', text);
//                 }}
//                 onBlur={() => {
//                   // Trim leading/trailing spaces when field loses focus
//                   const currentValue = handler.getValues('batchName');
//                   if (currentValue) {
//                     handler.setValue('batchName', currentValue.trim());
//                   }
//                 }}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Batch Description
//               </ScalableText>
//               <Input
//                 handler={handler}
//                 label="Enter batch description"
//                 name="batchDescription"
//                 containerStyles={styles.inputContainer}
//                 maxLength={500}
//                 onChangeText={(text) => {
//                   handler.setValue('batchDescription', text);
//                 }}
//                 onBlur={() => {
//                   // Trim leading/trailing spaces when field loses focus
//                   const currentValue = handler.getValues('batchDescription');
//                   if (currentValue) {
//                     handler.setValue('batchDescription', currentValue.trim());
//                   }
//                 }}
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 {courseLoading ? "Loading..." : "Select Course*"}
//               </ScalableText>
//               <ControlledSelect
//                 handler={handler}
//                 label="Select course"
//                 name="courseId"
//                 options={COURSES_LIST}
//                 value={COURSES_LIST.find((c: { label: string; value: string }) => c.value === handler.watch("courseId")) || { label: "", value: "" }}
//                 dropdownButtonStyle={{
//                   ...styles.inputContainer,
//                   ...(COURSES_LIST.length === 0 && { opacity: 0.6 })
//                 }}
//                 disabled={COURSES_LIST.length === 0}
//                 onChangeValue={(selectedValue: string) => {
//                   handler.setValue('courseId', selectedValue);
//                   handleCourseChange(selectedValue);
//                 }}
//               />
//               {COURSES_LIST.length === 0 && !courseLoading && (
//                 <ScalableText style={styles.helperText} fontFamily="Regular">
//                   No courses available. Please create a course first.
//                 </ScalableText>
//               )}
//               {/* Show course info when course is selected */}
//               {handler.watch("courseId") && courseData?.data && (
//                 (() => {
//                   const selectedCourse = courseData.data.find((course: any) => course.courseId === handler.watch("courseId"));
//                   if (selectedCourse) {
//                     // Format the dates for display
//                     const startDate = new Date(selectedCourse.dateCreated).toLocaleDateString('en-GB');
//                     const endDate = selectedCourse.courseExpiryDate || 'Not set';
                    
//                     return (
//                       <ScalableText style={styles.helperText} fontFamily="Regular">
//                         Batch dates: Start from course creation ({startDate}) | End on course expiry ({endDate})
//                       </ScalableText>
//                     );
//                   }
//                   return null;
//                 })()
//               )}
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Batch Start Date*
//               </ScalableText>
//               <CalendarInput
//                 label="Select start date"
//                 handler={handler}
//                 name="batchStartDate"
//               />
//             </View>
//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Batch End Date*
//               </ScalableText>
//               <CalendarInput
//                 label="Select end date"
//                 handler={handler}
//                 name="batchEndDate"
//               />
//             </View>
            

//             <View style={styles.inputSpacing}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Do you want to set batch time?*
//               </ScalableText>
//               <ControlledSelect
//                 handler={handler}
//                 label="Select option"
//                 name="setBatchTime"
//                 options={[
//                   { label: "Yes", value: "Yes" },
//                   { label: "No", value: "No" },
//                 ]}
//                 value={handler.watch("setBatchTime") ? { label: handler.watch("setBatchTime"), value: handler.watch("setBatchTime") } : { label: "", value: "" }}
//                 dropdownButtonStyle={styles.inputContainer}
//               />
//             </View>
//             {handler.watch("setBatchTime") === "Yes" && (
//               <>
//                 <View style={styles.inputSpacing}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Batch Class Start Time*
//                   </ScalableText>
//                   <ControlledSelect
//                     handler={handler}
//                     label="Select start time"
//                     name="batchClassStartTime"
//                     options={TIME_OPTIONS}
//                     value={handler.watch("batchClassStartTime") ? { label: handler.watch("batchClassStartTime") || "", value: handler.watch("batchClassStartTime") || "" } : { label: "", value: "" }}
//                     dropdownButtonStyle={styles.inputContainer}
//                   />
//                 </View>
//                 <View style={styles.inputSpacing}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Batch Class End Time*
//                   </ScalableText>
//                   <ControlledSelect
//                     handler={handler}
//                     label="Select end time"
//                     name="batchClassEndTime"
//                     options={TIME_OPTIONS}
//                     value={handler.watch("batchClassEndTime") ? { label: handler.watch("batchClassEndTime") || "", value: handler.watch("batchClassEndTime") || "" } : { label: "", value: "" }}
//                     dropdownButtonStyle={styles.inputContainer}
//                   />
//                 </View>
//               </>
//             )}
//           </ThemeScrollView>
//         </View>
//         <View style={styles.buttonBelowCardWrapper}>
//           <Button
//             onPress={handler.handleSubmit(onSubmit)}
//             title={isPending ? "Submitting..." : "Submit"}
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
//               Are you sure you want to create this batch?
//             </ScalableText>
//             <Button
//               title="Create Batch"
//               onPress={handleFinalSubmit}
//               btnStyles={{ marginBottom: 8, width: 105, height: 34, borderRadius: 8 }}
//               btnTxtStyles={{ fontSize: 11, fontFamily: 'Poppins-Medium' }}
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

// export default CreateBatch;

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
//     maxHeight: Dimensions.get('window').height * 0.55,
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
//   inputLabel: {
//     fontSize: 15,
//     marginBottom: 8,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   inputContainer: {
//     marginTop: 8,
//   },
//   helperText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//     marginLeft: 4,
//     fontStyle: 'italic',
//   },

// }); 

import React, { useMemo, useState, useEffect } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { TScreenNavigator, TScreenNavigatorParams } from "../../../types/navigator/screen-navigator";
import { StyleSheet, View, Dimensions } from "react-native";
import { COLORS } from "../../../colors";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forms } from "../../../forms";
import Input from "../../../@ui/input/Input";
import ControlledSelect from "../../../@ui/controlled-select/ControlledSelect";
import CalendarInput from "../../../@ui/calendar-input/CalendarInput";
import Button from "../../../@ui/button/Button";
import { useCourseListsQuery } from "../../../apis/hooks/course/query/useCourseLists.query";
import { useCourseDetailsQuery } from "../../../apis/hooks/course/query/useCourseDetails.query";
import { useCreateBatchMutation } from "../../../apis/hooks/batch/mutation/useCreateBatch.mutation";
import { useUpdateBatchMutation } from "../../../apis/hooks/batch/mutation/useUpdateBatch.mutation";
import { useUpdateCourseMutation } from "../../../apis/hooks/courses/mutation/useUpdateCourse.mutation";
import { useBatchDetailsQuery } from "../../../apis/hooks/batch/query/useBatchDetails.query";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../apis/urls";

const CreateBatch = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const route = useRoute<RouteProp<TScreenNavigatorParams, "CreateBatch">>();
  const courseIdFromRoute = route.params?.courseId;
  const [confirmation, setConfirmation] = useState(false);
  const handler = useForm({
    defaultValues: forms.createBatch.values,
    resolver: yupResolver(forms.createBatch.validation),
    reValidateMode: "onChange",
    mode: "onChange",
  });
  const { mutateAsync: createBatch, isPending } = useCreateBatchMutation();
  const { mutateAsync: updateBatch } = useUpdateBatchMutation();
  const { mutateAsync: updateCourse } = useUpdateCourseMutation();
  const queryClient = useQueryClient();
  const { data: courseData, isLoading: courseLoading } = useCourseListsQuery();
  
  // Fetch course details if courseId is provided from route
  const { data: courseDetailsData } = useCourseDetailsQuery(
    courseIdFromRoute ? { courseId: courseIdFromRoute } : { courseId: "" }
  );

  // Function to calculate end date from start date and course duration (in months)
  const calculateEndDateFromDuration = (startDateStr: string, durationMonths: number): string | null => {
    if (!startDateStr || !durationMonths) return null;
    
    try {
      // Parse start date (format: YYYY-MM-DD)
      const startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) return null;
      
      // Create a new date object to avoid mutating the original
      const endDate = new Date(startDate);
      
      // Add months to the start date
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      // Format date in YYYY-MM-DD format for CalendarInput
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error calculating end date:', error);
      return null;
    }
  };

  // Function to calculate default batch dates based on course data
  const calculateDefaultBatchDates = (courseId: string) => {
    if (!courseData?.data) return { startDate: null, endDate: null };
    
    const selectedCourse = courseData.data.find((course: any) => course.courseId === courseId);
    if (!selectedCourse) return { startDate: null, endDate: null };
    
    console.log('=== BATCH DATE CALCULATION DEBUG ===');
    console.log('Selected Course:', selectedCourse);
    console.log('Course Date Created:', selectedCourse.dateCreated);
    console.log('Course Duration (months):', selectedCourse.courseDuration);
    
    // Use course creation date as batch start date
    const startDate = new Date(selectedCourse.dateCreated);
    
    // Calculate end date from course duration instead of using expiry date
    let endDate = null;
    if (selectedCourse.courseDuration) {
      // Calculate end date by adding course duration (in months) to start date
      const tempEndDate = new Date(startDate);
      tempEndDate.setMonth(tempEndDate.getMonth() + selectedCourse.courseDuration);
      endDate = tempEndDate;
    } else if (selectedCourse.courseExpiryDate) {
      // Fallback to course expiry date if duration is not available
      const expiryDateParts = selectedCourse.courseExpiryDate.split('-');
      endDate = new Date(
        parseInt(expiryDateParts[2]), // year
        parseInt(expiryDateParts[1]) - 1, // month (0-indexed)
        parseInt(expiryDateParts[0]) // day
      );
    }
    
    console.log('Parsed Start Date (from course creation):', startDate);
    console.log('Calculated End Date (from duration):', endDate);
    
    // Format dates in YYYY-MM-DD format for CalendarInput
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const result = {
      startDate: formatDateForInput(startDate),
      endDate: endDate ? formatDateForInput(endDate) : null
    };
    
    console.log('Final Start Date:', result.startDate);
    console.log('Final End Date:', result.endDate);
    console.log('=== END BATCH DATE CALCULATION DEBUG ===');
    
    return result;
  };

  // Handle course selection and set default dates
  const handleCourseChange = (courseId: string) => {
    console.log('=== COURSE CHANGE HANDLER DEBUG ===');
    console.log('Course ID received:', courseId);
    
    if (courseId) {
      // Log the selected course data for debugging
      const selectedCourse = courseData?.data?.find((course: any) => course.courseId === courseId);
      console.log('Selected course data:', selectedCourse);
      console.log('Course duration from API:', selectedCourse?.courseDuration);
      
      const defaultDates = calculateDefaultBatchDates(courseId);
      console.log('Default dates calculated:', defaultDates);
      
      if (defaultDates.startDate) {
        console.log('Setting start date to:', defaultDates.startDate);
        handler.setValue('batchStartDate', defaultDates.startDate);
      }
      if (defaultDates.endDate) {
        console.log('Setting end date to:', defaultDates.endDate);
        handler.setValue('batchEndDate', defaultDates.endDate);
      }
      
      // Verify the values were set
      console.log('Form values after setting dates:', handler.getValues());
      
      // Force form to re-render with new values
      handler.trigger(['batchStartDate', 'batchEndDate']);
      
      // Additional debugging for CalendarInput
      setTimeout(() => {
        console.log('Form values after timeout:', handler.getValues());
        console.log('batchStartDate value:', handler.watch('batchStartDate'));
        console.log('batchEndDate value:', handler.watch('batchEndDate'));
      }, 100);
    }
    console.log('=== END COURSE CHANGE HANDLER DEBUG ===');
  };

  // Pre-select course if courseId is provided from route
  useEffect(() => {
    if (courseIdFromRoute && courseData?.data && !handler.watch('courseId')) {
      handler.setValue('courseId', courseIdFromRoute);
      handleCourseChange(courseIdFromRoute);
    }
  }, [courseIdFromRoute, courseData]);

  // Watch for course changes and update dates automatically
  useEffect(() => {
    const selectedCourseId = handler.watch('courseId');
    if (selectedCourseId && courseData?.data) {
      console.log('Course changed to:', selectedCourseId);
      handleCourseChange(selectedCourseId);
    }
  }, [handler.watch('courseId'), courseData]);

  // Watch for date field changes to debug CalendarInput
  useEffect(() => {
    const subscription = handler.watch((value, { name }) => {
      if (name === 'batchStartDate' || name === 'batchEndDate') {
        console.log(`Field ${name} changed to:`, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [handler]);

  // Automatically calculate and update end date when start date changes
  useEffect(() => {
    const startDate = handler.watch('batchStartDate');
    const courseId = handler.watch('courseId');
    
    // Only auto-calculate if both start date and course are selected
    if (startDate && courseId && courseData?.data) {
      const selectedCourse = courseData.data.find((course: any) => course.courseId === courseId);
      
      if (selectedCourse && selectedCourse.courseDuration) {
        // Calculate end date from start date + course duration
        const calculatedEndDate = calculateEndDateFromDuration(startDate, selectedCourse.courseDuration);
        
        if (calculatedEndDate) {
          console.log('=== AUTO CALCULATING END DATE ===');
          console.log('Start Date:', startDate);
          console.log('Course Duration (months):', selectedCourse.courseDuration);
          console.log('Calculated End Date:', calculatedEndDate);
          console.log('=== END AUTO CALCULATION ===');
          
          // Update the end date field
          handler.setValue('batchEndDate', calculatedEndDate, { 
            shouldValidate: true,
            shouldDirty: true 
          });
        }
      }
    }
  }, [handler.watch('batchStartDate'), handler.watch('courseId'), courseData]);

  const COURSES_LIST = useMemo(() => {
    return courseData?.data
      ? courseData.data.map((course: { courseName: string; courseId: string }) => ({
          label: course.courseName,
          value: course.courseId,
        }))
      : [];
  }, [courseData]);

  const onSubmit: Parameters<typeof handler.handleSubmit>[0] = async (values) => {
    setConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    const values = handler.getValues();
    try {
      // Step 1: Create batch
      const createRes = await createBatch(values);
      if (createRes.statusCode !== 200) {
        // @ts-ignore
        customAlert.show({ message: createRes.message || "Batch creation failed." });
        setConfirmation(false);
        return;
      }

      // Get batchId from response - response structure: { data: [{ batchId: "...", ... }] }
      const batchId = Array.isArray(createRes?.data) && createRes.data.length > 0
        ? createRes.data[0].batchId
        : createRes?.data?.batchId || createRes?.data?.batch?.[0]?.batchId;
      
      if (!batchId) {
        console.error("Batch ID not found in create response:", createRes);
        // @ts-ignore
        customAlert.show({ message: "Batch created but batch ID not found." });
        setConfirmation(false);
        return;
      }

      // Step 2: Fetch batch details to get complete batch object
      const batchDetailsRes = await queryClient.fetchQuery({
        queryKey: [apiUrls.batch.FETCH_BATCH_DETAILS, { batchId }],
        queryFn: async () => {
          const { request } = await import("../../../services/axios.service");
          const { store } = await import("../../../app/store");
          const organization = store.getState().auth.selectedOrganization;
          return request({
            url: apiUrls.batch.FETCH_BATCH_DETAILS,
            method: "POST",
            data: {
              batchId,
              customerId: organization?.customerId,
              organizationId: organization?.organizationId,
            },
          });
        },
      });

      const batchDetails = batchDetailsRes?.data;

      // Step 3: Update course to include the new batch (if courseId is provided)
      if (values.courseId && courseDetailsData?.data) {
        const courseData = courseDetailsData.data;
        const courseUpdatePayload = {
          courseId: values.courseId,
          courseName: courseData.courseName,
          courseDescription: courseData.courseDescription || "",
          courseFee: courseData.courseFee || 0,
          courseFeeDescription: courseData.courseFeeDescription || "",
          maxPaymentInstallment: courseData.maxPaymentInstallment || 1,
          courseDurationYear: Math.floor((courseData.courseDuration || 0) / 12),
          courseDurationMonth: (courseData.courseDuration || 0) % 12,
          mode: courseData.mode || "offline",
          courseStatus: courseData.courseStatus || "active",
          subjects: courseData.subjects || [],
        };

        try {
          await updateCourse(courseUpdatePayload);
          console.log("Course updated successfully with new batch");
        } catch (error) {
          console.error("Error updating course:", error);
          // Continue even if course update fails
        }
      }

      // Step 4: Update batch to ensure proper linking
      if (batchDetails) {
        const batchUpdatePayload = {
          batchId,
          batchName: values.batchName,
          batchDescription: values.batchDescription || "",
          batchStartDate: values.batchStartDate,
          batchEndDate: values.batchEndDate,
          setBatchTime: values.setBatchTime || "No",
          batchClassStartTime: values.batchClassStartTime || "",
          batchClassEndTime: values.batchClassEndTime || "",
          batchStatus: "active",
          courses: batchDetails.courses || [],
          students: batchDetails.students || [],
          teacher: batchDetails.teacher || [],
          subjects: batchDetails.subjects || [],
          batchDetails: batchDetails,
        };

        try {
          await updateBatch(batchUpdatePayload);
          console.log("Batch updated successfully");
        } catch (error) {
          console.error("Error updating batch:", error);
          // Continue even if batch update fails
        }
      }

      // @ts-ignore
      customAlert.show({ message: "Batch created successfully!" });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [apiUrls.batch.FETCH_BATCHES_LIST] });
      queryClient.invalidateQueries({ queryKey: [apiUrls.course.FETCH_COURSE_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [apiUrls.batch.FETCH_BATCH_DETAILS] });
      
      handler.reset();
      navigation.goBack();
    } catch (error: any) {
      console.error("Error in batch creation flow:", error);
      // @ts-ignore
      customAlert.show({ message: error?.response?.data?.message || "Failed to create batch." });
    }
    setConfirmation(false);
  };

  const TIME_OPTIONS = Array.from({ length: 72 }, (_, i) => {
    const hour = Math.floor(i / 4) + 6; // Start at 6:00 AM
    const minute = (i % 4) * 15;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const label = `${displayHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')} ${ampm}`;
    return { label, value: label };
  });

  return (
    <SafeView>
      <AppHeader
        title="Add Batch"
        showDrawer={false}
        handleBackClick={() => navigation.goBack()}
      />
      <View style={styles.screenRoot}>
        <View style={styles.formCard}>
          <ThemeScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom:20}}>
            <ScalableText style={styles.sectionTitle} fontFamily="Medium">
              Batch Details
            </ScalableText>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Batch Name*
              </ScalableText>
              <Input
                handler={handler}
                label="Enter batch name"
                name="batchName"
                containerStyles={styles.inputContainer}
                maxLength={250}
                onChangeText={(text) => {
                  handler.setValue('batchName', text);
                }}
                onBlur={() => {
                  // Trim leading/trailing spaces when field loses focus
                  const currentValue = handler.getValues('batchName');
                  if (currentValue) {
                    handler.setValue('batchName', currentValue.trim());
                  }
                }}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Batch Description
              </ScalableText>
              <Input
                handler={handler}
                label="Enter batch description"
                name="batchDescription"
                containerStyles={styles.inputContainer}
                maxLength={500}
                onChangeText={(text) => {
                  handler.setValue('batchDescription', text);
                }}
                onBlur={() => {
                  // Trim leading/trailing spaces when field loses focus
                  const currentValue = handler.getValues('batchDescription');
                  if (currentValue) {
                    handler.setValue('batchDescription', currentValue.trim());
                  }
                }}
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                {courseLoading ? "Loading..." : "Select Course*"}
              </ScalableText>
              <ControlledSelect
                handler={handler}
                label="Select course"
                name="courseId"
                options={COURSES_LIST}
                value={COURSES_LIST.find((c: { label: string; value: string }) => c.value === handler.watch("courseId")) || { label: "", value: "" }}
                dropdownButtonStyle={{
                  ...styles.inputContainer,
                  ...(COURSES_LIST.length === 0 && { opacity: 0.6 })
                }}
                disabled={COURSES_LIST.length === 0}
                onChangeValue={(selectedValue: string) => {
                  handler.setValue('courseId', selectedValue);
                  handleCourseChange(selectedValue);
                }}
              />
              {COURSES_LIST.length === 0 && !courseLoading && (
                <ScalableText style={styles.helperText} fontFamily="Regular">
                  No courses available. Please create a course first.
                </ScalableText>
              )}
              {/* Show course info when course is selected */}
              {handler.watch("courseId") && courseData?.data && (
                (() => {
                  const selectedCourse = courseData.data.find((course: any) => course.courseId === handler.watch("courseId"));
                  if (selectedCourse) {
                    // Format the dates for display
                    const startDate = new Date(selectedCourse.dateCreated).toLocaleDateString('en-GB');
                    const endDate = selectedCourse.courseExpiryDate || 'Not set';
                    
                    // return (
                    //   // <ScalableText style={styles.helperText} fontFamily="Regular">
                    //   //   Batch dates: Start from course creation ({startDate}) | End on course expiry ({endDate})
                    //   // </ScalableText>
                    // );
                  }
                  return null;
                })()
              )}
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Batch Start Date*
              </ScalableText>
              <CalendarInput
                label="Select start date"
                handler={handler}
                name="batchStartDate"
              />
            </View>
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Batch End Date*
              </ScalableText>
              {(() => {
                const courseId = handler.watch('courseId');
                const selectedCourse = courseData?.data?.find((course: any) => course.courseId === courseId);
                const hasCourseDuration = selectedCourse?.courseDuration && selectedCourse.courseDuration > 0;
                
                return (
                  <>
                    <CalendarInput
                      label="Select end date"
                      handler={handler}
                      name="batchEndDate"
                      disabled={hasCourseDuration}
                    />
                    {hasCourseDuration && (
                      <ScalableText style={styles.helperText} fontFamily="Regular">
                        End date is automatically calculated based on course duration. It will adjust when you change the start date.
                      </ScalableText>
                    )}
                  </>
                );
              })()}
            </View>
            

            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Do you want to set batch time?*
              </ScalableText>
              <ControlledSelect
                handler={handler}
                label="Select option"
                name="setBatchTime"
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
                value={handler.watch("setBatchTime") ? { label: handler.watch("setBatchTime"), value: handler.watch("setBatchTime") } : { label: "", value: "" }}
                dropdownButtonStyle={styles.inputContainer}
              />
            </View>
            {handler.watch("setBatchTime") === "Yes" && (
              <>
                <View style={styles.inputSpacing}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Batch Class Start Time*
                  </ScalableText>
                  <ControlledSelect
                    handler={handler}
                    label="Select start time"
                    name="batchClassStartTime"
                    options={TIME_OPTIONS}
                    value={handler.watch("batchClassStartTime") ? { label: handler.watch("batchClassStartTime") || "", value: handler.watch("batchClassStartTime") || "" } : { label: "", value: "" }}
                    dropdownButtonStyle={styles.inputContainer}
                    onChangeValue={(selectedValue: string) => {
                      handler.setValue('batchClassStartTime', selectedValue, { 
                        shouldValidate: true,
                        shouldDirty: true 
                      });
                      // Trigger validation of end time when start time changes
                      handler.trigger('batchClassEndTime');
                    }}
                  />
                </View>
                <View style={styles.inputSpacing}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Batch Class End Time*
                  </ScalableText>
                  <ControlledSelect
                    handler={handler}
                    label="Select end time"
                    name="batchClassEndTime"
                    options={TIME_OPTIONS}
                    value={handler.watch("batchClassEndTime") ? { label: handler.watch("batchClassEndTime") || "", value: handler.watch("batchClassEndTime") || "" } : { label: "", value: "" }}
                    dropdownButtonStyle={styles.inputContainer}
                    onChangeValue={(selectedValue: string) => {
                      handler.setValue('batchClassEndTime', selectedValue, { 
                        shouldValidate: true,
                        shouldDirty: true 
                      });
                    }}
                  />
                </View>
              </>
            )}
          </ThemeScrollView>
        </View>
        <View style={styles.buttonBelowCardWrapper}>
          <Button
            onPress={handler.handleSubmit(onSubmit)}
            title={isPending ? "Submitting..." : "Submit"}
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
              Are you sure you want to create this batch?
            </ScalableText>
            <Button
             title="Create Batch"
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

export default CreateBatch;

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
    maxHeight: Dimensions.get('window').height * 0.55,
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
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    color: COLORS.black,
    fontFamily: "Poppins-Medium",
  },
  inputContainer: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },

}); 