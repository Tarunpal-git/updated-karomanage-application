// import React, { FC, useState, useMemo, useEffect } from "react";
// import { StyleSheet, View, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import SafeView from "../../../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../../../@ui/app-header/AppHeader";
// import ThemeScrollView from "../../../../../@ui/theme-scroll-view/ThemeScrollView";
// import Flex from "../../../../../@ui/flex/Flex";
// import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../../../colors";
// import { Col, Grid, Row } from "react-native-easy-grid";
// import { THomeStackNavigator } from "../../../../../navigators/tab-navigator/sub-stack-navigator/HomeStackNavigator";
// import { useCourseDetailsQuery } from "../../../../../apis/hooks/course/query/useCourseDetails.query";
// import { useStudentDetailsQuery } from "../../../../../apis/hooks/students/query/useStudentDetails.query";
// import { useListCouponsQuery } from "../../../../../apis/hooks/coupons/query/useListCoupons.query";
// import { useEmployeesListQuery } from "../../../../../apis/hooks/employee/query/useEmployeesList.query";
// import ActionIcon from "../../../../../@ui/action-icon/ActionIcon";
// import AutoHeightImage from "../../../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../../../images";
// import Button from "../../../../../@ui/button/Button";
// import SelectDropdown from "../../../../../@ui/select-dropdown/SelectDropdown";
// import Input from "../../../../../@ui/input/Input";
// import DateInput from "../../../../../@ui/date-input/DateInput";
// import DatePicker from "react-native-date-picker";
// import { request } from "../../../../../services/axios.service";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../../app/store";
// import { useForm } from "react-hook-form";
// import { useQueryClient } from "@tanstack/react-query";
// import { apiUrls } from "../../../../../apis/urls";

// interface IUpdatePaymentScreen {
//   course: TCourse;
//   studentRollNo: string;
// }

// interface CouponOption {
//   label: string;
//   value: string;
//   couponData?: any;
// }

// const UpdatePaymentScreen: FC = () => {
//   const navigation = useNavigation<THomeStackNavigator>();
//   const route = useRoute<any>();
//   const { course, studentRollNo } = route.params;
//   const [activeTab, setActiveTab] = useState<"installment" | "payment">("installment");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
//   const [paymentStatus, setPaymentStatus] = useState("paid");
//   const [paymentDate, setPaymentDate] = useState(() => {
//     const today = new Date();
//     return today;
//   });
//   const [paymentMode, setPaymentMode] = useState<string>("");
//   const [paymentReceiverId, setPaymentReceiverId] = useState<string>("");
//   const [transactionId, setTransactionId] = useState<string>("");
//   const [showDatePicker, setShowDatePicker] = useState(false); // for installment due dates
//   const [statusDatePickerOpen, setStatusDatePickerOpen] = useState(false); // for Update Payment Status modal
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [showReminderMenu, setShowReminderMenu] = useState<string | null>(null);
//   const [isPayingFirstInstallment, setIsPayingFirstInstallment] = useState<string>('');
//   const [installmentDescription, setInstallmentDescription] = useState('');
//   const [selectedInstallmentForDate, setSelectedInstallmentForDate] = useState<string>('');
  
//   // Form handler for dynamic installments
//   const installmentHandler = useForm();
  
//   // Form handler for date inputs
//   const dateHandler = useForm();
  
//   // Coupon states
//   const [availableCoupons, setAvailableCoupons] = useState<CouponOption[]>([
//     { label: 'Select coupon', value: '' }
//   ]);
//   const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [paymentAfterDiscount, setPaymentAfterDiscount] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Employee states
//   const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  
//   // Dynamic installment states
//   const [dynamicInstallments, setDynamicInstallments] = useState<any[]>([]);
//   const [nextInstallmentNumber, setNextInstallmentNumber] = useState(1);

//   // Set default values for installment amounts
//   useMemo(() => {
//     dynamicInstallments.forEach((inst: any) => {
//       installmentHandler.setValue(`installmentAmount${inst.installmentId}`, inst.duePayment?.toString() || "0");
//     });
//   }, [dynamicInstallments]);

//   // Watch for changes in installment amounts
//   const watchedAmounts = installmentHandler.watch();

//   // Update installment amounts when form values change
//   useEffect(() => {
//     dynamicInstallments.forEach((inst) => {
//       const fieldName = `installmentAmount${inst.installmentId}`;
//       const newAmount = watchedAmounts[fieldName];
      
//       if (newAmount !== undefined && newAmount !== inst.duePayment?.toString()) {
//         const amount = parseFloat(newAmount) || 0;
//         handleUpdateInstallmentAmount(inst.installmentId, amount);
//       }
//     });
//   }, [watchedAmounts]);
  
//   // Get user and organization data from Redux
//   const authUser = useSelector((state: RootState) => state.auth.authUser);
//   const selectedOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);

//   // Get query client for cache invalidation
//   const queryClient = useQueryClient();

//   // API calls for dynamic data
//   const { data: courseData, isLoading: courseLoading } = useCourseDetailsQuery({
//     courseId: course.courseId,
//   });

//   const { data: studentData, isLoading: studentLoading, refetch: refetchStudentData } = useStudentDetailsQuery(studentRollNo);

//   // Fetch coupons from API
//   const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useListCouponsQuery();
  
//   // Fetch employees from API
//   const { data: employeesData, isLoading: employeesLoading } = useEmployeesListQuery();

//   // Get payment details from student data
//   const paymentDetails = useMemo(() => {
//     console.log("Student Data:", JSON.stringify(studentData, null, 2));
//     console.log("Course ID:", course.courseId);
    
//     if (studentData?.data?.courses) {
//       const foundCourse = studentData.data.courses.find((c: any) => c.courseId === course.courseId);
//       console.log("Found Course:", JSON.stringify(foundCourse, null, 2));
//       return foundCourse?.paymentDetails;
//     }
//     return null;
//   }, [studentData, course.courseId]);

//   // Get installment details
//   const installmentDetails = useMemo(() => {
//     console.log("Payment Details:", JSON.stringify(paymentDetails, null, 2));
//     console.log("Installment Details:", JSON.stringify(paymentDetails?.installmentDetails, null, 2));
//     return paymentDetails?.installmentDetails || [];
//   }, [paymentDetails]);

//   // Convert API coupon data to dropdown options
//   useMemo(() => {
//     if (couponsData && couponsData.length > 0) {
//       const couponOptions: CouponOption[] = couponsData.map((coupon: any) => ({
//         label: `${coupon.couponName} - ${coupon.couponType === 'Flat' ? '₹' : '%'}${coupon.couponValue}`,
//         value: coupon.couponId || coupon.couponName.toLowerCase().replace(/\s+/g, ''),
//         couponData: coupon // Store full coupon data for reference
//       }));
//       setAvailableCoupons(couponOptions);
//       console.log('🎫 Coupons loaded from API:', couponOptions);
//     }
//   }, [couponsData]);

//   // Convert API employee data to dropdown options
//   useMemo(() => {
//     if (employeesData?.data && employeesData.data.length > 0) {
//       const employeeOptions = employeesData.data.map((employee: any) => {
//         const firstName = employee?.employeePersonalDetails?.employeeFirstname || employee.employeeFirstName || '';
//         const lastName = employee?.employeePersonalDetails?.employeeLastname || employee.employeeLastName || '';
//         const displayName = `${firstName} ${lastName}`.trim();
//         const employeeId = employee.employeeId || employee.id;
        
//         return {
//           label: `${displayName} (${employeeId})`,
//           value: employeeId,
//           employeeData: employee
//         };
//       });
//       setAvailableEmployees(employeeOptions);
//       console.log('👥 Employees loaded from API:', employeeOptions);
//     }
//   }, [employeesData]);

//   // Calculate discount and payment after discount when coupon changes
//   useMemo(() => {
//     const totalDuePayment = paymentDetails?.totalDuePayment || 0;
    
//     if (selectedCoupon && totalDuePayment > 0) {
//       let calculatedDiscount = 0;
      
//       if (selectedCoupon.couponType === 'flat') {
//         calculatedDiscount = parseFloat(selectedCoupon.discountValue) || 0;
//       } else if (selectedCoupon.couponType === 'percentage') {
//         const percentageValue = parseFloat(selectedCoupon.discountValue) || 0;
//         calculatedDiscount = (totalDuePayment * percentageValue) / 100;
//       }
      
//       const calculatedPaymentAfterDiscount = Math.max(0, totalDuePayment - calculatedDiscount);
      
//       setDiscountAmount(Math.round(calculatedDiscount));
//       setPaymentAfterDiscount(Math.round(calculatedPaymentAfterDiscount));
      
//       console.log('Coupon calculation based on total due payment:', {
//         totalDuePayment,
//         selectedCoupon,
//         calculatedDiscount,
//         calculatedPaymentAfterDiscount
//       });
//     } else {
//       setDiscountAmount(0);
//       setPaymentAfterDiscount(totalDuePayment);
//     }
//   }, [selectedCoupon, paymentDetails?.totalDuePayment]);

//   // Check if we're returning from AddCouponScreen with new coupon data
//   useMemo(() => {
//     if (route.params?.newCoupon) {
//       const newCoupon = route.params.newCoupon;
      
//       // Add the new coupon to the available coupons list
//       const couponOption: CouponOption = {
//         label: `${newCoupon.couponName} - ${newCoupon.couponType === 'flat' ? '₹' : ''}${newCoupon.couponType === 'percentage' ? '%' : ''}${newCoupon.discountValue}`,
//         value: newCoupon.couponId || newCoupon.couponName.toLowerCase().replace(/\s+/g, ''),
//         couponData: newCoupon
//       };
      
//       setAvailableCoupons((prev: CouponOption[]) => [...prev.slice(1), couponOption]); // Keep "Select coupon" as first option
      
//       // Set the newly created coupon as selected
//       setSelectedCoupon(newCoupon);
      
//       // Clear the route params
//       navigation.setParams({ newCoupon: undefined });
      
//       // Refetch coupons to get updated list
//       refetchCoupons();
//     }
//   }, [route.params?.newCoupon]);

//   const handleCouponSelection = (selectedValue: string) => {
//     console.log('Coupon selected:', selectedValue);
//     if (selectedValue) {
//       // Find the selected coupon object
//       const coupon = availableCoupons.find((opt: CouponOption) => opt.value === selectedValue);
//       if (coupon && coupon.value !== '') {
//         // Use real coupon data from API
//         const couponData = {
//           couponName: coupon.couponData?.couponName || coupon.label.split(' - ')[0],
//           couponType: coupon.couponData?.couponType?.toLowerCase() || (coupon.label.includes('₹') ? 'flat' : 'percentage'),
//           discountValue: coupon.couponData?.couponValue || parseInt(coupon.label.match(/\d+/)?.[0] || '0'),
//           couponId: coupon.couponData?.couponId
//         };
//         setSelectedCoupon(couponData);
//         console.log('Coupon data set:', couponData);
//       } else {
//         setSelectedCoupon(null);
//       }
//     } else {
//       setSelectedCoupon(null);
//     }
//   };

//   const handleAddCoupon = () => {
//     (navigation as any).navigate('AddCoupon', { returnScreen: 'UpdatePayment' });
//   };

//   // Initialize dynamic installments from existing due installments
//   useMemo(() => {
//     const dueInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'due');
//     const mappedInstallments = dueInstallments.map((inst: any) => ({
//       ...inst,
//       isDynamic: false // Mark existing installments as non-dynamic
//     }));
    
//     setDynamicInstallments(mappedInstallments);
//     setNextInstallmentNumber(dueInstallments.length + 1);
    
//     // Set initial form values for existing installments
//     mappedInstallments.forEach((inst: any) => {
//       // Set amount
//       const amountFieldName = `installmentAmount${inst.installmentId}`;
//       installmentHandler.setValue(amountFieldName, inst.duePayment?.toString() || "0");
      
//       // Set date - parse the date and set it
//       const dateFieldName = `installmentDate${inst.installmentId}`;
//       if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
//         let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
        
//         // Convert various date formats to Date object
//         if (dateValue) {
//           try {
//             let parsedDate = new Date();
            
//             // Check if it's already a valid Date string (ISO format YYYY-MM-DD)
//             if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
//               parsedDate = new Date(dateValue);
//             }
//             // Check if it's DD-MM-YYYY format
//             else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
//               const parts = dateValue.split('-');
//               // If first part is 2 digits, it's DD-MM-YYYY
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 // Otherwise it might be YYYY-MM-DD
//                 parsedDate = new Date(dateValue);
//               }
//             }
//             // Check if it's DD/MM/YYYY format
//             else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
//               const parts = dateValue.split('/');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 const [year, month, day] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               }
//             }
//             // Try standard Date parsing
//             else {
//               parsedDate = new Date(dateValue);
//             }
            
//             if (!isNaN(parsedDate.getTime())) {
//               dateHandler.setValue(dateFieldName, parsedDate);
//               console.log(`✅ Set date for ${dateFieldName}:`, parsedDate);
//             } else {
//               console.log(`❌ Invalid date for ${dateFieldName}:`, dateValue);
//             }
//           } catch (error) {
//             console.log('Date parsing error in initialization:', error, dateValue);
//           }
//         }
//       }
//     });
    
//     console.log('Initialized dynamic installments:', {
//       dueInstallments: mappedInstallments.length,
//       mappedInstallments
//     });
//   }, [installmentDetails]);

//   // Sync form values when dynamicInstallments change
//   useEffect(() => {
//     dynamicInstallments.forEach((inst: any) => {
//       // Sync amount
//       const amountFieldName = `installmentAmount${inst.installmentId}`;
//       const currentAmount = installmentHandler.getValues(amountFieldName);
//       const expectedAmount = inst.duePayment?.toString() || "0";
//       if (currentAmount !== expectedAmount) {
//         installmentHandler.setValue(amountFieldName, expectedAmount, { shouldValidate: false });
//       }
      
//       // Sync date
//       const dateFieldName = `installmentDate${inst.installmentId}`;
//       if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
//         let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
//         if (dateValue) {
//           try {
//             let parsedDate = new Date();
//             if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
//               parsedDate = new Date(dateValue);
//             } else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
//               const parts = dateValue.split('-');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 parsedDate = new Date(dateValue);
//               }
//             } else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
//               const parts = dateValue.split('/');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 const [year, month, day] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               }
//             } else {
//               parsedDate = new Date(dateValue);
//             }
            
//             if (!isNaN(parsedDate.getTime())) {
//               const currentDate = dateHandler.getValues(dateFieldName);
//               if (!currentDate || currentDate.getTime() !== parsedDate.getTime()) {
//                 dateHandler.setValue(dateFieldName, parsedDate, { shouldValidate: false });
//               }
//             }
//           } catch (error) {
//             console.log('Date sync error:', error);
//           }
//         }
//       }
//     });
//   }, [dynamicInstallments]);


//   // Get total due amount including paid installments and coupon discount (PaymentDetailsScreen style)
//   const getTotalDueAmount = () => {
//     const paidInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid');
//     const totalPaidAmount = paidInstallments.reduce((sum: number, inst: any) => sum + (inst.receivedPayment || inst.duePayment || 0), 0);
    
//     // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//     const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
    
//     // Total due amount = Base amount (after coupon) - Total paid amount
//     const totalDueAmount = Math.max(0, baseAmount - totalPaidAmount);
    
//     console.log('Total due calculation with coupon (PaymentDetailsScreen style):', {
//       totalDuePayment: paymentDetails?.totalDuePayment,
//       paymentAfterDiscount,
//       selectedCoupon: selectedCoupon?.couponName,
//       discountAmount,
//       baseAmount,
//       totalPaidAmount,
//       totalDueAmount,
//       paidInstallments: paidInstallments.length
//     });
    
//     return totalDueAmount;
//   };

//   // Add new installment
//   const handleAddInstallment = () => {
//     const newInstallment = {
//       installmentId: `dynamic-${Date.now()}`,
//       installmentNumber: nextInstallmentNumber,
//       paymentStatus: 'due',
//       duePayment: 0, // Will be calculated automatically
//       nextpaymentDate: new Date().toLocaleDateString("en-GB"),
//       paymentNotes: '',
//       isDynamic: true
//     };
    
//     // Add new installment to the list
//     const updatedInstallments = [...dynamicInstallments, newInstallment];
//     setDynamicInstallments(updatedInstallments);
//     setNextInstallmentNumber(prev => prev + 1);
    
//     // Recalculate all amounts after adding new installment (PaymentDetailsScreen style)
//     setTimeout(() => {
//       // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, updatedInstallments.length);
      
//       const finalInstallments = updatedInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(finalInstallments);
      
//       // Update form values for all installments
//       finalInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Added new installment and recalculated (PaymentDetailsScreen style):', {
//         newInstallment,
//         baseAmount,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         totalInstallments: updatedInstallments.length,
//         selectedCoupon: selectedCoupon?.couponName,
//         paymentAfterDiscount,
//         finalInstallments
//       });
//     }, 0);
//   };

//   // Remove installment
//   const handleRemoveInstallment = (installmentId: string) => {
//     // Prevent removing if only one installment remains
//     if (dynamicInstallments.length <= 1) {
//       Alert.alert(
//         "Cannot Remove",
//         "At least one installment must remain.",
//         [{ text: "OK" }]
//       );
//       return;
//     }
    
//     // Remove installment from the list
//     const remainingInstallments = dynamicInstallments.filter(inst => inst.installmentId !== installmentId);
//     setDynamicInstallments(remainingInstallments);
    
//     // Clear form value for removed installment
//     installmentHandler.unregister(`installmentAmount${installmentId}`);
    
//     // Recalculate all amounts after removing installment (PaymentDetailsScreen style)
//     setTimeout(() => {
//       // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, remainingInstallments.length);
      
//       const updatedInstallments = remainingInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(updatedInstallments);
      
//       // Update form values for all remaining installments
//       updatedInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Removed installment and recalculated (PaymentDetailsScreen style):', {
//         removedInstallmentId: installmentId,
//         baseAmount,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         remainingInstallments: updatedInstallments.length,
//         selectedCoupon: selectedCoupon?.couponName,
//         paymentAfterDiscount,
//         updatedInstallments
//       });
//     }, 0);
//   };

//   // Update installment amount
//   const handleUpdateInstallmentAmount = (installmentId: string, newAmount: number) => {
//     setDynamicInstallments(prev => prev.map(inst => 
//       inst.installmentId === installmentId 
//         ? { ...inst, duePayment: newAmount }
//         : inst
//     ));
//   };

//   // Validate total amount
//   const validateTotalAmount = () => {
//     const totalCalculated = dynamicInstallments.reduce((sum, inst) => sum + (inst.duePayment || 0), 0);
//     const expectedTotal = paymentAfterDiscount;
//     const difference = Math.abs(totalCalculated - expectedTotal);
    
//     console.log('Amount validation:', {
//       totalCalculated,
//       expectedTotal,
//       difference,
//       isValid: difference <= 1 // Allow 1 rupee difference due to rounding
//     });
    
//     return difference <= 1;
//   };

//   // Helper function to calculate and distribute installment amounts evenly (same as PaymentDetailsScreen)
//   const calculateAndDistributeInstallments = (baseAmount: number, numberOfInstallments: number) => {
//     const equalAmount = Math.floor(baseAmount / numberOfInstallments);
//     const remainder = baseAmount % numberOfInstallments;
    
//     const installmentAmounts: number[] = [];
//     for (let i = 1; i <= numberOfInstallments; i++) {
//       const installmentAmount = equalAmount + (i <= remainder ? 1 : 0);
//       installmentAmounts.push(installmentAmount);
//     }
    
//     return {
//       equalAmount,
//       remainder,
//       installmentAmounts
//     };
//   };

//   // Function to recalculate all installment amounts
//   const recalculateInstallmentAmounts = () => {
//     if (dynamicInstallments.length > 0) {
//       // If coupon is applied, always recalculate amounts based on paymentAfterDiscount
//       // If no coupon and no dynamic installments, keep original amounts
//       const hasDynamic = dynamicInstallments.some((inst: any) => inst.isDynamic);
//       const hasCoupon = !!selectedCoupon;
      
//       if (!hasDynamic && !hasCoupon) {
//         // No coupon and no new installments - keep original amounts
//         return dynamicInstallments;
//       }

//       // Use paymentAfterDiscount as base amount when coupon is applied
//       // Otherwise use totalDuePayment
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, dynamicInstallments.length);
      
//       const updatedInstallments = dynamicInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(updatedInstallments);
      
//       // Update form values for the new amounts
//       updatedInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Recalculated amounts (PaymentDetailsScreen style):', {
//         baseAmount,
//         numberOfInstallments: dynamicInstallments.length,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         selectedCoupon: selectedCoupon?.couponName,
//         discountAmount,
//         paymentAfterDiscount,
//         hasCoupon,
//         hasDynamic,
//         updatedInstallments
//       });
      
//       return updatedInstallments;
//     }
//     return dynamicInstallments;
//   };

//   // Recalculate all amounts when payment after discount or coupon changes
//   useMemo(() => {
//     recalculateInstallmentAmounts();
//   }, [paymentAfterDiscount, installmentDetails, selectedCoupon, discountAmount]); // Add coupon dependencies


//   // Monitor dynamicInstallments changes for debugging
//   useEffect(() => {
//     console.log('Dynamic installments updated:', dynamicInstallments);
//   }, [dynamicInstallments]);

//   // Trigger recalculation when installment count changes
//   useEffect(() => {
//     if (dynamicInstallments.length > 0) {
//       // Small delay to ensure state is updated
//       const timer = setTimeout(() => {
//         recalculateInstallmentAmounts();
//       }, 100);
      
//       return () => clearTimeout(timer);
//     }
//   }, [dynamicInstallments.length]);

//   const handleEditInstallment = (installment: any) => {
//     setSelectedInstallment(installment);
//     setPaymentStatus(installment.paymentStatus || "paid");
//     setPaymentMode(installment.paymentMode || "");
//     setPaymentReceiverId(installment.paymentRecieverId || installment.paymentReceiverId || "");
//     setTransactionId(installment.transactionId || "");
    
//     // Safely parse the payment date
//     let initialDate = new Date();
//     try {
//       if (installment.paymentReceiveDate) {
//         // Handle different date formats
//         if (installment.paymentReceiveDate.includes('-')) {
//           const [day, month, year] = installment.paymentReceiveDate.split('-');
//           initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//         } else if (installment.paymentReceiveDate.includes('/')) {
//           const [day, month, year] = installment.paymentReceiveDate.split('/');
//           initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//         } else {
//           initialDate = new Date(installment.paymentReceiveDate);
//         }
        
//         // Validate the date
//         if (isNaN(initialDate.getTime())) {
//           initialDate = new Date();
//         }
//       }
//     } catch (error) {
//       console.log('Date parsing error in handleEditInstallment:', error);
//       initialDate = new Date();
//     }
    
//     setPaymentDate(initialDate);
//     setModalVisible(true);
//   };

//   const handleSavePayment = async () => {
//     if (!selectedInstallment || !authUser || !selectedOrganization) {
//       Alert.alert("Error", "Required data is missing");
//       return;
//     }

//     setIsUpdating(true);
    
//     try {
//       const payload = {
//         user: {
//           userCustomerId: authUser.customerId,
//           userCustomerName: authUser.customerName,
//           userCustomerEmail: authUser.customerEmail,
//           roleName: selectedOrganization.role?.roleName || authUser.userType,
//           roleId: selectedOrganization.role?.roleId || authUser.employeeId,
//           userEmployeeId: authUser.employeeId
//         },
//         customerId: selectedOrganization.customerId,
//         organizationId: selectedOrganization.organizationId,
//         rollNo: studentRollNo,
//         courseId: course.courseId,
//         updatedPaymentStatus: paymentStatus,
//         updatedDate: paymentDate.toLocaleDateString("en-GB").split("/").reverse().join("-"),
//         installmentNumber: selectedInstallment.installmentNumber,
//         ...(paymentMode && { paymentMode: paymentMode }),
//         ...(paymentMode === "cash" && paymentReceiverId && { paymentRecieverId: paymentReceiverId }),
//         ...(paymentMode === "online" && transactionId && { transactionId })
//       };

//       console.log("Updating payment status with payload:", payload);

//       const response = await request({
//         method: "POST",
//         url: "/student-fnp-prod/updateStudentPaymentStatus",
//         data: payload
//       });

//       console.log("Payment status update response:", response);

//       if (response.statusCode === 200) {
//         // Invalidate queries to refresh all related data
//         console.log("🔄 Invalidating queries after payment status update");
        
//         // Invalidate student details query
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
//         });
        
//         // Invalidate course details query (in case it includes payment info)
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
//         });
        
//         // Also invalidate student list queries that might show payment status
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
//         });
        
//         // Refetch student data to ensure immediate update
//         await refetchStudentData();
        
//         Alert.alert("Success", "Payment status updated successfully!", [
//           {
//             text: "OK",
//             onPress: () => {
//               setModalVisible(false);
//               setSelectedInstallment(null);
//             }
//           }
//         ]);
//       } else {
//         Alert.alert("Error", response.message || "Failed to update payment status");
//       }
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//       Alert.alert("Error", "Failed to update payment status. Please try again.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setModalVisible(false);
//     setSelectedInstallment(null);
//     setPaymentMode("");
//     setPaymentReceiverId("");
//     setTransactionId("");
//   };

//   const handleDownloadInvoice = (installmentId: string) => {
//     console.log("Download invoice:", installmentId);
//     Alert.alert("Download Invoice", "Download functionality will be implemented soon");
//   };

//   const handleViewInvoice = (installmentId: string) => {
//     console.log("View invoice:", installmentId);
//     Alert.alert("View Invoice", "View functionality will be implemented soon");
//   };

//   const handleReminderMenu = (installmentId: string) => {
//     setShowReminderMenu(showReminderMenu === installmentId ? null : installmentId);
//   };

//   const handleReminderAction = (action: string, installmentId: string) => {
//     console.log(`${action} reminder for installment:`, installmentId);
//     Alert.alert(`${action} Reminder`, `${action} reminder functionality will be implemented soon`);
//     setShowReminderMenu(null);
//   };

//   const handleSubmitPayment = async () => {
//     if (!authUser || !selectedOrganization) {
//       Alert.alert("Error", "Required data is missing");
//       return;
//     }

//     // Validate required fields
//     if (!isPayingFirstInstallment) {
//       Alert.alert("Error", "Please select if you are paying first installment");
//       return;
//     }

//     // Validate payment mode fields if paying first installment
//     if (isPayingFirstInstallment === 'paid') {
//       const firstInstallment = dynamicInstallments[0];
//       if (!firstInstallment?.paymentMode) {
//         Alert.alert("Error", "Please select payment mode for first installment");
//         return;
//       }
      
//       if (firstInstallment.paymentMode === 'cash' && !firstInstallment.paymentRecieverId) {
//         Alert.alert("Error", "Please select payment received by for cash payment");
//         return;
//       }
      
//       if (firstInstallment.paymentMode === 'online' && !firstInstallment.transactionId) {
//         Alert.alert("Error", "Please enter transaction ID for online payment");
//         return;
//       }
//     }

//     setIsSubmitting(true);
    
//     try {
//       // Prepare installment details
//       const installmentDetails = dynamicInstallments.map((inst, index) => {
//         const installmentData: any = {
//           installmentNumber: inst.installmentNumber || index + 1,
//           paymentStatus: isPayingFirstInstallment === 'paid' && index === 0 ? 'paid' : 'due',
//           installmentId: inst.installmentId,
//           paymentNotes: inst.paymentNotes || '',
//           paymentMode: inst.paymentMode || '',
//           transactionId: inst.transactionId || '',
//           paymentRecieverId: inst.paymentRecieverId || ''
//         };

//         // Add payment date and amount based on status
//         if (installmentData.paymentStatus === 'paid') {
//           installmentData.paymentReceiveDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
//           installmentData.receivedPayment = inst.duePayment || 0;
//         } else {
//           installmentData.nextpaymentDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
//           installmentData.duePayment = inst.duePayment || 0;
//         }

//         return installmentData;
//       });

//       // Determine course payment status
//       const coursePaymentStatus = dynamicInstallments.every(inst => 
//         isPayingFirstInstallment === 'paid' && dynamicInstallments.indexOf(inst) === 0 ? true : false
//       ) ? 'paid' : 'due';

//       const payload = {
//         user: {
//           userCustomerId: authUser.customerId,
//           userCustomerName: authUser.customerName,
//           userCustomerEmail: authUser.customerEmail,
//           roleName: selectedOrganization.role?.roleName || authUser.userType,
//           roleId: selectedOrganization.role?.roleId || authUser.employeeId,
//           userEmployeeId: authUser.employeeId
//         },
//         customerId: selectedOrganization.customerId,
//         organizationId: selectedOrganization.organizationId,
//         rollNo: studentRollNo,
//         courseId: course.courseId,
//         paymentDetails: {
//           isPartPayment: dynamicInstallments.length > 1,
//           coursePaymentStatus: coursePaymentStatus,
//           installmentDetails: installmentDetails
//         },
//         ...(selectedCoupon && {
//           coupon: {
//             couponId: selectedCoupon.couponId,
//             discount: discountAmount
//           }
//         })
//       };

//       console.log("Submitting payment details with payload:", JSON.stringify(payload, null, 2));

//       const response = await request({
//         method: "POST",
//         url: "/student-fnp-prod/updateStudentPaymentDetails",
//         data: payload
//       });

//       console.log("Payment details update response:", response);

//       if (response.statusCode === 200) {
//         // Invalidate queries to refresh all related data
//         console.log("🔄 Invalidating queries to refresh payment data");
        
//         // Invalidate student details query
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
//         });
        
//         // Invalidate course details query (in case it includes payment info)
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
//         });
        
//         // Also invalidate student list queries that might show payment status
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
//         });
        
//         // Refetch student data to ensure immediate update
//         await refetchStudentData();
        
//         Alert.alert("Success", "Payment details updated successfully!", [
//           {
//             text: "OK",
//             onPress: () => {
//               // Navigate back after data refresh
//               navigation.goBack();
//             }
//           }
//         ]);
//       } else {
//         Alert.alert("Error", response.message || "Failed to update payment details");
//       }
//     } catch (error) {
//       console.error("Error updating payment details:", error);
//       Alert.alert("Error", "Failed to update payment details. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "paid":
//         return { backgroundColor: "#ECFFE0", color: "#4AC400" };
//       case "due":
//         return { backgroundColor: "#FFE6E6", color: "#FF4444" };
//       case "pending":
//         return { backgroundColor: "#FFF3E0", color: "#FF9800" };
//       default:
//         return { backgroundColor: "#F5F5F5", color: "#666666" };
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return `₹ ${amount?.toLocaleString() || "0"}`;
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "No date";
    
//     console.log('Formatting date:', dateString);
    
//     try {
//       // Handle DD/MM/YYYY format
//       if (dateString.includes('/')) {
//         const [day, month, year] = dateString.split('/');
//         console.log('Parsed DD/MM/YYYY format:', { day, month, year });
//         return `${day}/${month}/${year}`;
//       }
      
//       // Handle DD-MM-YYYY format
//       if (dateString.includes('-')) {
//         const [day, month, year] = dateString.split('-');
//         console.log('Parsed DD-MM-YYYY format:', { day, month, year });
//         return `${day}/${month}/${year}`;
//       }
      
//       // Handle standard date format
//       const date = new Date(dateString);
//       if (!isNaN(date.getTime())) {
//         console.log('Parsed as standard date:', date);
//         return date.toLocaleDateString("en-GB");
//       }
      
//       console.log('Invalid date:', dateString);
//       return "Invalid date";
//     } catch (error) {
//       console.log('Date formatting error:', error);
//       return "Error";
//     }
//   };

//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Payment History"
//         handleBackClick={() => navigation.goBack()}
//       />
      
//       <ThemeScrollView 
//         paddingHorizontal={10}
//         loading={courseLoading || studentLoading}
//       >
//         <Flex mt={20} flexDirection="column">
//           {/* Tab Container */}
//           <Flex styles={styles.tabContainer}>
//             <TouchableOpacity
//               style={[styles.tab, activeTab === "installment" ? styles.activeTab : styles.inactiveTab]}
//               onPress={() => setActiveTab("installment")}
//             >
//               <ScalableText style={activeTab === "installment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
//                 INSTALLMENT VIEW
//               </ScalableText>
//             </TouchableOpacity>
//             {paymentDetails?.coursePaymentStatus === "due" && (
//               <TouchableOpacity
//                 style={[styles.tab, activeTab === "payment" ? styles.activeTab : styles.inactiveTab]}
//                 onPress={() => setActiveTab("payment")}
//               >
//                 <ScalableText style={activeTab === "payment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
//                   INSTALLMENT UPDATE
//                 </ScalableText>
//               </TouchableOpacity>
//             )}
//           </Flex>

//           {/* Section Title */}
//           <Flex mt={20} align="flex-start">
//             <ScalableText style={styles.sectionTitle} fontFamily="Bold">
//               {activeTab === "installment" ? "Installment Details" : "Update Installments"}
//             </ScalableText>
//           </Flex>

         

//           {/* Conditional Content Based on Active Tab */}
//           {activeTab === "installment" ? (
//             // Installment Details Table - scrollable + wider layout
//             <Flex mt={15}>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//               >
//                 <View style={styles.installmentTableWrapper}>
//                   <Grid>
//                     <Row style={styles.headerRow}>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "4%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           NO.
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           DATE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           AMOUNT
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           MODE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "15%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           STATUS
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           INVOICE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           REMINDER
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           EDIT
//                         </ScalableText>
//                       </Col>
//                       <Col style={{ alignItems: 'center', justifyContent: 'center',width: "10%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           DOWNLOAD
//                         </ScalableText>
//                       </Col>
//                     </Row>
                    
//                     {/* Dynamic Table Data */}
//                     {installmentDetails.length > 0 ? (
//                       installmentDetails.map((installment: any, index: number) => {
//                     console.log("Rendering installment:", installment);
//                     console.log("Installment payment status:", installment.paymentStatus);
//                     console.log("Available date fields:", {
//                       nextpaymentDate: installment.nextpaymentDate,
//                       formatedNextpaymentDate: installment.formatedNextpaymentDate,
//                       paymentReceiveDate: installment.paymentReceiveDate,
//                       paymentDate: installment.paymentDate,
//                       receivedDate: installment.receivedDate,
//                       paidDate: installment.paidDate
//                     });
                    
//                     const statusStyle = getStatusColor(installment.paymentStatus);
//                     return (
//                       <Row key={installment.installmentId} style={styles.dataRow}>
//                         <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {installment.installmentNumber}
//                           </ScalableText>
//                         </Col>
//                         <Col size={10} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {(() => {
//                               // For paid installments, show payment received date
//                               if (installment.paymentStatus?.toLowerCase() === 'paid') {
//                                 return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate);
//                               }
//                               // For due installments, show next payment date
//                               else if (installment.paymentStatus?.toLowerCase() === 'due') {
//                                 return formatDate(installment.nextpaymentDate || installment.formatedNextpaymentDate);
//                               }
//                               // Fallback for other statuses
//                               else {
//                                 return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate || installment.nextpaymentDate || installment.formatedNextpaymentDate);
//                               }
//                             })()}
//                           </ScalableText>
//                         </Col>
//                         <Col size={15} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {formatCurrency(installment.receivedPayment || installment.duePayment)}
//                           </ScalableText>
//                         </Col>
//                         <Col size={16} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {(installment.paymentMode || '').toString().toUpperCase() || '-'}
//                           </ScalableText>
//                         </Col>
//                         <Col size={18} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <Flex
//                             styles={{
//                               ...styles.statusChip,
//                               backgroundColor: statusStyle.backgroundColor,
//                             }}
//                           >
//                             <ScalableText
//                               style={{
//                                 ...styles.statusChipText,
//                                 color: statusStyle.color,
//                               }}
//                               fontFamily="Medium"
//                             >
//                               {installment.paymentStatus?.toUpperCase()}
//                             </ScalableText>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <Flex flexDirection="row" justify="center" align="center">
//                             <TouchableOpacity onPress={() => handleViewInvoice(installment.installmentId)}>
//                               <AutoHeightImage source={IMAGES.fileSearchIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <Flex flexDirection="row" justify="center" align="center" styles={{ position: 'relative' }}>
//                             <TouchableOpacity 
//                               onPress={() => handleReminderMenu(installment.installmentId)}
//                               style={styles.reminderButton}
//                             >
//                               <AutoHeightImage source={IMAGES.mailIconGray} width={16} />
//                             </TouchableOpacity>
                            
//                             {/* Reminder Menu */}
//                             {showReminderMenu === installment.installmentId && (
//                               <TouchableWithoutFeedback onPress={() => setShowReminderMenu(null)}>
//                                 <View style={styles.reminderMenu}>
//                                   <TouchableOpacity 
//                                     style={styles.reminderMenuItem}
//                                     onPress={() => handleReminderAction('WhatsApp', installment.installmentId)}
//                                   >
//                                     <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                                       WhatsApp
//                                     </ScalableText>
//                                   </TouchableOpacity>
//                                   <TouchableOpacity 
//                                     style={styles.reminderMenuItem}
//                                     onPress={() => handleReminderAction('Email', installment.installmentId)}
//                                   >
//                                     <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                                       Email
//                                     </ScalableText>
//                                   </TouchableOpacity>
//                                   <TouchableOpacity 
//                                     style={styles.reminderMenuItem}
//                                     onPress={() => handleReminderAction('SMS', installment.installmentId)}
//                                   >
//                                     <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                                       SMS
//                                     </ScalableText>
//                                   </TouchableOpacity>
//                                 </View>
//                               </TouchableWithoutFeedback>
//                             )}
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <Flex flexDirection="row" justify="center" align="center">
//                             <TouchableOpacity onPress={() => handleEditInstallment(installment)}>
//                               <AutoHeightImage source={IMAGES.editIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                         <Col size={10} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <Flex flexDirection="row" justify="center" align="center">
//                             <TouchableOpacity onPress={() => handleDownloadInvoice(installment.installmentId)}>
//                               <AutoHeightImage source={IMAGES.downloadIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                       </Row>
//                     );
//                   })
//                 ) : (
//                   <Row style={styles.dataRow}>
//                     <Col size={100}>
//                       <ScalableText style={styles.noDataText} fontFamily="Medium">
//                         No installment details available
//                       </ScalableText>
//                     </Col>
//                   </Row>
//                 )}
//                   </Grid>
//                 </View>
//               </ScrollView>
//             </Flex>
//           ) : (
//             // Update Installments Form - Matching PaymentDetailsScreen UI
//             <Flex mt={15}>
//               <View style={styles.updateFormContainer}>
//                 {/* Summary Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.formLabel} fontFamily="Medium">
//                     Payment Summary
//                   </ScalableText>
                  
//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Payment Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalPayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>

//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Received Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalReceivedPayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>

//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Due Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalDuePayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>
//                 </View>

//                 {/* Paid Installments Section */}
//                 {installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid').length > 0 && (
//                   <View style={styles.formField}>
//                     <ScalableText style={styles.formLabel} fontFamily="Medium">
//                       Paid Installments
//                     </ScalableText>
//                     {installmentDetails
//                       .filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid')
//                       .map((paidInst: any, index: number) => (
//                         <View key={`paid-${paidInst.installmentId}`} style={styles.installmentContainer}>
//                           <ScalableText style={styles.installmentTitle} fontFamily="Medium">
//                             Paid Installment {paidInst.installmentNumber}
//                           </ScalableText>
                          
//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Payment Date
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {formatDate(paidInst.paymentReceiveDate || paidInst.paidDate || paidInst.receivedDate || paidInst.paymentDate)}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Amount Paid
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {formatCurrency(paidInst.receivedPayment || paidInst.duePayment)}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Description
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {paidInst.paymentNotes || "No description"}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           {/* PAID Status Badge */}
//                           <View style={styles.paidStatusBadge}>
//                             <ScalableText style={styles.paidStatusText} fontFamily="Bold">
//                               PAID
//                             </ScalableText>
//                           </View>
//                         </View>
//                       ))}
//                   </View>
//                 )}

//                 {/* Apply Coupon Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Apply Coupon
//                   </ScalableText>
//                   <View style={styles.couponContainer}>
//                     {/* Show selected coupon in input field */}
//                     {selectedCoupon ? (
//                       <View style={styles.selectedCouponContainer}>
//                         <View style={styles.selectedCouponInfo}>
//                           <ScalableText style={styles.selectedCouponName} fontFamily="Medium">
//                             {selectedCoupon.couponName} - {selectedCoupon.couponType === 'flat' ? '₹' : '%'}{selectedCoupon.discountValue}
//                           </ScalableText>
//                         </View>
//                         <TouchableOpacity 
//                           style={styles.removeCouponButton}
//                           onPress={() => {
//                             setSelectedCoupon(null);
                            
//                             // Force refresh installment amounts when coupon is removed
//                             setTimeout(() => {
//                               console.log('🔄 Coupon removed - forcing installment amount refresh');
//                               recalculateInstallmentAmounts();
//                             }, 100);
//                           }}
//                         >
//                           <ScalableText style={styles.removeCouponText} fontFamily="Bold">×</ScalableText>
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       /* Show dropdown when no coupon is selected */
//                       <SelectDropdown
//                         label="Select coupon"
//                         onChange={(value) => handleCouponSelection(value)}
//                         options={couponsLoading ? [{ label: 'Loading...', value: '' }] : availableCoupons}
//                         value={
//                           availableCoupons.find(
//                             (opt: CouponOption) => opt.value === (selectedCoupon?.couponId || '')
//                           ) as any
//                         }
//                         dropdownButtonStyle={styles.couponDropdownStyle}
//                       />
//                     )}
//                     <TouchableOpacity style={styles.addButton} onPress={handleAddCoupon}>
//                       <ScalableText style={styles.addButtonText} fontFamily="Bold">+</ScalableText>
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* Discount Amount */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Discount Amount
//                   </ScalableText>
//                   <View style={styles.inputContainer}>
//                     <ScalableText style={styles.inputValue} fontFamily="Regular">
//                       {formatCurrency(discountAmount)}
//                     </ScalableText>
//                   </View>
//                 </View>

//                 {/* Discounted Payment Amount */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Payment After Discount
//                   </ScalableText>
//                   <View style={styles.inputContainer}>
//                     <ScalableText style={styles.inputValue} fontFamily="Regular">
//                       {formatCurrency(paymentAfterDiscount)}
//                     </ScalableText>
//                   </View>
//                 </View>

//                 {/* First Installment Question */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Are you paying first installment right now? *
//                   </ScalableText>
//                   <SelectDropdown
//                     label="Select option"
//                     onChange={(value) => setIsPayingFirstInstallment(value)}
//                     options={[
//                       { label: 'Paid', value: 'paid' },
//                       { label: 'Due', value: 'due' }
//                     ]}
//                     value={
//                       isPayingFirstInstallment
//                         ? ({
//                             label: isPayingFirstInstallment === 'paid' ? 'Paid' : 'Due',
//                             value: isPayingFirstInstallment,
//                           } as any)
//                         : (undefined as any)
//                     }
//                     dropdownButtonStyle={styles.couponDropdownStyle}
//                   />
//                 </View>

//                 {/* Payment Mode Fields - Only show if paying first installment */}
//                 {isPayingFirstInstallment === 'paid' && dynamicInstallments.length > 0 && (
//                   <View style={styles.formField}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Mode of Payment for Paid Installment *
//                     </ScalableText>
                    
//                     {/* Payment Mode Selection */}
//                     <View style={styles.paymentModeContainer}>
//                       <TouchableOpacity
//                         style={[
//                           styles.paymentModeButton,
//                           dynamicInstallments[0]?.paymentMode === 'cash' && styles.paymentModeButtonActive
//                         ]}
//                         onPress={() => {
//                           const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                             index === 0 ? { ...inst, paymentMode: 'cash' } : inst
//                           );
//                           setDynamicInstallments(updatedInstallments);
//                         }}
//                       >
//                         <ScalableText
//                           style={{
//                             ...styles.paymentModeButtonText,
//                             ...(dynamicInstallments[0]?.paymentMode === 'cash'
//                               ? styles.paymentModeButtonTextActive
//                               : {}),
//                           }}
//                           fontFamily="Medium"
//                         >
//                           Cash
//                         </ScalableText>
//                       </TouchableOpacity>
                      
//                       <TouchableOpacity
//                         style={[
//                           styles.paymentModeButton,
//                           dynamicInstallments[0]?.paymentMode === 'online' && styles.paymentModeButtonActive
//                         ]}
//                         onPress={() => {
//                           const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                             index === 0 ? { ...inst, paymentMode: 'online' } : inst
//                           );
//                           setDynamicInstallments(updatedInstallments);
//                         }}
//                       >
//                         <ScalableText
//                           style={{
//                             ...styles.paymentModeButtonText,
//                             ...(dynamicInstallments[0]?.paymentMode === 'online'
//                               ? styles.paymentModeButtonTextActive
//                               : {}),
//                           }}
//                           fontFamily="Medium"
//                         >
//                           Online
//                         </ScalableText>
//                       </TouchableOpacity>
//                     </View>

//                     {/* Payment Received By - Only show for cash mode */}
//                     {dynamicInstallments[0]?.paymentMode === 'cash' && (
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Payment Received By *
//                         </ScalableText>
//                         <SelectDropdown
//                           label="Select employee"
//                           onChange={(value) => {
//                             const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                               index === 0 ? { ...inst, paymentRecieverId: value } : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                           options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
//                           value={availableEmployees.find(emp => emp.value === dynamicInstallments[0]?.paymentRecieverId)}
//                           dropdownButtonStyle={styles.couponDropdownStyle}
//                         />
//                       </View>
//                     )}

//                     {/* Transaction ID - Only show for online mode */}
//                     {dynamicInstallments[0]?.paymentMode === 'online' && (
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Transaction ID *
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`transactionId${dynamicInstallments[0]?.installmentId}`}
//                           label=""
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter transaction ID"
//                           value={dynamicInstallments[0]?.transactionId || ''}
//                           onChangeText={(text) => {
//                             const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                               index === 0 ? { ...inst, transactionId: text } : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                         />
//                       </View>
//                     )}
//                   </View>
//                 )}

//                 {/* Due Installments Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.formLabel} fontFamily="Medium">
//                     Due Installments
//                   </ScalableText>
                  
//                   {dynamicInstallments.map((dueInst: any, index: number) => (
//                     <View key={`due-${dueInst.installmentId}`} style={styles.installmentContainer}>
//                       <View style={styles.installmentHeader}>
//                         <ScalableText style={styles.installmentTitle} fontFamily="Medium">
//                           Due Installment
//                         </ScalableText>
//                         <TouchableOpacity
//                           style={styles.removeInstallmentButton}
//                           onPress={() => handleRemoveInstallment(dueInst.installmentId)}
//                         >
//                           <ScalableText style={styles.removeButtonText} fontFamily="Bold">−</ScalableText>
//                         </TouchableOpacity>
//                       </View>
                      
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Due Date *
//                         </ScalableText>
//                         <View style={styles.inputContainer}>
//                           <DateInput
//                             handler={dateHandler}
//                             name={`installmentDate${dueInst.installmentId}`}
//                             label="Select due date"
//                             inputRoot={styles.dateInputStyle}
//                             minimumDate={new Date()}
//                           />
//                         </View>
//                       </View>

//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Due Amount *
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`installmentAmount${dueInst.installmentId}`}
//                           label=""
//                           keyboardType="numeric"
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter amount"
//                           onChangeText={(text) => {
//                             // Update the installment amount in state
//                             const newAmount = parseFloat(text) || 0;
//                             const updatedInstallments = dynamicInstallments.map(inst => 
//                               inst.installmentId === dueInst.installmentId 
//                                 ? { ...inst, duePayment: newAmount }
//                                 : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
                            
//                             console.log('🎯 Updated installment state:', {
//                               updatedInstallments,
//                               currentInstallmentId: dueInst.installmentId,
//                               newAmount
//                             });
                            
//                             // Auto-adjust remaining installments to maintain total
//                             // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//                             const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//                             const remainingAmount = baseAmount - newAmount;
//                             const remainingInstallments = dynamicInstallments.length - 1;
                            
//                             console.log('🎯 Auto-adjusting remaining installments:', {
//                               newAmount,
//                               baseAmount,
//                               remainingAmount,
//                               remainingInstallments,
//                               currentInstallmentId: dueInst.installmentId,
//                               selectedCoupon: selectedCoupon?.couponName,
//                               paymentAfterDiscount
//                             });
                            
//                             if (remainingInstallments > 0 && remainingAmount >= 0) {
//                               // Distribute remaining amount equally among remaining installments
//                               const equalAmount = Math.floor(remainingAmount / remainingInstallments);
//                               const remainder = remainingAmount % remainingInstallments;
                              
//                               let currentIndex = 1;
//                               const finalUpdatedInstallments = updatedInstallments.map(inst => {
//                                 if (inst.installmentId !== dueInst.installmentId) {
//                                   const installmentAmount = equalAmount + (currentIndex <= remainder ? 1 : 0);
//                                   currentIndex++;
//                                   console.log(`🎯 Auto-adjusted installment ${inst.installmentId} to: ${installmentAmount}`);
//                                   return { ...inst, duePayment: installmentAmount };
//                                 }
//                                 return inst;
//                               });
                              
//                               setDynamicInstallments(finalUpdatedInstallments);
                              
//                               console.log('🎯 Final updated installments after auto-adjustment:', finalUpdatedInstallments);
                              
//                               // Update form values for all installments
//                               finalUpdatedInstallments.forEach((inst) => {
//                                 const fieldName = `installmentAmount${inst.installmentId}`;
//                                 installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//                               });
//                             }
//                           }}
//                         />
//                       </View>

//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Description
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`installmentDescription${dueInst.installmentId}`}
//                           label=""
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter description"
//                           value={dueInst.paymentNotes || ''}
//                           onChangeText={(text) => {
//                             // Update the installment description in state
//                             const updatedInstallments = dynamicInstallments.map(inst => 
//                               inst.installmentId === dueInst.installmentId 
//                                 ? { ...inst, paymentNotes: text }
//                                 : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                         />
//                       </View>
//                     </View>
//                   ))}

//                   {/* Add New Due Installment Button */}
//                   <TouchableOpacity style={styles.addNewInstallmentButton} onPress={handleAddInstallment}>
//                     <ScalableText style={styles.addNewButtonText} fontFamily="Bold">+</ScalableText>
//                     <ScalableText style={styles.addNewButtonLabel} fontFamily="Medium">
//                       Add Due Installment
//                     </ScalableText>
//                   </TouchableOpacity>

 
//                 </View>

//                 {/* Submit Button */}
//                 <TouchableOpacity 
//                   style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
//                   onPress={handleSubmitPayment}
//                   disabled={isSubmitting}
//                 >
//                   <ScalableText style={styles.submitButtonText} fontFamily="SemiBold">
//                     {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
//                   </ScalableText>
//                 </TouchableOpacity>
//               </View>
//             </Flex>
//           )}
//         </Flex>
//       </ThemeScrollView>

//       {/* Update Payment Status Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={handleCloseModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Modal Header */}
//             <Flex flexDirection="row" justify="space-between" align="center" mb={25}>
//               <ScalableText style={styles.modalTitle} fontFamily="Bold">
//                 Update Payment Status
//               </ScalableText>
//               <TouchableOpacity 
//                 onPress={handleCloseModal} 
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.closeIconContainer}>
//                   <ScalableText style={styles.closeIcon} fontFamily="Bold">×</ScalableText>
//                 </View>
//               </TouchableOpacity>
//             </Flex>

//             {/* Current Payment Details - Single line format (web-style) */}
//             <View style={styles.currentPaymentDetailContainer}>
//               <Flex flexDirection="row" align="center" justify="space-between">
//                 <Flex flexDirection="row" align="center" styles={{ flexWrap: 'wrap', flex: 1 }}>
//                   {/* Date section */}
//                   <Flex flexDirection="row" align="center" mr={16}>
//                     <ScalableText style={styles.currentPaymentValue} fontFamily="Regular">
//                       {(() => {
//                         if (!selectedInstallment) return "-";
//                         if (selectedInstallment.paymentStatus?.toLowerCase() === "paid") {
//                           return formatDate(
//                             selectedInstallment.paymentReceiveDate ||
//                               selectedInstallment.paidDate ||
//                               selectedInstallment.receivedDate ||
//                               selectedInstallment.paymentDate
//                           );
//                         }
//                         return formatDate(
//                           selectedInstallment.nextpaymentDate ||
//                             selectedInstallment.formatedNextpaymentDate
//                         );
//                       })()}
//                     </ScalableText>
//                   </Flex>

//                   {/* Amount section */}
//                   <Flex flexDirection="row" align="center">
//                     <ScalableText style={styles.currentPaymentAmountValue} fontFamily="Bold">
//                       {formatCurrency(
//                         selectedInstallment?.receivedPayment ||
//                           selectedInstallment?.duePayment ||
//                           0
//                       )}
//                     </ScalableText>
//                   </Flex>
//                 </Flex>

//                 {/* Status chip on right */}
//                 {selectedInstallment && (
//                   <Flex
//                     styles={{
//                       ...styles.statusChip,
//                       backgroundColor: getStatusColor(selectedInstallment?.paymentStatus).backgroundColor,
//                     }}
//                     >
//                     <ScalableText
//                       style={{
//                         ...styles.statusChipText,
//                         color: getStatusColor(selectedInstallment?.paymentStatus).color,
//                       }}
//                       fontFamily="Medium"
//                     >
//                       {selectedInstallment?.paymentStatus?.toUpperCase()}
//                     </ScalableText>
//                   </Flex>
//                 )}
//               </Flex>
//             </View>

//             {/* Form row: Status + Date (side by side) */}
//             <View style={styles.formRowContainer}>
//               {/* Status field */}
//               <View style={styles.formFieldHalf}>
//                 <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                   Status *
//                 </ScalableText>
//                 <SelectDropdown
//                   label=""
//                   onChange={(value) => setPaymentStatus(value)}
//                   options={[
//                     { label: "Paid", value: "paid" },
//                     { label: "Due", value: "due" },
//                   ]}
//                   value={{
//                     label:
//                       paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
//                     value: paymentStatus,
//                   }}
//                   dropdownButtonStyle={styles.modalDropdownStyle}
//                 />
//               </View>

//               {/* Date field */}
//               <View style={styles.formFieldHalf}>
//                 <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                   Date *
//                 </ScalableText>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setStatusDatePickerOpen(true)}
//                  >  
//                   <Flex flexDirection="row" align="center" justify="space-between">
//                     <ScalableText style={styles.dateInputText} fontFamily="Regular">
//                       {paymentDate.toLocaleDateString("en-GB")}
//                     </ScalableText>
//                     <ScalableText style={styles.calendarIcon} fontFamily="Regular">
//                       📅
//                     </ScalableText>
//                   </Flex>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Mode of payment for this installment */}
//             <View style={styles.paymentModeSection}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Mode of payment for this installment
//               </ScalableText>
//               <View style={styles.paymentModeContainer}>
//                 <TouchableOpacity
//                   style={[
//                     styles.paymentModeButton,
//                     paymentMode === 'cash' && styles.paymentModeButtonActive
//                   ]}
//                   onPress={() => setPaymentMode('cash')}
//                 >
//                   <ScalableText 
//                     style={paymentMode === 'cash' 
//                       ? styles.paymentModeButtonTextActive 
//                       : styles.paymentModeButtonText
//                     } 
//                     fontFamily="Medium"
//                   >
//                     Cash
//                   </ScalableText>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[
//                     styles.paymentModeButton,
//                     paymentMode === 'online' && styles.paymentModeButtonActive
//                   ]}
//                   onPress={() => setPaymentMode('online')}
//                 >
//                   <ScalableText 
//                     style={paymentMode === 'online' 
//                       ? styles.paymentModeButtonTextActive 
//                       : styles.paymentModeButtonText
//                     } 
//                     fontFamily="Medium"
//                   >
//                     Online
//                   </ScalableText>
//                 </TouchableOpacity>
//               </View>

//               {/* Extra fields for selected payment mode - fixed height container to avoid jumping */}
//               <View style={styles.paymentModeExtraContainer}>
//                 {/* Payment Received By - only for cash */}
//                 {paymentMode === 'cash' && (
//                   <View style={styles.modalFieldSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Payment received by
//                     </ScalableText>
//                     <SelectDropdown
//                       label="Select employee"
//                       onChange={(value) => setPaymentReceiverId(value)}
//                       options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
//                       value={availableEmployees.find(emp => emp.value === paymentReceiverId) as any}
//                       dropdownButtonStyle={styles.modalDropdownStyle}
//                     />
//                   </View>
//                 )}

//                 {/* Transaction ID - only for online */}
//                 {paymentMode === 'online' && (
//                   <View style={styles.modalFieldSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Transaction ID
//                     </ScalableText>
//                     <View style={styles.transactionIdInputWrapper}>
//                       <Input
//                         handler={installmentHandler}
//                         name="modalTransactionId"
//                         label=""
//                         containerStyles={styles.transactionIdInputContainer}
//                         placeholder="Enter transaction ID"
//                         value={transactionId}
//                         onChangeText={(text) => setTransactionId(text)}
//                       />
//                     </View>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Note text */}
//             <View style={styles.noteContainer}>
//               <ScalableText style={styles.modalNote} fontFamily="Regular">
//                 Note: If you change the status of this installment from Paid to Due, the
//                 payment mode, transaction details and payment receiver details will also
//                 be removed.
//               </ScalableText>
//             </View>

//             {/* Save Button */}
//             <Button
//               title={isUpdating ? "UPDATING..." : "SAVE"}
//               onPress={handleSavePayment}
//               btnStyles={isUpdating ? styles.saveButtonDisabled : styles.saveButton}
//               btnTxtStyles={styles.saveButtonText}
//               disabled={isUpdating}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* Status Date Picker (for Update Payment Status modal) */}
//       <DatePicker
//         modal
//         open={statusDatePickerOpen}
//         mode="date"
//         date={paymentDate || new Date()}
//         onConfirm={(date) => {
//           setStatusDatePickerOpen(false);
//           if (date && !isNaN(date.getTime())) {
//             setPaymentDate(date);
//           }
//         }}
//         onCancel={() => setStatusDatePickerOpen(false)}
//       />

//       {/* Date Picker Modal */}
//       <Modal
//         visible={showDatePicker}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setShowDatePicker(false);
//           setSelectedInstallmentForDate('');
//         }}
//       >
//         <TouchableWithoutFeedback onPress={() => {
//           setShowDatePicker(false);
//           setSelectedInstallmentForDate('');
//         }}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View style={styles.datePickerContainer}>
//                 <View style={styles.datePickerHeader}>
//                   <ScalableText style={styles.datePickerTitle} fontFamily="Bold">
//                     Select Due Date
//                   </ScalableText>
//                   <TouchableOpacity onPress={() => {
//                     setShowDatePicker(false);
//                     setSelectedInstallmentForDate('');
//                   }}>
//                     <View style={styles.closeButtonContainer}>
//                       <ScalableText style={styles.closeButton} fontFamily="Bold">×</ScalableText>
//                     </View>
//                   </TouchableOpacity>
//                 </View>
                
//                 <DatePicker
//                   date={paymentDate || new Date()}
//                   mode="date"
//                   onDateChange={(date) => {
//                     console.log('DatePicker onDateChange:', date);
//                     if (date && !isNaN(date.getTime())) {
//                       console.log('Setting payment date to:', date);
//                       setPaymentDate(date);
//                     } else {
//                       console.log('Invalid date received:', date);
//                     }
//                   }}
//                   minimumDate={new Date()}
//                 />
                
//                 <View style={styles.datePickerActions}>
//                   <Button
//                     title="Cancel"
//                     onPress={() => {
//                       setShowDatePicker(false);
//                       setSelectedInstallmentForDate('');
//                     }}
//                     btnStyles={styles.cancelButton}
//                     btnTxtStyles={styles.cancelButtonText}
//                   />
//                   <Button
//                     title="Confirm"
//                     onPress={() => {
//                       // Update only the selected installment's due date
//                       if (paymentDate && !isNaN(paymentDate.getTime())) {
//                         console.log('Updating installment date:', {
//                           installmentId: selectedInstallmentForDate,
//                           newDate: paymentDate.toLocaleDateString("en-GB"),
//                           formattedDate: paymentDate.toISOString().split('T')[0]
//                         });
                        
//                         const updatedInstallments = dynamicInstallments.map(inst => 
//                           inst.installmentId === selectedInstallmentForDate 
//                             ? {
//                                 ...inst,
//                                 nextpaymentDate: paymentDate.toLocaleDateString("en-GB"),
//                                 formatedNextpaymentDate: paymentDate.toISOString().split('T')[0]
//                               }
//                             : inst
//                         );
                        
//                         console.log('Updated installments:', updatedInstallments);
//                         setDynamicInstallments(updatedInstallments);
//                         setShowDatePicker(false);
//                         setSelectedInstallmentForDate('');
//                       } else {
//                         console.log('Invalid payment date:', paymentDate);
//                       }
//                     }}
//                     btnStyles={styles.confirmButton}
//                     btnTxtStyles={styles.confirmButtonText}
//                   />
//                 </View>
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </SafeView>
//   );
// };

// const styles = StyleSheet.create({
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTab: {
//     backgroundColor: COLORS.white,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   inactiveTab: {
//     backgroundColor: "transparent",
//   },
//   activeTabText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   inactiveTabText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//     marginBottom: 5,
//   },
//   headerRow: {
//     backgroundColor: "#F8F9FA",
//     borderBottomWidth: 1,
//     borderColor: "#E8E8E8",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginBottom: 8,
    
//   },
//   installmentTableWrapper: {
//     minWidth: 900, // wider table so columns have more space
//   },
//   headerText: {
//     color: COLORS.textSecondary,
//     fontSize: 9,
//     textAlign: "center",
//     fontWeight: "600",
   
//   },
//   dataRow: {
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderColor: "#F0F0F0",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     marginBottom: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   dataText: {
//     color: COLORS.black,
//     fontSize: 12,
//     textAlign: "center",
//     textTransform: "capitalize",
//     lineHeight: 16,
//   },
//   statusChip: {
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 50,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   statusChipText: {
//     fontSize: 10,
//     textTransform: "uppercase",
//     fontWeight: "600",
//     letterSpacing: 0.3,
//   },
//   noDataText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//   },
//   modalContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 500,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   modalTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   modalSubtitle: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   currentLabel: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     marginBottom: 2,
//   },
//   currentValue: {
//     fontSize: 13,
//     color: COLORS.black,
//   },
//   paymentAmount: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//     marginTop: 2,
//   },
//   inputLabel: {
//     fontSize: 15,
//     marginBottom: 8,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "100%",
//     alignItems: "center",
//     shadowColor: COLORS.primary,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   saveButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   closeIconContainer: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeIcon: {
//     fontSize: 28,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Bold",
//     lineHeight: 28,
//     textAlign: 'center',
//   },
//   dateInput: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     width: "100%",
//     marginTop: 8,
//     minHeight: 48,
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   calendarIcon: {
//     fontSize: 18,
//   },
//   paymentDetailsCard: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     width: "100%",
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.primary,
//   },
//   modalCloseButton: {
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     width: 32,
//     height: 32,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: 'hidden',
//   },
//   saveButtonDisabled: {
//     backgroundColor: COLORS.textSecondary,
//     opacity: 0.7,
//   },
//   modalNote: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//     lineHeight: 16,
//   },
//   currentPaymentDetailContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginBottom: 20,
//   },
//   currentPaymentLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//     marginRight: 8,
//   },
//   currentPaymentValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   currentPaymentAmountValue: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//   },
//   formRowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     gap: 12,
//   },
//   formFieldHalf: {
//     flex: 1,
//   },
//   modalDropdownStyle: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginTop: 8,
//   },
//   modalFieldSpacing: {
//     marginTop: 8,
//   },
//   paymentModeExtraContainer: {
//     marginTop: 12,
//     minHeight: 110, // enough space for either dropdown or input, keeps modal position stable
//   },
//   noteContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 18,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: "#FFA500",
//   },
//   updateFormText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   updateFormContainer: {
//     padding: 24,
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//     borderWidth: 1,
//     borderColor: "#F0F0F0",
//   },
//   formField: {
//     marginBottom: 20,
//   },
//   formLabel: {
//     fontSize: 15,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//     marginBottom: 10,
//     fontWeight: "600",
//   },
//   inputField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   inputValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   couponSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   couponDropdown: {
//     flex: 1,
//     marginRight: 10,
//   },
//   couponPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   addCouponButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addButtonText: {
//     color: COLORS.white,
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     lineHeight: 24,
//   },
//   dropdownField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   dropdownPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   installmentRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   installmentInfo: {
//     flex: 1,
//     marginRight: 10,
//   },
//   installmentLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//     marginBottom: 8,
//   },
//   dateField: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   dateValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//     flex: 1,
//   },
//   amountField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   amountValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   addInstallmentButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   descriptionField: {
//     marginTop: 15,
//   },
//   textAreaField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   textAreaPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   submitButtonText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//     fontWeight: "600",
//   },
//   submitButtonDisabled: {
//     backgroundColor: COLORS.textSecondary,
//     opacity: 0.7,
//   },
//   paymentModeSection: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   paymentModeContainer: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 8,
//   },
//   paymentModeButton: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   paymentModeButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   paymentModeButtonText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   paymentModeButtonTextActive: {
//     color: COLORS.white,
//   },
//   debugContainer: {
//     backgroundColor: "#F0F0F0",
//     borderRadius: 10,
//     padding: 15,
//     marginTop: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   debugText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//     marginBottom: 5,
//   },
//   reminderMenu: {
//     position: 'absolute',
//     top: 25,
//     right: -10,
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     padding: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//     zIndex: 1000,
//     minWidth: 100,
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//   },
//   reminderMenuItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginVertical: 2,
//   },
//   reminderMenuText: {
//     fontSize: 13,
//     color: COLORS.black,
//     fontFamily: 'Poppins-Medium',
//     textAlign: 'center',
//   },
//   reminderButton: {
//     padding: 2,
//     borderRadius: 8,
//     backgroundColor: "#F8F9FA",
//     width: 24,
//     height: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   summarySection: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   paidStatusBadge: {
//     backgroundColor: "#ECFFE0",
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     alignSelf: "flex-start",
//     marginTop: 10,
//   },
//   paidStatusText: {
//     fontSize: 12,
//     color: "#4AC400",
//     fontFamily: "Poppins-Bold",
//   },
//   removeInstallmentButton: {
//     backgroundColor: "#FFE6E6",
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   removeButtonText: {
//     fontSize: 18,
//     color: "#FF4444",
//     fontFamily: "Poppins-Bold",
//   },
//   addNewInstallmentButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginTop: 15,
//   },
//   addNewButtonText: {
//     fontSize: 20,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//     marginRight: 8,
//   },
//   addNewButtonLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   descriptionValue: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   installmentContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   installmentHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   installmentTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: COLORS.primary,
//     fontFamily: "Poppins-Medium",
//   },
//   inputSpacing: {
//     marginBottom: 10,
//   },
//   inputContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   transactionIdInputWrapper: {
//     marginTop: 8,
//   },
//   transactionIdInputContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     borderWidth: 0,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   dateInputStyle: {
//     marginTop: 0,
//     height: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     backgroundColor: COLORS.white,
//     elevation: 0,
//     shadowOpacity: 0,
//     justifyContent: 'center',
//     paddingHorizontal: 16,
//   },
//   couponContainer: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: 8,
//     marginTop: 8,
//   },
//   addButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     borderWidth: 0,
//   },
//   couponDropdownStyle: {
//     flex: 1,
//     marginRight: 8,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   selectedCouponContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     marginRight: 8,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   selectedCouponInfo: {
//     flex: 1,
//   },
//   selectedCouponName: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   removeCouponButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   removeCouponText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontFamily: "Poppins-Bold",
//   },
//   totalAmountSection: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   totalAmountRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   totalAmountLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   totalAmountValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   datePickerContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 24,
//     width: "85%",
//     maxWidth: 400,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   datePickerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   datePickerTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   cancelButton: {
//     backgroundColor: COLORS.textSecondary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "48%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   confirmButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "48%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   confirmButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   datePickerActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//     gap: 12,
//   },
//   closeButton: {
//     fontSize: 24,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Bold",
//   },
//   closeButtonContainer: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     width: 36,
//     height: 36,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// export default UpdatePaymentScreen; 


// import React, { FC, useState, useMemo, useEffect } from "react";
// import { StyleSheet, View, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import SafeView from "../../../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../../../@ui/app-header/AppHeader";
// import ThemeScrollView from "../../../../../@ui/theme-scroll-view/ThemeScrollView";
// import Flex from "../../../../../@ui/flex/Flex";
// import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../../../colors";
// import { Col, Grid, Row } from "react-native-easy-grid";
// import { THomeStackNavigator } from "../../../../../navigators/tab-navigator/sub-stack-navigator/HomeStackNavigator";
// import { useCourseDetailsQuery } from "../../../../../apis/hooks/course/query/useCourseDetails.query";
// import { useStudentDetailsQuery } from "../../../../../apis/hooks/students/query/useStudentDetails.query";
// import { useListCouponsQuery } from "../../../../../apis/hooks/coupons/query/useListCoupons.query";
// import { useEmployeesListQuery } from "../../../../../apis/hooks/employee/query/useEmployeesList.query";
// import ActionIcon from "../../../../../@ui/action-icon/ActionIcon";
// import AutoHeightImage from "../../../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../../../images";
// import Button from "../../../../../@ui/button/Button";
// import SelectDropdown from "../../../../../@ui/select-dropdown/SelectDropdown";
// import Input from "../../../../../@ui/input/Input";
// import DateInput from "../../../../../@ui/date-input/DateInput";
// import DatePicker from "react-native-date-picker";
// import { request } from "../../../../../services/axios.service";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../../app/store";
// import { useForm } from "react-hook-form";
// import { useQueryClient } from "@tanstack/react-query";
// import { apiUrls } from "../../../../../apis/urls";
// import { useSendStudentFeeSlipInvoiceMutation } from "../../../../../apis/hooks/students/mutation/useSendStudentFeeSlipInvoice.mutation";
// import { useSendReminderMutation } from "../../../../../apis/hooks/students/mutation/useSendReminder.mutation";
// import { useSendEmailReminderMutation } from "../../../../../apis/hooks/students/mutation/useSendEmailReminder.mutation";
// import { ToastAndroid } from "react-native";

// interface IUpdatePaymentScreen {
//   course: TCourse;
//   studentRollNo: string;
// }

// interface CouponOption {
//   label: string;
//   value: string;
//   couponData?: any;
// }

// const UpdatePaymentScreen: FC = () => {
//   const navigation = useNavigation<THomeStackNavigator>();
//   const route = useRoute<any>();
//   const { course, studentRollNo } = route.params;
//   const [activeTab, setActiveTab] = useState<"installment" | "payment">("installment");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
//   const [paymentStatus, setPaymentStatus] = useState("paid");
//   const [paymentDate, setPaymentDate] = useState(() => {
//     const today = new Date();
//     return today;
//   });
//   const [paymentMode, setPaymentMode] = useState<string>("");
//   const [paymentReceiverId, setPaymentReceiverId] = useState<string>("");
//   const [transactionId, setTransactionId] = useState<string>("");
//   const [showDatePicker, setShowDatePicker] = useState(false); // for installment due dates
//   const [statusDatePickerOpen, setStatusDatePickerOpen] = useState(false); // for Update Payment Status modal
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [showReminderMenu, setShowReminderMenu] = useState<string | null>(null);
//   const [isPayingFirstInstallment, setIsPayingFirstInstallment] = useState<string>('');
//   const [installmentDescription, setInstallmentDescription] = useState('');
//   const [selectedInstallmentForDate, setSelectedInstallmentForDate] = useState<string>('');
  
  
//   // Form handler for dynamic installments
//   const installmentHandler = useForm();
  
//   // Form handler for date inputs
//   const dateHandler = useForm();
  
//   // Coupon states
//   const [availableCoupons, setAvailableCoupons] = useState<CouponOption[]>([
//     { label: 'Select coupon', value: '' }
//   ]);
//   const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [paymentAfterDiscount, setPaymentAfterDiscount] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Employee states
//   const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  
//   // Dynamic installment states
//   const [dynamicInstallments, setDynamicInstallments] = useState<any[]>([]);
//   const [nextInstallmentNumber, setNextInstallmentNumber] = useState(1);

//   // Set default values for installment amounts
//   useMemo(() => {
//     dynamicInstallments.forEach((inst: any) => {
//       installmentHandler.setValue(`installmentAmount${inst.installmentId}`, inst.duePayment?.toString() || "0");
//     });
//   }, [dynamicInstallments]);

//   // Watch for changes in installment amounts
//   const watchedAmounts = installmentHandler.watch();

//   // Update installment amounts when form values change
//   useEffect(() => {
//     dynamicInstallments.forEach((inst) => {
//       const fieldName = `installmentAmount${inst.installmentId}`;
//       const newAmount = watchedAmounts[fieldName];
      
//       if (newAmount !== undefined && newAmount !== inst.duePayment?.toString()) {
//         const amount = parseFloat(newAmount) || 0;
//         handleUpdateInstallmentAmount(inst.installmentId, amount);
//       }
//     });
//   }, [watchedAmounts]);
  
//   // Get user and organization data from Redux
//   const authUser = useSelector((state: RootState) => state.auth.authUser);
//   const selectedOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);
//   const organization = useSelector((state: RootState) => state.organization.organization);

//   // Get query client for cache invalidation
//   const queryClient = useQueryClient();

//   // Mutation hook for sending invoice email
//   const { mutateAsync: sendInvoiceEmail, isPending: isSendingInvoice } = useSendStudentFeeSlipInvoiceMutation();
  
//   // Mutation hook for sending reminders (WhatsApp/SMS)
//   const { mutateAsync: sendReminder, isPending: isSendingReminder } = useSendReminderMutation();
  
//   // Mutation hook for sending email reminders
//   const { mutateAsync: sendEmailReminder, isPending: isSendingEmailReminder } = useSendEmailReminderMutation();

//   // API calls for dynamic data
//   const { data: courseData, isLoading: courseLoading } = useCourseDetailsQuery({
//     courseId: course.courseId,
//   });

//   const { data: studentData, isLoading: studentLoading, refetch: refetchStudentData } = useStudentDetailsQuery(studentRollNo);

//   // Fetch coupons from API
//   const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useListCouponsQuery();
  
//   // Fetch employees from API
//   const { data: employeesData, isLoading: employeesLoading } = useEmployeesListQuery();

//   // Get payment details from student data
//   const paymentDetails = useMemo(() => {
//     console.log("Student Data:", JSON.stringify(studentData, null, 2));
//     console.log("Course ID:", course.courseId);
    
//     if (studentData?.data?.courses) {
//       const foundCourse = studentData.data.courses.find((c: any) => c.courseId === course.courseId);
//       console.log("Found Course:", JSON.stringify(foundCourse, null, 2));
//       return foundCourse?.paymentDetails;
//     }
//     return null;
//   }, [studentData, course.courseId]);

//   // Get installment details
//   const installmentDetails = useMemo(() => {
//     console.log("Payment Details:", JSON.stringify(paymentDetails, null, 2));
//     console.log("Installment Details:", JSON.stringify(paymentDetails?.installmentDetails, null, 2));
//     return paymentDetails?.installmentDetails || [];
//   }, [paymentDetails]);

//   // Convert API coupon data to dropdown options
//   useMemo(() => {
//     if (couponsData && couponsData.length > 0) {
//       const couponOptions: CouponOption[] = couponsData.map((coupon: any) => ({
//         label: `${coupon.couponName} - ${coupon.couponType === 'Flat' ? '₹' : '%'}${coupon.couponValue}`,
//         value: coupon.couponId || coupon.couponName.toLowerCase().replace(/\s+/g, ''),
//         couponData: coupon // Store full coupon data for reference
//       }));
//       setAvailableCoupons(couponOptions);
//       console.log('🎫 Coupons loaded from API:', couponOptions);
//     }
//   }, [couponsData]);

//   // Convert API employee data to dropdown options
//   useMemo(() => {
//     if (employeesData?.data && employeesData.data.length > 0) {
//       const employeeOptions = employeesData.data.map((employee: any) => {
//         const firstName = employee?.employeePersonalDetails?.employeeFirstname || employee.employeeFirstName || '';
//         const lastName = employee?.employeePersonalDetails?.employeeLastname || employee.employeeLastName || '';
//         const displayName = `${firstName} ${lastName}`.trim();
//         const employeeId = employee.employeeId || employee.id;
        
//         return {
//           label: `${displayName} (${employeeId})`,
//           value: employeeId,
//           employeeData: employee
//         };
//       });
//       setAvailableEmployees(employeeOptions);
//       console.log('👥 Employees loaded from API:', employeeOptions);
//     }
//   }, [employeesData]);

//   // Calculate discount and payment after discount when coupon changes
//   useMemo(() => {
//     const totalDuePayment = paymentDetails?.totalDuePayment || 0;
    
//     if (selectedCoupon && totalDuePayment > 0) {
//       let calculatedDiscount = 0;
      
//       if (selectedCoupon.couponType === 'flat') {
//         calculatedDiscount = parseFloat(selectedCoupon.discountValue) || 0;
//       } else if (selectedCoupon.couponType === 'percentage') {
//         const percentageValue = parseFloat(selectedCoupon.discountValue) || 0;
//         calculatedDiscount = (totalDuePayment * percentageValue) / 100;
//       }
      
//       const calculatedPaymentAfterDiscount = Math.max(0, totalDuePayment - calculatedDiscount);
      
//       setDiscountAmount(Math.round(calculatedDiscount));
//       setPaymentAfterDiscount(Math.round(calculatedPaymentAfterDiscount));
      
//       console.log('Coupon calculation based on total due payment:', {
//         totalDuePayment,
//         selectedCoupon,
//         calculatedDiscount,
//         calculatedPaymentAfterDiscount
//       });
//     } else {
//       setDiscountAmount(0);
//       setPaymentAfterDiscount(totalDuePayment);
//     }
//   }, [selectedCoupon, paymentDetails?.totalDuePayment]);

//   // Check if we're returning from AddCouponScreen with new coupon data
//   useMemo(() => {
//     if (route.params?.newCoupon) {
//       const newCoupon = route.params.newCoupon;
      
//       // Add the new coupon to the available coupons list
//       const couponOption: CouponOption = {
//         label: `${newCoupon.couponName} - ${newCoupon.couponType === 'flat' ? '₹' : ''}${newCoupon.couponType === 'percentage' ? '%' : ''}${newCoupon.discountValue}`,
//         value: newCoupon.couponId || newCoupon.couponName.toLowerCase().replace(/\s+/g, ''),
//         couponData: newCoupon
//       };
      
//       setAvailableCoupons((prev: CouponOption[]) => [...prev.slice(1), couponOption]); // Keep "Select coupon" as first option
      
//       // Set the newly created coupon as selected
//       setSelectedCoupon(newCoupon);
      
//       // Clear the route params
//       navigation.setParams({ newCoupon: undefined });
      
//       // Refetch coupons to get updated list
//       refetchCoupons();
//     }
//   }, [route.params?.newCoupon]);

//   const handleCouponSelection = (selectedValue: string) => {
//     console.log('Coupon selected:', selectedValue);
//     if (selectedValue) {
//       // Find the selected coupon object
//       const coupon = availableCoupons.find((opt: CouponOption) => opt.value === selectedValue);
//       if (coupon && coupon.value !== '') {
//         // Use real coupon data from API
//         const couponData = {
//           couponName: coupon.couponData?.couponName || coupon.label.split(' - ')[0],
//           couponType: coupon.couponData?.couponType?.toLowerCase() || (coupon.label.includes('₹') ? 'flat' : 'percentage'),
//           discountValue: coupon.couponData?.couponValue || parseInt(coupon.label.match(/\d+/)?.[0] || '0'),
//           couponId: coupon.couponData?.couponId
//         };
//         setSelectedCoupon(couponData);
//         console.log('Coupon data set:', couponData);
//       } else {
//         setSelectedCoupon(null);
//       }
//     } else {
//       setSelectedCoupon(null);
//     }
//   };

//   const handleAddCoupon = () => {
//     (navigation as any).navigate('AddCoupon', { returnScreen: 'UpdatePayment' });
//   };

//   // Initialize dynamic installments from existing due installments
//   useMemo(() => {
//     const dueInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'due');
//     const mappedInstallments = dueInstallments.map((inst: any) => ({
//       ...inst,
//       isDynamic: false // Mark existing installments as non-dynamic
//     }));
    
//     setDynamicInstallments(mappedInstallments);
//     setNextInstallmentNumber(dueInstallments.length + 1);
    
//     // Set initial form values for existing installments
//     mappedInstallments.forEach((inst: any) => {
//       // Set amount
//       const amountFieldName = `installmentAmount${inst.installmentId}`;
//       installmentHandler.setValue(amountFieldName, inst.duePayment?.toString() || "0");
      
//       // Set date - parse the date and set it
//       const dateFieldName = `installmentDate${inst.installmentId}`;
//       if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
//         let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
        
//         // Convert various date formats to Date object
//         if (dateValue) {
//           try {
//             let parsedDate = new Date();
            
//             // Check if it's already a valid Date string (ISO format YYYY-MM-DD)
//             if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
//               parsedDate = new Date(dateValue);
//             }
//             // Check if it's DD-MM-YYYY format
//             else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
//               const parts = dateValue.split('-');
//               // If first part is 2 digits, it's DD-MM-YYYY
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 // Otherwise it might be YYYY-MM-DD
//                 parsedDate = new Date(dateValue);
//               }
//             }
//             // Check if it's DD/MM/YYYY format
//             else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
//               const parts = dateValue.split('/');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 const [year, month, day] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               }
//             }
//             // Try standard Date parsing
//             else {
//               parsedDate = new Date(dateValue);
//             }
            
//             if (!isNaN(parsedDate.getTime())) {
//               dateHandler.setValue(dateFieldName, parsedDate);
//               console.log(`✅ Set date for ${dateFieldName}:`, parsedDate);
//             } else {
//               console.log(`❌ Invalid date for ${dateFieldName}:`, dateValue);
//             }
//           } catch (error) {
//             console.log('Date parsing error in initialization:', error, dateValue);
//           }
//         }
//       }
//     });
    
//     console.log('Initialized dynamic installments:', {
//       dueInstallments: mappedInstallments.length,
//       mappedInstallments
//     });
//   }, [installmentDetails]);

//   // Sync form values when dynamicInstallments change
//   useEffect(() => {
//     dynamicInstallments.forEach((inst: any) => {
//       // Sync amount
//       const amountFieldName = `installmentAmount${inst.installmentId}`;
//       const currentAmount = installmentHandler.getValues(amountFieldName);
//       const expectedAmount = inst.duePayment?.toString() || "0";
//       if (currentAmount !== expectedAmount) {
//         installmentHandler.setValue(amountFieldName, expectedAmount, { shouldValidate: false });
//       }
      
//       // Sync date
//       const dateFieldName = `installmentDate${inst.installmentId}`;
//       if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
//         let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
//         if (dateValue) {
//           try {
//             let parsedDate = new Date();
//             if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
//               parsedDate = new Date(dateValue);
//             } else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
//               const parts = dateValue.split('-');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 parsedDate = new Date(dateValue);
//               }
//             } else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
//               const parts = dateValue.split('/');
//               if (parts[0].length === 2) {
//                 const [day, month, year] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               } else {
//                 const [year, month, day] = parts;
//                 parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//               }
//             } else {
//               parsedDate = new Date(dateValue);
//             }
            
//             if (!isNaN(parsedDate.getTime())) {
//               const currentDate = dateHandler.getValues(dateFieldName);
//               if (!currentDate || currentDate.getTime() !== parsedDate.getTime()) {
//                 dateHandler.setValue(dateFieldName, parsedDate, { shouldValidate: false });
//               }
//             }
//           } catch (error) {
//             console.log('Date sync error:', error);
//           }
//         }
//       }
//     });
//   }, [dynamicInstallments]);


//   // Get total due amount including paid installments and coupon discount (PaymentDetailsScreen style)
//   const getTotalDueAmount = () => {
//     const paidInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid');
//     const totalPaidAmount = paidInstallments.reduce((sum: number, inst: any) => sum + (inst.receivedPayment || inst.duePayment || 0), 0);
    
//     // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//     const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
    
//     // Total due amount = Base amount (after coupon) - Total paid amount
//     const totalDueAmount = Math.max(0, baseAmount - totalPaidAmount);
    
//     console.log('Total due calculation with coupon (PaymentDetailsScreen style):', {
//       totalDuePayment: paymentDetails?.totalDuePayment,
//       paymentAfterDiscount,
//       selectedCoupon: selectedCoupon?.couponName,
//       discountAmount,
//       baseAmount,
//       totalPaidAmount,
//       totalDueAmount,
//       paidInstallments: paidInstallments.length
//     });
    
//     return totalDueAmount;
//   };

//   // Add new installment
//   const handleAddInstallment = () => {
//     const newInstallment = {
//       installmentId: `dynamic-${Date.now()}`,
//       installmentNumber: nextInstallmentNumber,
//       paymentStatus: 'due',
//       duePayment: 0, // Will be calculated automatically
//       nextpaymentDate: new Date().toLocaleDateString("en-GB"),
//       paymentNotes: '',
//       isDynamic: true
//     };
    
//     // Add new installment to the list
//     const updatedInstallments = [...dynamicInstallments, newInstallment];
//     setDynamicInstallments(updatedInstallments);
//     setNextInstallmentNumber(prev => prev + 1);
    
//     // Recalculate all amounts after adding new installment (PaymentDetailsScreen style)
//     setTimeout(() => {
//       // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, updatedInstallments.length);
      
//       const finalInstallments = updatedInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(finalInstallments);
      
//       // Update form values for all installments
//       finalInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Added new installment and recalculated (PaymentDetailsScreen style):', {
//         newInstallment,
//         baseAmount,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         totalInstallments: updatedInstallments.length,
//         selectedCoupon: selectedCoupon?.couponName,
//         paymentAfterDiscount,
//         finalInstallments
//       });
//     }, 0);
//   };

//   // Remove installment
//   const handleRemoveInstallment = (installmentId: string) => {
//     // Prevent removing if only one installment remains
//     if (dynamicInstallments.length <= 1) {
//       Alert.alert(
//         "Cannot Remove",
//         "At least one installment must remain.",
//         [{ text: "OK" }]
//       );
//       return;
//     }
    
//     // Remove installment from the list
//     const remainingInstallments = dynamicInstallments.filter(inst => inst.installmentId !== installmentId);
//     setDynamicInstallments(remainingInstallments);
    
//     // Clear form value for removed installment
//     installmentHandler.unregister(`installmentAmount${installmentId}`);
    
//     // Recalculate all amounts after removing installment (PaymentDetailsScreen style)
//     setTimeout(() => {
//       // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, remainingInstallments.length);
      
//       const updatedInstallments = remainingInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(updatedInstallments);
      
//       // Update form values for all remaining installments
//       updatedInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Removed installment and recalculated (PaymentDetailsScreen style):', {
//         removedInstallmentId: installmentId,
//         baseAmount,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         remainingInstallments: updatedInstallments.length,
//         selectedCoupon: selectedCoupon?.couponName,
//         paymentAfterDiscount,
//         updatedInstallments
//       });
//     }, 0);
//   };

//   // Update installment amount
//   const handleUpdateInstallmentAmount = (installmentId: string, newAmount: number) => {
//     setDynamicInstallments(prev => prev.map(inst => 
//       inst.installmentId === installmentId 
//         ? { ...inst, duePayment: newAmount }
//         : inst
//     ));
//   };

//   // Validate total amount
//   const validateTotalAmount = () => {
//     const totalCalculated = dynamicInstallments.reduce((sum, inst) => sum + (inst.duePayment || 0), 0);
//     const expectedTotal = paymentAfterDiscount;
//     const difference = Math.abs(totalCalculated - expectedTotal);
    
//     console.log('Amount validation:', {
//       totalCalculated,
//       expectedTotal,
//       difference,
//       isValid: difference <= 1 // Allow 1 rupee difference due to rounding
//     });
    
//     return difference <= 1;
//   };

//   // Helper function to calculate and distribute installment amounts evenly (same as PaymentDetailsScreen)
//   const calculateAndDistributeInstallments = (baseAmount: number, numberOfInstallments: number) => {
//     const equalAmount = Math.floor(baseAmount / numberOfInstallments);
//     const remainder = baseAmount % numberOfInstallments;
    
//     const installmentAmounts: number[] = [];
//     for (let i = 1; i <= numberOfInstallments; i++) {
//       const installmentAmount = equalAmount + (i <= remainder ? 1 : 0);
//       installmentAmounts.push(installmentAmount);
//     }
    
//     return {
//       equalAmount,
//       remainder,
//       installmentAmounts
//     };
//   };

//   // Function to recalculate all installment amounts
//   const recalculateInstallmentAmounts = () => {
//     if (dynamicInstallments.length > 0) {
//       // If coupon is applied, always recalculate amounts based on paymentAfterDiscount
//       // If no coupon and no dynamic installments, keep original amounts
//       const hasDynamic = dynamicInstallments.some((inst: any) => inst.isDynamic);
//       const hasCoupon = !!selectedCoupon;
      
//       if (!hasDynamic && !hasCoupon) {
//         // No coupon and no new installments - keep original amounts
//         return dynamicInstallments;
//       }

//       // Use paymentAfterDiscount as base amount when coupon is applied
//       // Otherwise use totalDuePayment
//       const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//       const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, dynamicInstallments.length);
      
//       const updatedInstallments = dynamicInstallments.map((inst, index) => ({
//         ...inst,
//         duePayment: installmentAmounts[index] || inst.duePayment
//       }));
      
//       setDynamicInstallments(updatedInstallments);
      
//       // Update form values for the new amounts
//       updatedInstallments.forEach((inst) => {
//         const fieldName = `installmentAmount${inst.installmentId}`;
//         installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//       });
      
//       console.log('Recalculated amounts (PaymentDetailsScreen style):', {
//         baseAmount,
//         numberOfInstallments: dynamicInstallments.length,
//         equalAmount,
//         remainder,
//         installmentAmounts,
//         selectedCoupon: selectedCoupon?.couponName,
//         discountAmount,
//         paymentAfterDiscount,
//         hasCoupon,
//         hasDynamic,
//         updatedInstallments
//       });
      
//       return updatedInstallments;
//     }
//     return dynamicInstallments;
//   };

//   // Recalculate all amounts when payment after discount or coupon changes
//   useMemo(() => {
//     recalculateInstallmentAmounts();
//   }, [paymentAfterDiscount, installmentDetails, selectedCoupon, discountAmount]); // Add coupon dependencies


//   // Monitor dynamicInstallments changes for debugging
//   useEffect(() => {
//     console.log('Dynamic installments updated:', dynamicInstallments);
//   }, [dynamicInstallments]);

//   // Trigger recalculation when installment count changes
//   useEffect(() => {
//     if (dynamicInstallments.length > 0) {
//       // Small delay to ensure state is updated
//       const timer = setTimeout(() => {
//         recalculateInstallmentAmounts();
//       }, 100);
      
//       return () => clearTimeout(timer);
//     }
//   }, [dynamicInstallments.length]);

//   const handleEditInstallment = (installment: any) => {
//     setSelectedInstallment(installment);
//     setPaymentStatus(installment.paymentStatus || "paid");
//     setPaymentMode(installment.paymentMode || "");
//     setPaymentReceiverId(installment.paymentRecieverId || installment.paymentReceiverId || "");
//     setTransactionId(installment.transactionId || "");
    
//     // Safely parse the payment date
//     let initialDate = new Date();
//     try {
//       if (installment.paymentReceiveDate) {
//         // Handle different date formats
//         if (installment.paymentReceiveDate.includes('-')) {
//           const [day, month, year] = installment.paymentReceiveDate.split('-');
//           initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//         } else if (installment.paymentReceiveDate.includes('/')) {
//           const [day, month, year] = installment.paymentReceiveDate.split('/');
//           initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//         } else {
//           initialDate = new Date(installment.paymentReceiveDate);
//         }
        
//         // Validate the date
//         if (isNaN(initialDate.getTime())) {
//           initialDate = new Date();
//         }
//       }
//     } catch (error) {
//       console.log('Date parsing error in handleEditInstallment:', error);
//       initialDate = new Date();
//     }
    
//     setPaymentDate(initialDate);
//     setModalVisible(true);
//   };

//   const handleSavePayment = async () => {
//     if (!selectedInstallment || !authUser || !selectedOrganization) {
//       Alert.alert("Error", "Required data is missing");
//       return;
//     }

//     setIsUpdating(true);
    
//     try {
//       const payload = {
//         user: {
//           userCustomerId: authUser.customerId,
//           userCustomerName: authUser.customerName,
//           userCustomerEmail: authUser.customerEmail,
//           roleName: selectedOrganization.role?.roleName || authUser.userType,
//           roleId: selectedOrganization.role?.roleId || authUser.employeeId,
//           userEmployeeId: authUser.employeeId
//         },
//         customerId: selectedOrganization.customerId,
//         organizationId: selectedOrganization.organizationId,
//         rollNo: studentRollNo,
//         courseId: course.courseId,
//         updatedPaymentStatus: paymentStatus,
//         updatedDate: paymentDate.toLocaleDateString("en-GB").split("/").reverse().join("-"),
//         installmentNumber: selectedInstallment.installmentNumber,
//         ...(paymentMode && { paymentMode: paymentMode }),
//         ...(paymentMode === "cash" && paymentReceiverId && { paymentRecieverId: paymentReceiverId }),
//         ...(paymentMode === "online" && transactionId && { transactionId })
//       };

//       console.log("Updating payment status with payload:", payload);

//       const response = await request({
//         method: "POST",
//         url: "/student-fnp-prod/updateStudentPaymentStatus",
//         data: payload
//       });

//       console.log("Payment status update response:", response);

//       if (response.statusCode === 200) {
//         // Invalidate queries to refresh all related data
//         console.log("🔄 Invalidating queries after payment status update");
        
//         // Invalidate student details query
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
//         });
        
//         // Invalidate course details query (in case it includes payment info)
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
//         });
        
//         // Also invalidate student list queries that might show payment status
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
//         });
        
//         // Refetch student data to ensure immediate update
//         await refetchStudentData();
        
//         Alert.alert("Success", "Payment status updated successfully!", [
//           {
//             text: "OK",
//             onPress: () => {
//               setModalVisible(false);
//               setSelectedInstallment(null);
//             }
//           }
//         ]);
//       } else {
//         Alert.alert("Error", response.message || "Failed to update payment status");
//       }
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//       Alert.alert("Error", "Failed to update payment status. Please try again.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setModalVisible(false);
//     setSelectedInstallment(null);
//     setPaymentMode("");
//     setPaymentReceiverId("");
//     setTransactionId("");
//   };

//   const handleDownloadInvoice = (installmentId: string) => {
//     console.log("Download invoice:", installmentId);
//     Alert.alert("Download Invoice", "Download functionality will be implemented soon");
//   };

//   const handleViewInvoice = async (installmentId: string) => {
//     try {
//       console.log("📧 === SENDING INVOICE EMAIL ===");
//       console.log("Installment ID:", installmentId);

//       // Find the installment details
//       const installment = installmentDetails.find((inst: any) => inst.installmentId === installmentId);
//       if (!installment) {
//         Alert.alert("Error", "Installment not found");
//         return;
//       }

//       // Get student data
//       const studentDetails = studentData?.data;
//       if (!studentDetails) {
//         Alert.alert("Error", "Student details not found");
//         return;
//       }

//       // Get course data
//       if (!courseData) {
//         Alert.alert("Error", "Course details not found");
//         return;
//       }

//       // Get organization and GST data
//       const gstRuleData = organization?.gstRuleData;
//       const gstInclusionType = gstRuleData?.inclusionType || 'noGST';
//       const cgstPercentage = gstRuleData?.cgstPercentage || 0;
//       const sgstPercentage = gstRuleData?.sgstPercentage || 0;
//       const gstinNumber = gstRuleData?.gstinNumber || '';

//       // Calculate amounts
//       const paidAmount = installment.receivedPayment || installment.duePayment || 0;
//       const courseFee = paymentDetails?.totalPayment || courseData?.data?.courseFee || courseData?.courseFee || 0;
//       const totalReceivedAmount = paymentDetails?.totalReceivedPayment || 0;
//       const totalDueAmount = paymentDetails?.totalDuePayment || 0;
//       const discountAmount = paymentDetails?.discountedPaymentAmount || 0;
//       const amountAfterDiscount = courseFee - discountAmount;

//       // Calculate GST amounts based on inclusion type
//       let cgstAmount = 0;
//       let sgstAmount = 0;
//       let tuitionFee = paidAmount;
      
//       if (gstInclusionType === 'included' && (cgstPercentage > 0 || sgstPercentage > 0)) {
//         // GST is included in the amount
//         const baseAmount = paidAmount / (1 + (cgstPercentage + sgstPercentage) / 100);
//         cgstAmount = Math.round((baseAmount * cgstPercentage) / 100);
//         sgstAmount = Math.round((baseAmount * sgstPercentage) / 100);
//         tuitionFee = Math.round(baseAmount);
//       } else if (gstInclusionType === 'excluded' && (cgstPercentage > 0 || sgstPercentage > 0)) {
//         // GST is added on top
//         cgstAmount = Math.round((paidAmount * cgstPercentage) / 100);
//         sgstAmount = Math.round((paidAmount * sgstPercentage) / 100);
//         tuitionFee = paidAmount - (cgstAmount + sgstAmount);
//       }

//       // Calculate previous received amounts
//       const previousReceivedAmount = totalReceivedAmount - paidAmount;
//       const remainingDueAmount = totalDueAmount - paidAmount;

//       // Convert amount to words (simple implementation)
//       const amountToWords = (amount: number) => {
//         if (amount === 0) return 'Zero';
//         if (amount === 1000) return 'Rupees One Thousand only';
//         if (amount === 10000) return 'Rupees Ten Thousand only';
//         if (amount === 15000) return 'Rupees Fifteen Thousand only';
//         if (amount === 20000) return 'Rupees Twenty Thousand only';
//         if (amount === 50000) return 'Rupees Fifty Thousand only';
//         if (amount === 75000) return 'Rupees Seventy Five Thousand only';
//         if (amount === 99000) return 'Rupees Ninety Nine Thousand only';
//         return `Rupees ${amount.toLocaleString('en-IN')} only`;
//       };

//       // Format date
//       const formatDateForInvoice = (dateValue: any) => {
//         if (!dateValue) return new Date().toLocaleDateString('en-GB');
//         const date = new Date(dateValue);
//         const day = date.getDate().toString().padStart(2, '0');
//         const month = (date.getMonth() + 1).toString().padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//       };

//       // Generate receipt number (use installment number or generate)
//       const receiptNo = installment.installmentNumber ? parseInt(`${installment.installmentNumber}${Date.now().toString().slice(-3)}`) : Math.floor(Math.random() * 100000) + 10000;

//       // Build invoice payload
//       const invoicePayload: {
//         action: "studentFeeSlip";
//         studentFeeSlip: {
//           studentFeeSlipCustomerId: string;
//           studentFeeSlipOrganiationId: string;
//           studentFeeSlipOrganizationName: string;
//           studentFeeSlipOrganizationLogo: string;
//           studentFeeSlipEnrollmentNo: string;
//           studentFeeSlipRollNo: string;
//           studentFeeSlipStudentEmail: string;
//           studentFeeSlipOrganizationEmail: string;
//           studentFeeSlipOrganizationAddress: string;
//           studentFeeSlipOrganizationPhoneNumber: string;
//           studentFeeSlipReceiptNo: number;
//           studentFeeSlipStudentName: string;
//           studentFeeSlipCourseName: string;
//           studentFeeSlipCourseId: string;
//           studentFeeSlipInstallmentId: string;
//           studentFeeSlipPaymentMode: string;
//           studentFeeSlipTransactionId: string;
//           studentFeeSlipPaymentRecieverId: string;
//           studentFeeSlipAmountInWords: string;
//           studentFeeSlipPurpose: string;
//           studentFeeSlipDate: string;
//           studentFeeSlipGSTIN: string;
//           studentFeeSlipStudentPhoneNumber: string;
//           studentFeeSlipWebsiteUrl: string;
//           studentFeeSlipStudentAddress: string;
//           studentFeeSlipSGSTPercentage: number;
//           studentFeeSlipCGSTPercentage: number;
//           studentFeeSlipSGSTAmount: number;
//           studentFeeSlipCGSTAmount: number;
//           studentFeeSlipGrandTotal: number;
//           studentFeeSlipCourseFee: number;
//           previousFeeSlipReceivedAmount: number;
//           totalRemainingDueAmount: number;
//           studentFeeSlipDiscountAmount: number;
//           studentFeeSlipAmountAfterDiscount: number;
//           studentFeeSlipPaidAmount: number;
//           receivedPaymentCGSTAmount: number;
//           receivedPaymentSGSTAmount: number;
//           studentFeeSlipTutionFee: number;
//           studentFeeSlipDueAmount: number;
//           previousDiscountAmount: number;
//           inclusionType: string;
//         };
//       } = {
//         action: "studentFeeSlip",
//         studentFeeSlip: {
//           studentFeeSlipCustomerId: studentDetails.customerId || authUser?.customerId || '',
//           studentFeeSlipOrganiationId: selectedOrganization?.organizationId || '',
//           studentFeeSlipOrganizationName: organization?.organizationName || selectedOrganization?.organizationName || '',
//           studentFeeSlipOrganizationLogo: organization?.organizationLogo || '',
//           studentFeeSlipEnrollmentNo: studentDetails.studentEnrollmentNumber || '',
//           studentFeeSlipRollNo: studentRollNo || '',
//           studentFeeSlipStudentEmail: studentDetails.studentEmail || '',
//           studentFeeSlipOrganizationEmail: organization?.organizationEmail || '',
//           studentFeeSlipOrganizationAddress: organization?.organizationAddress || '',
//           studentFeeSlipOrganizationPhoneNumber: organization?.organizationPhoneNumber || '',
//           studentFeeSlipReceiptNo: receiptNo,
//           studentFeeSlipStudentName: `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim(),
//           studentFeeSlipCourseName: courseData?.data?.courseName || courseData?.courseName || course.courseName || '',
//           studentFeeSlipCourseId: course.courseId || '',
//           studentFeeSlipInstallmentId: installmentId,
//           studentFeeSlipPaymentMode: installment.paymentMode || 'Cash',
//           studentFeeSlipTransactionId: installment.transactionId || '-',
//           studentFeeSlipPaymentRecieverId: installment.paymentRecieverId || '',
//           studentFeeSlipAmountInWords: amountToWords(paidAmount),
//           studentFeeSlipPurpose: "mail",
//           studentFeeSlipDate: formatDateForInvoice(installment.paymentReceiveDate || installment.paidDate || new Date()),
//           studentFeeSlipGSTIN: gstinNumber,
//           studentFeeSlipStudentPhoneNumber: studentDetails.studentContact || '',
//           studentFeeSlipWebsiteUrl: organization?.organizationWebsiteUrl || '',
//           studentFeeSlipStudentAddress: studentDetails.studentAddress || '',
//           studentFeeSlipSGSTPercentage: sgstPercentage,
//           studentFeeSlipCGSTPercentage: cgstPercentage,
//           studentFeeSlipSGSTAmount: sgstAmount,
//           studentFeeSlipCGSTAmount: cgstAmount,
//           studentFeeSlipGrandTotal: paidAmount,
//           studentFeeSlipCourseFee: courseFee,
//           previousFeeSlipReceivedAmount: previousReceivedAmount,
//           totalRemainingDueAmount: remainingDueAmount,
//           studentFeeSlipDiscountAmount: discountAmount,
//           studentFeeSlipAmountAfterDiscount: amountAfterDiscount,
//           studentFeeSlipPaidAmount: paidAmount,
//           receivedPaymentCGSTAmount: cgstAmount,
//           receivedPaymentSGSTAmount: sgstAmount,
//           studentFeeSlipTutionFee: tuitionFee,
//           studentFeeSlipDueAmount: remainingDueAmount,
//           previousDiscountAmount: 0,
//           inclusionType: gstInclusionType === 'included' ? 'Incl' : (gstInclusionType === 'excluded' ? 'Excl' : 'NoGST')
//         }
//       };

//       console.log('📧 Invoice Payload:', JSON.stringify(invoicePayload, null, 2));

//       // Call the API
//       const response = await sendInvoiceEmail(invoicePayload);

//       if (response && response.statusCode === 200) {
//         ToastAndroid.show("Invoice sent successfully via email", ToastAndroid.SHORT);
//         console.log('✅ Invoice email sent successfully:', response);
//       } else {
//         throw new Error(response?.message || 'Failed to send invoice email');
//       }
//     } catch (error: any) {
//       console.error('❌ Invoice email error:', error);
//       Alert.alert('Error', error.message || 'Failed to send invoice email. Please try again.');
//     }
//   };

//   const handleReminderMenu = (installmentId: string) => {
//     setShowReminderMenu(showReminderMenu === installmentId ? null : installmentId);
//   };

//   const handleEmailReminder = async (
//     installment: any,
//     studentDetails: any,
//     courseName: string,
//     formattedDueDate: string,
//     installmentAmount: number
//   ) => {
//     try {
//       // Validate required data
//       if (!authUser || !selectedOrganization || !organization) {
//         Alert.alert("Error", "Required data is missing");
//         return;
//       }

//       // Get student email
//       const studentEmail = studentDetails.studentEmail || '';
//       if (!studentEmail) {
//         Alert.alert("Error", "Student email not found");
//         return;
//       }

//       // Get student name
//       const studentName = `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim();
//       if (!studentName) {
//         Alert.alert("Error", "Student name is missing");
//         return;
//       }

//       // Get organization details
//       const organizationName = organization.organizationName || '';
//       const organizationEmail = organization.organizationEmail || '';
//       const organizationLogo = organization.organizationLogo || '';
//       const organizationPhoneNumber = organization.organizationPhoneNumber || '';

//       // Get student ID
//       const studentId = studentDetails.studentId || studentDetails.studentEnrollmentNumber || '';

//       // Build email reminder payload
//       const emailPayload = {
//         studentName: studentName,
//         courseName: courseName,
//         studentEmail: studentEmail,
//         installmentsArray: [
//           {
//             overDueDate: formattedDueDate !== 'N/A' ? formattedDueDate : '',
//             overDueAmount: installmentAmount,
//             index: installment.installmentId || '',
//             courseId: course.courseId || '',
//           },
//         ],
//         organizationName: organizationName,
//         organizationEmail: organizationEmail,
//         organizationLogo: organizationLogo,
//         organizationPhoneNumber: organizationPhoneNumber,
//         customerId: authUser.customerId || studentDetails.customerId || '',
//         studentId: studentId,
//         accountId: '', // Empty as per payload example
//         organizationId: selectedOrganization.organizationId || '',
//       };

//       console.log('📧 Sending email reminder payload:', JSON.stringify(emailPayload, null, 2));
//       console.log('📧 API URL:', apiUrls.emailServiceUrl.NOTIFY_UPCOMING_FEE_NOTIFICATION);

//       // Call email API
//       const response = await sendEmailReminder(emailPayload);

//       console.log('✅ Email reminder API response:', JSON.stringify(response, null, 2));

//       // Check response
//       if (response?.data) {
//         const accepted = response.data.accepted || [];
//         const rejected = response.data.rejected || [];

//         if (accepted.length > 0) {
//           Alert.alert(
//             "Success",
//             `Email reminder sent successfully to ${accepted.join(', ')}`,
//             [{ text: "OK" }]
//           );
//         } else if (rejected.length > 0) {
//           Alert.alert(
//             "Error",
//             `Failed to send email to ${rejected.join(', ')}`
//           );
//         } else {
//           Alert.alert(
//             "Success",
//             "Email reminder sent successfully",
//             [{ text: "OK" }]
//           );
//         }
//       } else if (response?.statusCode === 200) {
//         Alert.alert(
//           "Success",
//           "Email reminder sent successfully",
//           [{ text: "OK" }]
//         );
//       } else {
//         throw new Error(response?.message || 'Failed to send email reminder');
//       }
//     } catch (error: any) {
//       console.error('❌ Email reminder error:', error);
//       const errorMessage = error?.response?.data?.message 
//         || error?.data?.message
//         || error?.message 
//         || 'Failed to send email reminder. Please try again.';
      
//       Alert.alert('Error', errorMessage);
//     }
//   };

//   const handleReminderAction = async (action: string, installmentId: string) => {
//     try {
//       setShowReminderMenu(null);
      
//       // Show loading indicator
//       if (isSendingReminder) {
//         return; // Prevent multiple simultaneous calls
//       }
      
//       // Find the installment details
//       const installment = installmentDetails.find((inst: any) => inst.installmentId === installmentId);
//       if (!installment) {
//         Alert.alert("Error", "Installment not found");
//         return;
//       }

//       // Get student data
//       const studentDetails = studentData?.data;
//       if (!studentDetails) {
//         Alert.alert("Error", "Student details not found");
//         return;
//       }

//       // Get course data
//       if (!courseData) {
//         Alert.alert("Error", "Course details not found");
//         return;
//       }

//       // Log course data structure for debugging
//       console.log('📚 Course data structure:', {
//         courseDataExists: !!courseData,
//         courseDataKeys: courseData ? Object.keys(courseData) : [],
//         courseDataData: courseData?.data ? Object.keys(courseData.data) : [],
//         courseDataStatusCode: courseData?.statusCode,
//         courseDataDataCourseName: courseData?.data?.courseName,
//         courseDataCourseName: courseData?.courseName,
//         courseCourseName: course?.courseName,
//       });

//       // Validate required data
//       if (!authUser || !selectedOrganization) {
//         Alert.alert("Error", "Required data is missing");
//         return;
//       }

//       // Get student phone number (required for WhatsApp/SMS, not for Email)
//       const studentPhone = studentDetails.studentContact || studentDetails.studentMobileNumber || '';
      
//       // Get student email (required for Email reminder)
//       const studentEmail = studentDetails.studentEmail || '';
      
//       // Validate based on action type
//       if (action.toLowerCase() !== 'email' && !studentPhone) {
//         Alert.alert("Error", "Student phone number not found");
//         return;
//       }
      
//       if (action.toLowerCase() === 'email' && !studentEmail) {
//         Alert.alert("Error", "Student email not found");
//         return;
//       }

//       // Format due date - ensure DD-MM-YYYY format
//       const dueDate = installment.nextpaymentDate || installment.formatedNextpaymentDate || '';
//       let formattedDueDate = 'N/A';
      
//       if (dueDate) {
//         // formatDate returns DD/MM/YYYY, convert to DD-MM-YYYY for API
//         const formatted = formatDate(dueDate);
//         formattedDueDate = formatted.replace(/\//g, '-');
//       }
      
//       console.log('📅 Date formatting:', { dueDate, formattedDueDate });

//       // Get installment amount
//       const installmentAmount = installment.duePayment || installment.receivedPayment || 0;

//       // Get course name - ensure it's not empty
//       // courseData structure: { statusCode: 200, data: { courseName: ... } }
//       const courseName = (
//         courseData?.data?.courseName 
//         || courseData?.courseName 
//         || course?.courseName 
//         || ''
//       ).trim();
      
//       console.log('📚 Course name check:', {
//         courseDataExists: !!courseData,
//         courseDataStructure: courseData ? Object.keys(courseData) : [],
//         courseDataData: courseData?.data ? Object.keys(courseData.data) : [],
//         courseDataDataCourseName: courseData?.data?.courseName,
//         courseDataCourseName: courseData?.courseName,
//         courseCourseName: course?.courseName,
//         finalCourseName: courseName,
//       });
      
//       if (!courseName) {
//         Alert.alert("Error", "Course name is missing. Please check course details.");
//         return;
//       }

//       // Get student name - ensure it's not empty
//       const studentName = `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim();
//       if (!studentName) {
//         Alert.alert("Error", "Student name is missing. Please check student details.");
//         return;
//       }

//       // Get installment number - ensure it's valid
//       const installmentNumber = installment.installmentNumber || 1;
      
//       // Validate all required fields before building payload
//       console.log('📋 Validating payload data:', {
//         studentName,
//         courseName,
//         installmentNumber,
//         installmentAmount,
//         formattedDueDate,
//         studentPhone,
//       });

//       // Determine action type
//       let actionOn: string[] = [];
//       let smsTemplateId: string | undefined;
//       let smsNumber: string | undefined;

//       if (action.toLowerCase() === 'whatsapp') {
//         actionOn = ['whatsapp', ''];
//       } else if (action.toLowerCase() === 'sms') {
//         // SMS format: ["", "sms"] - empty string first, then "sms"
//         actionOn = ['', 'sms'];
//         smsTemplateId = '1707173891716321405'; // SMS template ID from payload
//         smsNumber = studentPhone;
//       } else if (action.toLowerCase() === 'email') {
//         // Email reminder uses different API - handle separately
//         await handleEmailReminder(installment, studentDetails, courseName, formattedDueDate, installmentAmount);
//         return;
//       } else {
//         Alert.alert("Error", "Invalid action type");
//         return;
//       }

//       console.log('📋 Action details:', { action, actionOn, smsTemplateId, smsNumber });

//       // Validate walletId
//       const walletId = organization?.walletId || '';
//       if (!walletId) {
//         console.warn('⚠️ WalletId not found, using empty string');
//       }

//       // Build payload
//       const payload = {
//         customerId: authUser.customerId || studentDetails.customerId || '',
//         organizationId: selectedOrganization.organizationId || '',
//         user: {
//           userCustomerId: authUser.customerId || '',
//           userCustomerName: authUser.customerName || '',
//           userCustomerEmail: authUser.customerEmail || '',
//           roleName: selectedOrganization?.role?.roleName || authUser.userType || 'admin',
//           roleId: selectedOrganization?.role?.roleId || authUser.employeeId || '',
//           userEmployeeId: authUser.employeeId || '',
//         },
//         action: {
//           actionOn: actionOn,
//           singleNumber: studentPhone,
//           templateName: 'student_installment_upcoming_fee',
//           templateId: '2354782141619006',
//           bodyParams: [
//             { type: 'text', text: studentName || 'Student' },
//             { type: 'text', text: courseName || 'Course' },
//             { type: 'text', text: installmentNumber.toString() },
//             { type: 'text', text: installmentAmount.toString() || '0' },
//             { type: 'text', text: courseName || 'Course' },
//             { type: 'text', text: formattedDueDate !== 'N/A' ? formattedDueDate : 'N/A' },
//           ],
//           textBodyParams: [
//             { value: courseName },
//             { value: formattedDueDate },
//           ],
//           ...(smsTemplateId && { smsTemplateId }),
//           ...(smsNumber && { smsNumber }),
//         },
//         walletId: walletId,
//       };

//       // Validate payload before sending
//       if (!payload.customerId || !payload.organizationId || !payload.walletId) {
//         console.error('❌ Invalid payload:', payload);
//         Alert.alert("Error", "Missing required fields. Please check customer ID, organization ID, and wallet ID.");
//         return;
//       }

//       // Validate all bodyParams have non-empty text values
//       const invalidParams = payload.action.bodyParams.filter((param: any) => {
//         const textValue = param.text?.toString().trim();
//         return !textValue || textValue === '' || textValue === 'undefined' || textValue === 'null';
//       });

//       if (invalidParams.length > 0) {
//         console.error('❌ Invalid bodyParams:', invalidParams);
//         console.error('❌ Full bodyParams:', payload.action.bodyParams);
//         Alert.alert(
//           "Error", 
//           `Some required parameters are missing or empty. Please check:\n- Student Name\n- Course Name\n- Installment Number\n- Installment Amount\n- Due Date`
//         );
//         return;
//       }

//       // Validate textBodyParams
//       const invalidTextParams = payload.action.textBodyParams.filter((param: any) => {
//         const value = param.value?.toString().trim();
//         return !value || value === '' || value === 'undefined' || value === 'null';
//       });

//       if (invalidTextParams.length > 0) {
//         console.error('❌ Invalid textBodyParams:', invalidTextParams);
//         Alert.alert("Error", "Course name or due date is missing. Please check the data.");
//         return;
//       }

//       console.log('📤 Sending reminder payload:', JSON.stringify(payload, null, 2));
//       console.log('📤 API URL:', apiUrls.emailServiceUrl.SEND_REMINDER);
//       console.log('📤 Request details:', {
//         customerId: payload.customerId,
//         organizationId: payload.organizationId,
//         walletId: payload.walletId,
//         action: payload.action.actionOn,
//         phone: payload.action.singleNumber,
//       });

//       // Call API
//       let response;
//       try {
//         response = await sendReminder(payload);
//         console.log('✅ Reminder API response:', JSON.stringify(response, null, 2));
//         console.log('✅ Response type:', typeof response);
//         console.log('✅ Response keys:', response ? Object.keys(response) : 'null');
        
//         // Check if response indicates an error (from axios service, errors return error.response)
//         if (response?.status && response.status >= 400) {
//           console.error('❌ API returned error status:', response.status);
//           throw response; // Throw as error to be caught
//         }
        
//         // Check if response has statusCode indicating error
//         if (response?.statusCode && response.statusCode !== 200) {
//           console.error('❌ API returned error statusCode:', response.statusCode);
//           throw response; // Throw as error to be caught
//         }
//       } catch (apiError: any) {
//         console.error('❌ API call error:', apiError);
//         console.error('❌ API error response:', apiError?.response);
//         console.error('❌ API error data:', apiError?.response?.data || apiError?.data);
//         console.error('❌ API error status:', apiError?.status || apiError?.response?.status);
//         throw apiError; // Re-throw to be caught by outer catch
//       }

//       // Handle different response structures
//       let status = false;
//       let message = '';
//       let errorDetails = null;

//       console.log('📥 Processing response for action:', action);
//       console.log('📥 Full response structure:', JSON.stringify(response, null, 2));

//       if (response?.data) {
//         // Response structure: { data: { whatsapp: { status, message, error } } } or { data: { sms: { status, message } } }
//         const whatsappData = response.data.whatsapp;
//         const smsData = response.data.sms;
        
//         console.log('📥 WhatsApp data:', whatsappData);
//         console.log('📥 SMS data:', smsData);
        
//         if (action.toLowerCase() === 'whatsapp' && whatsappData) {
//           status = whatsappData.status === true;
          
//           if (status) {
//             message = whatsappData.message || 'WhatsApp reminder sent successfully';
//           } else {
//             // Extract error details
//             errorDetails = whatsappData.error?.error || whatsappData.error;
//             message = errorDetails?.message 
//               || errorDetails?.error_data?.details 
//               || whatsappData.message 
//               || 'Failed to send WhatsApp reminder';
//           }
//         } else if (action.toLowerCase() === 'sms' && smsData) {
//           console.log('📥 SMS data details:', {
//             status: smsData.status,
//             statusCode: smsData.statusCode,
//             message: smsData.message,
//             error: smsData.error,
//             errorType: typeof smsData.error,
//           });
          
//           // Check status - can be true or statusCode === 200
//           status = smsData.status === true || smsData.statusCode === 200;
          
//           if (status) {
//             message = smsData.message || 'SMS reminder sent successfully';
//             console.log('✅ SMS success:', message);
//           } else {
//             // Extract error details - error can be a string or an object
//             if (typeof smsData.error === 'string') {
//               // Error is a direct string (e.g., "Insufficient funds in wallet for sms.")
//               message = smsData.error;
//               errorDetails = smsData.error;
//             } else if (smsData.error && typeof smsData.error === 'object') {
//               // Error is an object with nested structure
//               errorDetails = smsData.error?.error || smsData.error;
//               message = errorDetails?.message 
//                 || errorDetails?.error_data?.details 
//                 || smsData.error?.message
//                 || smsData.message 
//                 || 'Failed to send SMS reminder';
//             } else {
//               // Fallback to message or default
//               message = smsData.message || 'Failed to send SMS reminder';
//             }
            
//             console.error('❌ SMS error details:', errorDetails);
//             console.error('❌ SMS error message:', message);
//           }
//         } else {
//           // Neither whatsapp nor sms data found
//           console.error('❌ No matching action data found:', {
//             action,
//             hasWhatsappData: !!whatsappData,
//             hasSmsData: !!smsData,
//             responseKeys: Object.keys(response.data || {}),
//           });
//           message = `No ${action} data found in response`;
//         }
//       } else if (response?.statusCode === 200) {
//         // Response structure: { statusCode: 200, data: { whatsapp: {...} } }
//         status = true;
//         message = `${action} reminder sent successfully`;
//       } else if (response?.whatsapp || response?.sms) {
//         // Direct response structure: { whatsapp: { status, message } }
//         const whatsappData = response.whatsapp;
//         const smsData = response.sms;
        
//         if (action.toLowerCase() === 'whatsapp' && whatsappData) {
//           status = whatsappData.status === true;
//           message = whatsappData.message || 'WhatsApp reminder sent successfully';
//         } else if (action.toLowerCase() === 'sms' && smsData) {
//           status = smsData.status === true || smsData.statusCode === 200;
//           message = smsData.message || 'SMS reminder sent successfully';
//         }
//       } else {
//         // Unknown response structure
//         console.error('❌ Unknown response structure:', response);
//         message = `Unknown response structure for ${action}`;
//       }

//       console.log('📊 Final status check:', { status, message, action });

//       if (status) {
//         Alert.alert(
//           "Success", 
//           message,
//           [{ text: "OK" }]
//         );
//       } else {
//         // Throw error with detailed message
//         console.error('❌ API returned failure status:', {
//           action,
//           message,
//           errorDetails,
//           fullResponse: response,
//         });
//         throw new Error(message || `Failed to send ${action} reminder`);
//       }
//     } catch (error: any) {
//       console.error('❌ Reminder error details:', {
//         error,
//         errorType: typeof error,
//         errorKeys: error ? Object.keys(error) : [],
//         errorMessage: error?.message,
//         errorResponse: error?.response,
//         errorData: error?.data,
//         errorStatus: error?.status,
//         errorStatusText: error?.statusText,
//         fullError: JSON.stringify(error, null, 2),
//       });

//       // Extract error message from different possible locations
//       // Note: axios service returns error.response, so error might be the response object itself
//       let errorMessage = '';
      
//       // Check if error is the response object (from axios service onError)
//       if (error?.data) {
//         errorMessage = error.data.message 
//           || error.data.error 
//           || error.data.errorMessage
//           || error.data.whatsapp?.message
//           || error.data.sms?.message
//           || error.data.data?.whatsapp?.message
//           || error.data.data?.sms?.message;
//       }
      
//       // Check if error has response property (standard axios error)
//       if (!errorMessage && error?.response?.data) {
//         errorMessage = error.response.data.message 
//           || error.response.data.error 
//           || error.response.data.errorMessage
//           || error.response.data.whatsapp?.message
//           || error.response.data.sms?.message;
//       }
      
//       // Fallback to error message or status text
//       if (!errorMessage) {
//         errorMessage = error?.message 
//           || error?.statusText
//           || error?.response?.statusText
//           || `Failed to send ${action} reminder. Please try again.`;
//       }

//       // If still no message, show status code
//       if (!errorMessage && (error?.status || error?.response?.status)) {
//         const statusCode = error?.status || error?.response?.status;
//         errorMessage = `Error ${statusCode}: ${errorMessage || 'Something went wrong'}`;
//       }
      
//       console.error('📢 Final error message:', errorMessage);
//       console.error('📢 Error status:', error?.status || error?.response?.status);
      
//       Alert.alert(
//         'Error', 
//         errorMessage
//       );
//     }
//   };

//   const handleSubmitPayment = async () => {
//     if (!authUser || !selectedOrganization) {
//       Alert.alert("Error", "Required data is missing");
//       return;
//     }

//     // Validate required fields
//     if (!isPayingFirstInstallment) {
//       Alert.alert("Error", "Please select if you are paying first installment");
//       return;
//     }

//     // Validate payment mode fields if paying first installment
//     if (isPayingFirstInstallment === 'paid') {
//       const firstInstallment = dynamicInstallments[0];
//       if (!firstInstallment?.paymentMode) {
//         Alert.alert("Error", "Please select payment mode for first installment");
//         return;
//       }
      
//       if (firstInstallment.paymentMode === 'cash' && !firstInstallment.paymentRecieverId) {
//         Alert.alert("Error", "Please select payment received by for cash payment");
//         return;
//       }
      
//       if (firstInstallment.paymentMode === 'online' && !firstInstallment.transactionId) {
//         Alert.alert("Error", "Please enter transaction ID for online payment");
//         return;
//       }
//     }

//     setIsSubmitting(true);
    
//     try {
//       // Prepare installment details
//       const installmentDetails = dynamicInstallments.map((inst, index) => {
//         const installmentData: any = {
//           installmentNumber: inst.installmentNumber || index + 1,
//           paymentStatus: isPayingFirstInstallment === 'paid' && index === 0 ? 'paid' : 'due',
//           installmentId: inst.installmentId,
//           paymentNotes: inst.paymentNotes || '',
//           paymentMode: inst.paymentMode || '',
//           transactionId: inst.transactionId || '',
//           paymentRecieverId: inst.paymentRecieverId || ''
//         };

//         // Add payment date and amount based on status
//         if (installmentData.paymentStatus === 'paid') {
//           installmentData.paymentReceiveDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
//           installmentData.receivedPayment = inst.duePayment || 0;
//         } else {
//           installmentData.nextpaymentDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
//           installmentData.duePayment = inst.duePayment || 0;
//         }

//         return installmentData;
//       });

//       // Determine course payment status
//       const coursePaymentStatus = dynamicInstallments.every(inst => 
//         isPayingFirstInstallment === 'paid' && dynamicInstallments.indexOf(inst) === 0 ? true : false
//       ) ? 'paid' : 'due';

//       const payload = {
//         user: {
//           userCustomerId: authUser.customerId,
//           userCustomerName: authUser.customerName,
//           userCustomerEmail: authUser.customerEmail,
//           roleName: selectedOrganization.role?.roleName || authUser.userType,
//           roleId: selectedOrganization.role?.roleId || authUser.employeeId,
//           userEmployeeId: authUser.employeeId
//         },
//         customerId: selectedOrganization.customerId,
//         organizationId: selectedOrganization.organizationId,
//         rollNo: studentRollNo,
//         courseId: course.courseId,
//         paymentDetails: {
//           isPartPayment: dynamicInstallments.length > 1,
//           coursePaymentStatus: coursePaymentStatus,
//           installmentDetails: installmentDetails
//         },
//         ...(selectedCoupon && {
//           coupon: {
//             couponId: selectedCoupon.couponId,
//             discount: discountAmount
//           }
//         })
//       };

//       console.log("Submitting payment details with payload:", JSON.stringify(payload, null, 2));

//       const response = await request({
//         method: "POST",
//         url: "/student-fnp-prod/updateStudentPaymentDetails",
//         data: payload
//       });

//       console.log("Payment details update response:", response);

//       if (response.statusCode === 200) {
//         // Invalidate queries to refresh all related data
//         console.log("🔄 Invalidating queries to refresh payment data");
        
//         // Invalidate student details query
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
//         });
        
//         // Invalidate course details query (in case it includes payment info)
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
//         });
        
//         // Also invalidate student list queries that might show payment status
//         queryClient.invalidateQueries({
//           queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
//         });
        
//         // Refetch student data to ensure immediate update
//         await refetchStudentData();
        
//         Alert.alert("Success", "Payment details updated successfully!", [
//           {
//             text: "OK",
//             onPress: () => {
//               // Navigate back after data refresh
//               navigation.goBack();
//             }
//           }
//         ]);
//       } else {
//         Alert.alert("Error", response.message || "Failed to update payment details");
//       }
//     } catch (error) {
//       console.error("Error updating payment details:", error);
//       Alert.alert("Error", "Failed to update payment details. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Helper function to check if due date has passed
//   const isDueDatePassed = (dueDateString: string): boolean => {
//     if (!dueDateString) return false;
    
//     try {
//       let dueDate: Date;
      
//       // Handle DD/MM/YYYY format
//       if (dueDateString.includes('/')) {
//         const [day, month, year] = dueDateString.split('/');
//         dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//       }
//       // Handle DD-MM-YYYY format
//       else if (dueDateString.includes('-')) {
//         const [day, month, year] = dueDateString.split('-');
//         dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//       }
//       // Handle standard date format
//       else {
//         dueDate = new Date(dueDateString);
//       }
      
//       if (isNaN(dueDate.getTime())) return false;
      
//       // Get today's date without time
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       // Get due date without time
//       const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
//       // Check if due date is before today
//       return dueDateOnly < today;
//     } catch (error) {
//       console.log('Error checking due date:', error);
//       return false;
//     }
//   };

//   // Helper function to get display status (due -> overdue if date passed)
//   const getDisplayStatus = (installment: any): string => {
//     const status = installment.paymentStatus?.toLowerCase() || '';
    
//     // If status is "due", check if due date has passed
//     if (status === 'due') {
//       const dueDate = installment.nextpaymentDate || installment.formatedNextpaymentDate;
//       if (dueDate && isDueDatePassed(dueDate)) {
//         return 'overdue';
//       }
//     }
    
//     return status;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "paid":
//         return { backgroundColor: "#ECFFE0", color: "#4AC400" };
//       case "due":
//         return { backgroundColor: "#FFE6E6", color: "#FF4444" };
//       case "overdue":
//         return { backgroundColor: "#FFE6E6", color: "#FF4444" };
//       case "pending":
//         return { backgroundColor: "#FFF3E0", color: "#FF9800" };
//       default:
//         return { backgroundColor: "#F5F5F5", color: "#666666" };
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return `₹ ${amount?.toLocaleString() || "0"}`;
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "No date";
    
//     console.log('Formatting date:', dateString);
    
//     try {
//       // Handle DD/MM/YYYY format
//       if (dateString.includes('/')) {
//         const [day, month, year] = dateString.split('/');
//         console.log('Parsed DD/MM/YYYY format:', { day, month, year });
//         return `${day}/${month}/${year}`;
//       }
      
//       // Handle DD-MM-YYYY format
//       if (dateString.includes('-')) {
//         const [day, month, year] = dateString.split('-');
//         console.log('Parsed DD-MM-YYYY format:', { day, month, year });
//         return `${day}/${month}/${year}`;
//       }
      
//       // Handle standard date format
//       const date = new Date(dateString);
//       if (!isNaN(date.getTime())) {
//         console.log('Parsed as standard date:', date);
//         return date.toLocaleDateString("en-GB");
//       }
      
//       console.log('Invalid date:', dateString);
//       return "Invalid date";
//     } catch (error) {
//       console.log('Date formatting error:', error);
//       return "Error";
//     }
//   };

//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Payment History"
//         handleBackClick={() => navigation.goBack()}
//       />
      
//       <ThemeScrollView 
//         paddingHorizontal={10}
//         loading={courseLoading || studentLoading}
//       >
//         <Flex mt={20} flexDirection="column">
//           {/* Tab Container */}
//           <Flex styles={styles.tabContainer}>
//             <TouchableOpacity
//               style={[styles.tab, activeTab === "installment" ? styles.activeTab : styles.inactiveTab]}
//               onPress={() => setActiveTab("installment")}
//             >
//               <ScalableText style={activeTab === "installment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
//                 INSTALLMENT VIEW
//               </ScalableText>
//             </TouchableOpacity>
//             {paymentDetails?.coursePaymentStatus === "due" && (
//               <TouchableOpacity
//                 style={[styles.tab, activeTab === "payment" ? styles.activeTab : styles.inactiveTab]}
//                 onPress={() => setActiveTab("payment")}
//               >
//                 <ScalableText style={activeTab === "payment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
//                   INSTALLMENT UPDATE
//                 </ScalableText>
//               </TouchableOpacity>
//             )}
//           </Flex>

//           {/* Section Title */}
//           <Flex mt={20} align="flex-start">
//             <ScalableText style={styles.sectionTitle} fontFamily="Bold">
//               {activeTab === "installment" ? "Installment Details" : "Update Installments"}
//             </ScalableText>
//           </Flex>

         

//           {/* Conditional Content Based on Active Tab */}
//           {activeTab === "installment" ? (
//             // Installment Details Table - scrollable + wider layout
//             <Flex mt={15}>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//               >
//                 <View style={styles.installmentTableWrapper}>
//                   <Grid>
//                     <Row style={styles.headerRow}>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "4%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           NO.
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           DATE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           AMOUNT
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           MODE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "15%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           STATUS
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           INVOICE
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           REMINDER
//                         </ScalableText>
//                       </Col>
//                       <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           EDIT
//                         </ScalableText>
//                       </Col>
//                       <Col style={{ alignItems: 'center', justifyContent: 'center',width: "10%" }}>
//                         <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//                           DOWNLOAD
//                         </ScalableText>
//                       </Col>
//                     </Row>
                    
//                     {/* Dynamic Table Data */}
//                     {installmentDetails.length > 0 ? (
//                       installmentDetails.map((installment: any, index: number) => {
//                     console.log("Rendering installment:", installment);
//                     console.log("Installment payment status:", installment.paymentStatus);
//                     console.log("Available date fields:", {
//                       nextpaymentDate: installment.nextpaymentDate,
//                       formatedNextpaymentDate: installment.formatedNextpaymentDate,
//                       paymentReceiveDate: installment.paymentReceiveDate,
//                       paymentDate: installment.paymentDate,
//                       receivedDate: installment.receivedDate,
//                       paidDate: installment.paidDate
//                     });
                    
//                     // Get display status (due -> overdue if date passed)
//                     const displayStatus = getDisplayStatus(installment);
//                     const statusStyle = getStatusColor(displayStatus);
//                     return (
//                       <Row key={installment.installmentId} style={styles.dataRow}>
//                         <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {installment.installmentNumber}
//                           </ScalableText>
//                         </Col>
//                         <Col size={10} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {(() => {
//                               // For paid installments, show payment received date
//                               if (installment.paymentStatus?.toLowerCase() === 'paid') {
//                                 return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate);
//                               }
//                               // For due installments, show next payment date
//                               else if (installment.paymentStatus?.toLowerCase() === 'due') {
//                                 return formatDate(installment.nextpaymentDate || installment.formatedNextpaymentDate);
//                               }
//                               // Fallback for other statuses
//                               else {
//                                 return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate || installment.nextpaymentDate || installment.formatedNextpaymentDate);
//                               }
//                             })()}
//                           </ScalableText>
//                         </Col>
//                         <Col size={15} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {formatCurrency(installment.receivedPayment || installment.duePayment)}
//                           </ScalableText>
//                         </Col>
//                         <Col size={16} style={{ alignItems: 'center', justifyContent: 'center' }}>
//                           <ScalableText style={styles.dataText} fontFamily="Regular">
//                             {(installment.paymentMode || '').toString().toUpperCase() || '-'}
//                           </ScalableText>
//                         </Col>
//                         <Col size={18} style={{ alignItems: 'center', justifyContent: 'center',   }}>
//                           <Flex
//                             styles={{
//                               ...styles.statusChip,
//                               backgroundColor: statusStyle.backgroundColor,
//                             }}
//                           >
//                             <ScalableText
//                               style={{
//                                 ...styles.statusChipText,
//                                 color: statusStyle.color,
//                               }}
//                               fontFamily="Medium"
//                             >
//                               {displayStatus.toUpperCase()}
//                             </ScalableText>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
//                         <Flex flexDirection="row" justify="flex-start" align="center">
//                             <TouchableOpacity 
//                               onPress={() => handleViewInvoice(installment.installmentId)}
//                               disabled={isSendingInvoice}
//                               style={{ opacity: isSendingInvoice ? 0.5 : 1 }}
//                             >
//                               <AutoHeightImage source={IMAGES.fileSearchIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
//                         <Flex flexDirection="row" justify="flex-start" align="center">
//                             <TouchableOpacity 
//                               onPress={() => handleReminderMenu(installment.installmentId)}
//                               style={styles.reminderButton}
//                             >
//                               <AutoHeightImage source={IMAGES.mailIconGray} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
//                         <Flex flexDirection="row" justify="flex-start" align="center">
//                             <TouchableOpacity onPress={() => handleEditInstallment(installment)}>
//                               <AutoHeightImage source={IMAGES.editIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                         <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
//                         <Flex flexDirection="row" justify="flex-start" align="center">
//                             <TouchableOpacity onPress={() => handleDownloadInvoice(installment.installmentId)}>
//                               <AutoHeightImage source={IMAGES.downloadIcon} width={16} />
//                             </TouchableOpacity>
//                           </Flex>
//                         </Col>
//                       </Row>
//                     );
//                   })
//                 ) : (
//                   <Row style={styles.dataRow}>
//                     <Col size={100}>
//                       <ScalableText style={styles.noDataText} fontFamily="Medium">
//                         No installment details available
//                       </ScalableText>
//                     </Col>
//                   </Row>
//                 )}
//                   </Grid>
//                 </View>
//               </ScrollView>
//             </Flex>
//           ) : (
//             // Update Installments Form - Matching PaymentDetailsScreen UI
//             <Flex mt={15}>
//               <View style={styles.updateFormContainer}>
//                 {/* Summary Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.formLabel} fontFamily="Medium">
//                     Payment Summary
//                   </ScalableText>
                  
//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Payment Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalPayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>

//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Received Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalReceivedPayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>

//                   <View style={styles.inputSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Total Due Amount
//                     </ScalableText>
//                     <View style={styles.inputContainer}>
//                       <ScalableText style={styles.inputValue} fontFamily="Regular">
//                         {formatCurrency(paymentDetails?.totalDuePayment || 0)}
//                       </ScalableText>
//                     </View>
//                   </View>
//                 </View>

//                 {/* Paid Installments Section */}
//                 {installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid').length > 0 && (
//                   <View style={styles.formField}>
//                     <ScalableText style={styles.formLabel} fontFamily="Medium">
//                       Paid Installments
//                     </ScalableText>
//                     {installmentDetails
//                       .filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid')
//                       .map((paidInst: any, index: number) => (
//                         <View key={`paid-${paidInst.installmentId}`} style={styles.installmentContainer}>
//                           <ScalableText style={styles.installmentTitle} fontFamily="Medium">
//                             Paid Installment {paidInst.installmentNumber}
//                           </ScalableText>
                          
//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Payment Date
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {formatDate(paidInst.paymentReceiveDate || paidInst.paidDate || paidInst.receivedDate || paidInst.paymentDate)}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Amount Paid
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {formatCurrency(paidInst.receivedPayment || paidInst.duePayment)}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           <View style={styles.inputSpacing}>
//                             <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                               Description
//                             </ScalableText>
//                             <View style={styles.inputContainer}>
//                               <ScalableText style={styles.inputValue} fontFamily="Regular">
//                                 {paidInst.paymentNotes || "No description"}
//                               </ScalableText>
//                             </View>
//                           </View>

//                           {/* PAID Status Badge */}
//                           <View style={styles.paidStatusBadge}>
//                             <ScalableText style={styles.paidStatusText} fontFamily="Bold">
//                               PAID
//                             </ScalableText>
//                           </View>
//                         </View>
//                       ))}
//                   </View>
//                 )}

//                 {/* Apply Coupon Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Apply Coupon
//                   </ScalableText>
//                   <View style={styles.couponContainer}>
//                     {/* Show selected coupon in input field */}
//                     {selectedCoupon ? (
//                       <View style={styles.selectedCouponContainer}>
//                         <View style={styles.selectedCouponInfo}>
//                           <ScalableText style={styles.selectedCouponName} fontFamily="Medium">
//                             {selectedCoupon.couponName} - {selectedCoupon.couponType === 'flat' ? '₹' : '%'}{selectedCoupon.discountValue}
//                           </ScalableText>
//                         </View>
//                         <TouchableOpacity 
//                           style={styles.removeCouponButton}
//                           onPress={() => {
//                             setSelectedCoupon(null);
                            
//                             // Force refresh installment amounts when coupon is removed
//                             setTimeout(() => {
//                               console.log('🔄 Coupon removed - forcing installment amount refresh');
//                               recalculateInstallmentAmounts();
//                             }, 100);
//                           }}
//                         >
//                           <ScalableText style={styles.removeCouponText} fontFamily="Bold">×</ScalableText>
//                         </TouchableOpacity>
//                       </View>
//                     ) : (
//                       /* Show dropdown when no coupon is selected */
//                       <SelectDropdown
//                         label="Select coupon"
//                         onChange={(value) => handleCouponSelection(value)}
//                         options={couponsLoading ? [{ label: 'Loading...', value: '' }] : availableCoupons}
//                         value={
//                           availableCoupons.find(
//                             (opt: CouponOption) => opt.value === (selectedCoupon?.couponId || '')
//                           ) as any
//                         }
//                         dropdownButtonStyle={styles.couponDropdownStyle}
//                       />
//                     )}
//                     <TouchableOpacity style={styles.addButton} onPress={handleAddCoupon}>
//                       <ScalableText style={styles.addButtonText} fontFamily="Bold">+</ScalableText>
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* Discount Amount */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Discount Amount
//                   </ScalableText>
//                   <View style={styles.inputContainer}>
//                     <ScalableText style={styles.inputValue} fontFamily="Regular">
//                       {formatCurrency(discountAmount)}
//                     </ScalableText>
//                   </View>
//                 </View>

//                 {/* Discounted Payment Amount */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Payment After Discount
//                   </ScalableText>
//                   <View style={styles.inputContainer}>
//                     <ScalableText style={styles.inputValue} fontFamily="Regular">
//                       {formatCurrency(paymentAfterDiscount)}
//                     </ScalableText>
//                   </View>
//                 </View>

//                 {/* First Installment Question */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                     Are you paying first installment right now? *
//                   </ScalableText>
//                   <SelectDropdown
//                     label="Select option"
//                     onChange={(value) => setIsPayingFirstInstallment(value)}
//                     options={[
//                       { label: 'Paid', value: 'paid' },
//                       { label: 'Due', value: 'due' }
//                     ]}
//                     value={
//                       isPayingFirstInstallment
//                         ? ({
//                             label: isPayingFirstInstallment === 'paid' ? 'Paid' : 'Due',
//                             value: isPayingFirstInstallment,
//                           } as any)
//                         : (undefined as any)
//                     }
//                     dropdownButtonStyle={styles.couponDropdownStyle}
//                   />
//                 </View>

//                 {/* Payment Mode Fields - Only show if paying first installment */}
//                 {isPayingFirstInstallment === 'paid' && dynamicInstallments.length > 0 && (
//                   <View style={styles.formField}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Mode of Payment for Paid Installment *
//                     </ScalableText>
                    
//                     {/* Payment Mode Selection */}
//                     <View style={styles.paymentModeContainer}>
//                       <TouchableOpacity
//                         style={[
//                           styles.paymentModeButton,
//                           dynamicInstallments[0]?.paymentMode === 'cash' && styles.paymentModeButtonActive
//                         ]}
//                         onPress={() => {
//                           const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                             index === 0 ? { ...inst, paymentMode: 'cash' } : inst
//                           );
//                           setDynamicInstallments(updatedInstallments);
//                         }}
//                       >
//                         <ScalableText
//                           style={{
//                             ...styles.paymentModeButtonText,
//                             ...(dynamicInstallments[0]?.paymentMode === 'cash'
//                               ? styles.paymentModeButtonTextActive
//                               : {}),
//                           }}
//                           fontFamily="Medium"
//                         >
//                           Cash
//                         </ScalableText>
//                       </TouchableOpacity>
                      
//                       <TouchableOpacity
//                         style={[
//                           styles.paymentModeButton,
//                           dynamicInstallments[0]?.paymentMode === 'online' && styles.paymentModeButtonActive
//                         ]}
//                         onPress={() => {
//                           const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                             index === 0 ? { ...inst, paymentMode: 'online' } : inst
//                           );
//                           setDynamicInstallments(updatedInstallments);
//                         }}
//                       >
//                         <ScalableText
//                           style={{
//                             ...styles.paymentModeButtonText,
//                             ...(dynamicInstallments[0]?.paymentMode === 'online'
//                               ? styles.paymentModeButtonTextActive
//                               : {}),
//                           }}
//                           fontFamily="Medium"
//                         >
//                           Online
//                         </ScalableText>
//                       </TouchableOpacity>
//                     </View>

//                     {/* Payment Received By - Only show for cash mode */}
//                     {dynamicInstallments[0]?.paymentMode === 'cash' && (
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Payment Received By *
//                         </ScalableText>
//                         <SelectDropdown
//                           label="Select employee"
//                           onChange={(value) => {
//                             const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                               index === 0 ? { ...inst, paymentRecieverId: value } : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                           options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
//                           value={availableEmployees.find(emp => emp.value === dynamicInstallments[0]?.paymentRecieverId)}
//                           dropdownButtonStyle={styles.couponDropdownStyle}
//                         />
//                       </View>
//                     )}

//                     {/* Transaction ID - Only show for online mode */}
//                     {dynamicInstallments[0]?.paymentMode === 'online' && (
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Transaction ID *
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`transactionId${dynamicInstallments[0]?.installmentId}`}
//                           label=""
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter transaction ID"
//                           value={dynamicInstallments[0]?.transactionId || ''}
//                           onChangeText={(text) => {
//                             const updatedInstallments = dynamicInstallments.map((inst, index) => 
//                               index === 0 ? { ...inst, transactionId: text } : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                         />
//                       </View>
//                     )}
//                   </View>
//                 )}

//                 {/* Due Installments Section */}
//                 <View style={styles.formField}>
//                   <ScalableText style={styles.formLabel} fontFamily="Medium">
//                     Due Installments
//                   </ScalableText>
                  
//                   {dynamicInstallments.map((dueInst: any, index: number) => (
//                     <View key={`due-${dueInst.installmentId}`} style={styles.installmentContainer}>
//                       <View style={styles.installmentHeader}>
//                         <ScalableText style={styles.installmentTitle} fontFamily="Medium">
//                           Due Installment
//                         </ScalableText>
//                         <TouchableOpacity
//                           style={styles.removeInstallmentButton}
//                           onPress={() => handleRemoveInstallment(dueInst.installmentId)}
//                         >
//                           <ScalableText style={styles.removeButtonText} fontFamily="Bold">−</ScalableText>
//                         </TouchableOpacity>
//                       </View>
                      
//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Due Date *
//                         </ScalableText>
//                         <View style={styles.inputContainer}>
//                           <DateInput
//                             handler={dateHandler}
//                             name={`installmentDate${dueInst.installmentId}`}
//                             label="Select due date"
//                             inputRoot={styles.dateInputStyle}
//                             minimumDate={new Date()}
//                           />
//                         </View>
//                       </View>

//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Due Amount *
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`installmentAmount${dueInst.installmentId}`}
//                           label=""
//                           keyboardType="numeric"
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter amount"
//                           onChangeText={(text) => {
//                             // Update the installment amount in state
//                             const newAmount = parseFloat(text) || 0;
//                             const updatedInstallments = dynamicInstallments.map(inst => 
//                               inst.installmentId === dueInst.installmentId 
//                                 ? { ...inst, duePayment: newAmount }
//                                 : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
                            
//                             console.log('🎯 Updated installment state:', {
//                               updatedInstallments,
//                               currentInstallmentId: dueInst.installmentId,
//                               newAmount
//                             });
                            
//                             // Auto-adjust remaining installments to maintain total
//                             // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
//                             const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
//                             const remainingAmount = baseAmount - newAmount;
//                             const remainingInstallments = dynamicInstallments.length - 1;
                            
//                             console.log('🎯 Auto-adjusting remaining installments:', {
//                               newAmount,
//                               baseAmount,
//                               remainingAmount,
//                               remainingInstallments,
//                               currentInstallmentId: dueInst.installmentId,
//                               selectedCoupon: selectedCoupon?.couponName,
//                               paymentAfterDiscount
//                             });
                            
//                             if (remainingInstallments > 0 && remainingAmount >= 0) {
//                               // Distribute remaining amount equally among remaining installments
//                               const equalAmount = Math.floor(remainingAmount / remainingInstallments);
//                               const remainder = remainingAmount % remainingInstallments;
                              
//                               let currentIndex = 1;
//                               const finalUpdatedInstallments = updatedInstallments.map(inst => {
//                                 if (inst.installmentId !== dueInst.installmentId) {
//                                   const installmentAmount = equalAmount + (currentIndex <= remainder ? 1 : 0);
//                                   currentIndex++;
//                                   console.log(`🎯 Auto-adjusted installment ${inst.installmentId} to: ${installmentAmount}`);
//                                   return { ...inst, duePayment: installmentAmount };
//                                 }
//                                 return inst;
//                               });
                              
//                               setDynamicInstallments(finalUpdatedInstallments);
                              
//                               console.log('🎯 Final updated installments after auto-adjustment:', finalUpdatedInstallments);
                              
//                               // Update form values for all installments
//                               finalUpdatedInstallments.forEach((inst) => {
//                                 const fieldName = `installmentAmount${inst.installmentId}`;
//                                 installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
//                               });
//                             }
//                           }}
//                         />
//                       </View>

//                       <View style={styles.inputSpacing}>
//                         <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                           Description
//                         </ScalableText>
//                         <Input
//                           handler={installmentHandler}
//                           name={`installmentDescription${dueInst.installmentId}`}
//                           label=""
//                           containerStyles={styles.inputContainer}
//                           placeholder="Enter description"
//                           value={dueInst.paymentNotes || ''}
//                           onChangeText={(text) => {
//                             // Update the installment description in state
//                             const updatedInstallments = dynamicInstallments.map(inst => 
//                               inst.installmentId === dueInst.installmentId 
//                                 ? { ...inst, paymentNotes: text }
//                                 : inst
//                             );
//                             setDynamicInstallments(updatedInstallments);
//                           }}
//                         />
//                       </View>
//                     </View>
//                   ))}

//                   {/* Add New Due Installment Button */}
//                   <TouchableOpacity style={styles.addNewInstallmentButton} onPress={handleAddInstallment}>
//                     <ScalableText style={styles.addNewButtonText} fontFamily="Bold">+</ScalableText>
//                     <ScalableText style={styles.addNewButtonLabel} fontFamily="Medium">
//                       Add Due Installment
//                     </ScalableText>
//                   </TouchableOpacity>

 
//                 </View>

//                 {/* Submit Button */}
//                 <TouchableOpacity 
//                   style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
//                   onPress={handleSubmitPayment}
//                   disabled={isSubmitting}
//                 >
//                   <ScalableText style={styles.submitButtonText} fontFamily="SemiBold">
//                     {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
//                   </ScalableText>
//                 </TouchableOpacity>
//               </View>
//             </Flex>
//           )}
//         </Flex>
//       </ThemeScrollView>

//       {/* Update Payment Status Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={handleCloseModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Modal Header */}
//             <Flex flexDirection="row" justify="space-between" align="center" mb={25}>
//               <ScalableText style={styles.modalTitle} fontFamily="Bold">
//                 Update Payment Status
//               </ScalableText>
//               <TouchableOpacity 
//                 onPress={handleCloseModal} 
//                 style={styles.modalCloseButton}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.closeIconContainer}>
//                   <ScalableText style={styles.closeIcon} fontFamily="Bold">×</ScalableText>
//                 </View>
//               </TouchableOpacity>
//             </Flex>

//             {/* Current Payment Details - Single line format (web-style) */}
//             <View style={styles.currentPaymentDetailContainer}>
//               <Flex flexDirection="row" align="center" justify="space-between">
//                 <Flex flexDirection="row" align="center" styles={{ flexWrap: 'wrap', flex: 1 }}>
//                   {/* Date section */}
//                   <Flex flexDirection="row" align="center" mr={16}>
//                     <ScalableText style={styles.currentPaymentValue} fontFamily="Regular">
//                       {(() => {
//                         if (!selectedInstallment) return "-";
//                         if (selectedInstallment.paymentStatus?.toLowerCase() === "paid") {
//                           return formatDate(
//                             selectedInstallment.paymentReceiveDate ||
//                               selectedInstallment.paidDate ||
//                               selectedInstallment.receivedDate ||
//                               selectedInstallment.paymentDate
//                           );
//                         }
//                         return formatDate(
//                           selectedInstallment.nextpaymentDate ||
//                             selectedInstallment.formatedNextpaymentDate
//                         );
//                       })()}
//                     </ScalableText>
//                   </Flex>

//                   {/* Amount section */}
//                   <Flex flexDirection="row" align="center">
//                     <ScalableText style={styles.currentPaymentAmountValue} fontFamily="Bold">
//                       {formatCurrency(
//                         selectedInstallment?.receivedPayment ||
//                           selectedInstallment?.duePayment ||
//                           0
//                       )}
//                     </ScalableText>
//                   </Flex>
//                 </Flex>

//                 {/* Status chip on right */}
//                 {selectedInstallment && (() => {
//                   const modalDisplayStatus = getDisplayStatus(selectedInstallment);
//                   const modalStatusStyle = getStatusColor(modalDisplayStatus);
//                   return (
//                     <Flex
//                       styles={{
//                         ...styles.statusChip,
//                         backgroundColor: modalStatusStyle.backgroundColor,
//                       }}
//                       >
//                       <ScalableText
//                         style={{
//                           ...styles.statusChipText,
//                           color: modalStatusStyle.color,
//                         }}
//                         fontFamily="Medium"
//                       >
//                         {modalDisplayStatus.toUpperCase()}
//                       </ScalableText>
//                     </Flex>
//                   );
//                 })()}
//               </Flex>
//             </View>

//             {/* Form row: Status + Date (side by side) */}
//             <View style={styles.formRowContainer}>
//               {/* Status field */}
//               <View style={styles.formFieldHalf}>
//                 <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                   Status *
//                 </ScalableText>
//                 <SelectDropdown
//                   label=""
//                   onChange={(value) => setPaymentStatus(value)}
//                   options={[
//                     { label: "Paid", value: "paid" },
//                     { label: "Due", value: "due" },
//                   ]}
//                   value={{
//                     label:
//                       paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
//                     value: paymentStatus,
//                   }}
//                   dropdownButtonStyle={styles.modalDropdownStyle}
//                 />
//               </View>

//               {/* Date field */}
//               <View style={styles.formFieldHalf}>
//                 <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                   Date *
//                 </ScalableText>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setStatusDatePickerOpen(true)}
//                  >  
//                   <Flex flexDirection="row" align="center" justify="space-between">
//                     <ScalableText style={styles.dateInputText} fontFamily="Regular">
//                       {paymentDate.toLocaleDateString("en-GB")}
//                     </ScalableText>
//                     <ScalableText style={styles.calendarIcon} fontFamily="Regular">
//                       📅
//                     </ScalableText>
//                   </Flex>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Mode of payment for this installment */}
//             <View style={styles.paymentModeSection}>
//               <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                 Mode of payment for this installment
//               </ScalableText>
//               <View style={styles.paymentModeContainer}>
//                 <TouchableOpacity
//                   style={[
//                     styles.paymentModeButton,
//                     paymentMode === 'cash' && styles.paymentModeButtonActive
//                   ]}
//                   onPress={() => setPaymentMode('cash')}
//                 >
//                   <ScalableText 
//                     style={paymentMode === 'cash' 
//                       ? styles.paymentModeButtonTextActive 
//                       : styles.paymentModeButtonText
//                     } 
//                     fontFamily="Medium"
//                   >
//                     Cash
//                   </ScalableText>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[
//                     styles.paymentModeButton,
//                     paymentMode === 'online' && styles.paymentModeButtonActive
//                   ]}
//                   onPress={() => setPaymentMode('online')}
//                 >
//                   <ScalableText 
//                     style={paymentMode === 'online' 
//                       ? styles.paymentModeButtonTextActive 
//                       : styles.paymentModeButtonText
//                     } 
//                     fontFamily="Medium"
//                   >
//                     Online
//                   </ScalableText>
//                 </TouchableOpacity>
//               </View>

//               {/* Extra fields for selected payment mode - fixed height container to avoid jumping */}
//               <View style={styles.paymentModeExtraContainer}>
//                 {/* Payment Received By - only for cash */}
//                 {paymentMode === 'cash' && (
//                   <View style={styles.modalFieldSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Payment received by
//                     </ScalableText>
//                     <SelectDropdown
//                       label="Select employee"
//                       onChange={(value) => setPaymentReceiverId(value)}
//                       options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
//                       value={availableEmployees.find(emp => emp.value === paymentReceiverId) as any}
//                       dropdownButtonStyle={styles.modalDropdownStyle}
//                     />
//                   </View>
//                 )}

//                 {/* Transaction ID - only for online */}
//                 {paymentMode === 'online' && (
//                   <View style={styles.modalFieldSpacing}>
//                     <ScalableText style={styles.inputLabel} fontFamily="Medium">
//                       Transaction ID
//                     </ScalableText>
//                     <View style={styles.transactionIdInputWrapper}>
//                       <Input
//                         handler={installmentHandler}
//                         name="modalTransactionId"
//                         label=""
//                         containerStyles={styles.transactionIdInputContainer}
//                         placeholder="Enter transaction ID"
//                         value={transactionId}
//                         onChangeText={(text) => setTransactionId(text)}
//                       />
//                     </View>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Note text */}
//             <View style={styles.noteContainer}>
//               <ScalableText style={styles.modalNote} fontFamily="Regular">
//                 Note: If you change the status of this installment from Paid to Due, the
//                 payment mode, transaction details and payment receiver details will also
//                 be removed.
//               </ScalableText>
//             </View>

//             {/* Save Button */}
//             <Button
//               title={isUpdating ? "UPDATING..." : "SAVE"}
//               onPress={handleSavePayment}
//               btnStyles={isUpdating ? styles.saveButtonDisabled : styles.saveButton}
//               btnTxtStyles={styles.saveButtonText}
//               disabled={isUpdating}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* Status Date Picker (for Update Payment Status modal) */}
//       <DatePicker
//         modal
//         open={statusDatePickerOpen}
//         mode="date"
//         date={paymentDate || new Date()}
//         onConfirm={(date) => {
//           setStatusDatePickerOpen(false);
//           if (date && !isNaN(date.getTime())) {
//             setPaymentDate(date);
//           }
//         }}
//         onCancel={() => setStatusDatePickerOpen(false)}
//       />

//       {/* Date Picker Modal */}
//       <Modal
//         visible={showDatePicker}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setShowDatePicker(false);
//           setSelectedInstallmentForDate('');
//         }}
//       >
//         <TouchableWithoutFeedback onPress={() => {
//           setShowDatePicker(false);
//           setSelectedInstallmentForDate('');
//         }}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View style={styles.datePickerContainer}>
//                 <View style={styles.datePickerHeader}>
//                   <ScalableText style={styles.datePickerTitle} fontFamily="Bold">
//                     Select Due Date
//                   </ScalableText>
//                   <TouchableOpacity onPress={() => {
//                     setShowDatePicker(false);
//                     setSelectedInstallmentForDate('');
//                   }}>
//                     <View style={styles.closeButtonContainer}>
//                       <ScalableText style={styles.closeButton} fontFamily="Bold">×</ScalableText>
//                     </View>
//                   </TouchableOpacity>
//                 </View>
                
//                 <DatePicker
//                   date={paymentDate || new Date()}
//                   mode="date"
//                   onDateChange={(date) => {
//                     console.log('DatePicker onDateChange:', date);
//                     if (date && !isNaN(date.getTime())) {
//                       console.log('Setting payment date to:', date);
//                       setPaymentDate(date);
//                     } else {
//                       console.log('Invalid date received:', date);
//                     }
//                   }}
//                   minimumDate={new Date()}
//                 />
                
//                 <View style={styles.datePickerActions}>
//                   <Button
//                     title="Cancel"
//                     onPress={() => {
//                       setShowDatePicker(false);
//                       setSelectedInstallmentForDate('');
//                     }}
//                     btnStyles={styles.cancelButton}
//                     btnTxtStyles={styles.cancelButtonText}
//                   />
//                   <Button
//                     title="Confirm"
//                     onPress={() => {
//                       // Update only the selected installment's due date
//                       if (paymentDate && !isNaN(paymentDate.getTime())) {
//                         console.log('Updating installment date:', {
//                           installmentId: selectedInstallmentForDate,
//                           newDate: paymentDate.toLocaleDateString("en-GB"),
//                           formattedDate: paymentDate.toISOString().split('T')[0]
//                         });
                        
//                         const updatedInstallments = dynamicInstallments.map(inst => 
//                           inst.installmentId === selectedInstallmentForDate 
//                             ? {
//                                 ...inst,
//                                 nextpaymentDate: paymentDate.toLocaleDateString("en-GB"),
//                                 formatedNextpaymentDate: paymentDate.toISOString().split('T')[0]
//                               }
//                             : inst
//                         );
                        
//                         console.log('Updated installments:', updatedInstallments);
//                         setDynamicInstallments(updatedInstallments);
//                         setShowDatePicker(false);
//                         setSelectedInstallmentForDate('');
//                       } else {
//                         console.log('Invalid payment date:', paymentDate);
//                       }
//                     }}
//                     btnStyles={styles.confirmButton}
//                     btnTxtStyles={styles.confirmButtonText}
//                   />
//                 </View>
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       {/* Reminder Menu Modal */}
//       <Modal
//         visible={showReminderMenu !== null}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowReminderMenu(null)}
//       >
//         <View style={styles.reminderModalOverlay}>
//           <TouchableWithoutFeedback onPress={() => setShowReminderMenu(null)}>
//             <View style={StyleSheet.absoluteFill} />
//           </TouchableWithoutFeedback>
//           <View style={styles.reminderMenuModal}>
//             <TouchableOpacity 
//               style={styles.reminderMenuItem}
//               onPress={() => {
//                 if (showReminderMenu) {
//                   handleReminderAction('WhatsApp', showReminderMenu);
//                 }
//               }}
//               activeOpacity={0.7}
//             >
//               <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                 WhatsApp
//               </ScalableText>
//             </TouchableOpacity>
//             <View style={{ height: 1, backgroundColor: '#E8E8E8', marginVertical: 2 }} />
//             <TouchableOpacity 
//               style={styles.reminderMenuItem}
//               onPress={() => {
//                 if (showReminderMenu) {
//                   handleReminderAction('Email', showReminderMenu);
//                 }
//               }}
//               activeOpacity={0.7}
//             >
//               <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                 Email
//               </ScalableText>
//             </TouchableOpacity>
//             <View style={{ height: 1, backgroundColor: '#E8E8E8', marginVertical: 2 }} />
//             <TouchableOpacity 
//               style={styles.reminderMenuItem}
//               onPress={() => {
//                 if (showReminderMenu) {
//                   handleReminderAction('SMS', showReminderMenu);
//                 }
//               }}
//               activeOpacity={0.7}
//             >
//               <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
//                 SMS
//               </ScalableText>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeView>
//   );
// };

// const styles = StyleSheet.create({
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTab: {
//     backgroundColor: COLORS.white,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   inactiveTab: {
//     backgroundColor: "transparent",
//   },
//   activeTabText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   inactiveTabText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//     marginBottom: 5,
//   },
//   headerRow: {
//     backgroundColor: "#F8F9FA",
//     borderBottomWidth: 1,
//     borderColor: "#E8E8E8",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginBottom: 8,
    
//   },
//   installmentTableWrapper: {
//     minWidth: 900, // wider table so columns have more space
//   },
//   headerText: {
//     color: COLORS.textSecondary,
//     fontSize: 9,
//     textAlign: "center",
//     fontWeight: "600",
   
//   },
//   dataRow: {
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderColor: "#F0F0F0",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     marginBottom: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   dataText: {
//     color: COLORS.black,
//     fontSize: 12,
//     textAlign: "center",
//     textTransform: "capitalize",
//     lineHeight: 16,
//   },
//   statusChip: {
//     borderRadius: 12,
//     paddingHorizontal: 8,
//  marginLeft:"-15%",
//     paddingVertical: 4,
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 50,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   statusChipText: {
//     fontSize: 10,
//     textTransform: "uppercase",
//     fontWeight: "600",
//     letterSpacing: 0.3,
//   },
//   noDataText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//   },
//   modalContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 20,
//     width: "90%",
//     maxWidth: 500,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   modalTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   modalSubtitle: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   currentLabel: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     marginBottom: 2,
//   },
//   currentValue: {
//     fontSize: 13,
//     color: COLORS.black,
//   },
//   paymentAmount: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//     marginTop: 2,
//   },
//   inputLabel: {
//     fontSize: 15,
//     marginBottom: 8,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "100%",
//     alignItems: "center",
//     shadowColor: COLORS.primary,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   saveButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   closeIconContainer: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeIcon: {
//     fontSize: 28,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Bold",
//     lineHeight: 28,
//     textAlign: 'center',
//   },
//   dateInput: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     width: "100%",
//     marginTop: 8,
//     minHeight: 48,
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   calendarIcon: {
//     fontSize: 18,
//   },
//   paymentDetailsCard: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     width: "100%",
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.primary,
//   },
//   modalCloseButton: {
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     width: 32,
//     height: 32,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: 'hidden',
//   },
//   saveButtonDisabled: {
//     backgroundColor: COLORS.textSecondary,
//     opacity: 0.7,
//   },
//   modalNote: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//     lineHeight: 16,
//   },
//   currentPaymentDetailContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginBottom: 20,
//   },
//   currentPaymentLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//     marginRight: 8,
//   },
//   currentPaymentValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   currentPaymentAmountValue: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//   },
//   formRowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     gap: 12,
//   },
//   formFieldHalf: {
//     flex: 1,
//   },
//   modalDropdownStyle: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginTop: 8,
//   },
//   modalFieldSpacing: {
//     marginTop: 8,
//   },
//   paymentModeExtraContainer: {
//     marginTop: 12,
//     minHeight: 110, // enough space for either dropdown or input, keeps modal position stable
//   },
//   noteContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 18,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: "#FFA500",
//   },
//   updateFormText: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   updateFormContainer: {
//     padding: 24,
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//     borderWidth: 1,
//     borderColor: "#F0F0F0",
//   },
//   formField: {
//     marginBottom: 20,
//   },
//   formLabel: {
//     fontSize: 15,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//     marginBottom: 10,
//     fontWeight: "600",
//   },
//   inputField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   inputValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   couponSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   couponDropdown: {
//     flex: 1,
//     marginRight: 10,
//   },
//   couponPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   addCouponButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addButtonText: {
//     color: COLORS.white,
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     lineHeight: 24,
//   },
//   dropdownField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   dropdownPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   installmentRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   installmentInfo: {
//     flex: 1,
//     marginRight: 10,
//   },
//   installmentLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//     marginBottom: 8,
//   },
//   dateField: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   dateValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//     flex: 1,
//   },
//   amountField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   amountValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Regular",
//   },
//   addInstallmentButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   descriptionField: {
//     marginTop: 15,
//   },
//   textAreaField: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   textAreaPlaceholder: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   submitButtonText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//     fontWeight: "600",
//   },
//   submitButtonDisabled: {
//     backgroundColor: COLORS.textSecondary,
//     opacity: 0.7,
//   },
//   paymentModeSection: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   paymentModeContainer: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 8,
//   },
//   paymentModeButton: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   paymentModeButtonActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   paymentModeButtonText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   paymentModeButtonTextActive: {
//     color: COLORS.white,
//   },
//   debugContainer: {
//     backgroundColor: "#F0F0F0",
//     borderRadius: 10,
//     padding: 15,
//     marginTop: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   debugText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//     marginBottom: 5,
//   },
//   reminderMenu: {
//     position: 'absolute',
//     top: 25,
//     right: -10,
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 0,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//     zIndex: 9999,
//     minWidth: 120,
//     width: 120,
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//   },
//   reminderMenuItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 4,
//     marginVertical: 0,
//     width: '100%',
//   },
//   reminderMenuText: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: 'Poppins-Medium',
//     textAlign: 'left',
//   },
//   reminderButton: {
//     padding: 2,
//     borderRadius: 8,
//     backgroundColor: "#F8F9FA",
//     width: 24,
//     height: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   reminderModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   reminderMenuModal: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 0,
//     minWidth: 150,
//     width: 150,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: '#E8E8E8',
//   },
//   summarySection: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   paidStatusBadge: {
//     backgroundColor: "#ECFFE0",
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     alignSelf: "flex-start",
//     marginTop: 10,
//   },
//   paidStatusText: {
//     fontSize: 12,
//     color: "#4AC400",
//     fontFamily: "Poppins-Bold",
//   },
//   removeInstallmentButton: {
//     backgroundColor: "#FFE6E6",
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   removeButtonText: {
//     fontSize: 18,
//     color: "#FF4444",
//     fontFamily: "Poppins-Bold",
//   },
//   addNewInstallmentButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     marginTop: 15,
//   },
//   addNewButtonText: {
//     fontSize: 20,
//     color: COLORS.primary,
//     fontFamily: "Poppins-Bold",
//     marginRight: 8,
//   },
//   addNewButtonLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   descriptionValue: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Regular",
//   },
//   installmentContainer: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   installmentHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   installmentTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: COLORS.primary,
//     fontFamily: "Poppins-Medium",
//   },
//   inputSpacing: {
//     marginBottom: 10,
//   },
//   inputContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   transactionIdInputWrapper: {
//     marginTop: 8,
//   },
//   transactionIdInputContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     borderWidth: 0,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   dateInputStyle: {
//     marginTop: 0,
//     height: 48,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     backgroundColor: COLORS.white,
//     elevation: 0,
//     shadowOpacity: 0,
//     justifyContent: 'center',
//     paddingHorizontal: 16,
//   },
//   couponContainer: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: 8,
//     marginTop: 8,
//   },
//   addButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     borderWidth: 0,
//   },
//   couponDropdownStyle: {
//     flex: 1,
//     marginRight: 8,
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   selectedCouponContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     marginRight: 8,
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   selectedCouponInfo: {
//     flex: 1,
//   },
//   selectedCouponName: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Medium",
//   },
//   removeCouponButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   removeCouponText: {
//     fontSize: 16,
//     color: COLORS.white,
//     fontFamily: "Poppins-Bold",
//   },
//   totalAmountSection: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   totalAmountRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   totalAmountLabel: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Medium",
//   },
//   totalAmountValue: {
//     fontSize: 14,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   datePickerContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     padding: 24,
//     width: "85%",
//     maxWidth: 400,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   datePickerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   datePickerTitle: {
//     fontSize: 18,
//     color: COLORS.black,
//     fontFamily: "Poppins-Bold",
//   },
//   cancelButton: {
//     backgroundColor: COLORS.textSecondary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "48%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   confirmButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     width: "48%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   confirmButtonText: {
//     fontSize: 15,
//     color: COLORS.white,
//     fontFamily: "Poppins-SemiBold",
//   },
//   datePickerActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//     gap: 12,
//   },
//   closeButton: {
//     fontSize: 24,
//     color: COLORS.textSecondary,
//     fontFamily: "Poppins-Bold",
//   },
//   closeButtonContainer: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     width: 36,
//     height: 36,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// export default UpdatePaymentScreen; 



import React, { FC, useState, useMemo, useEffect } from "react";
import { StyleSheet, View, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Platform, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import SafeView from "../../../../../@ui/safe-view/SafeView";
import AppHeader from "../../../../../@ui/app-header/AppHeader";
import ThemeScrollView from "../../../../../@ui/theme-scroll-view/ThemeScrollView";
import Flex from "../../../../../@ui/flex/Flex";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../../../colors";
import { Col, Grid, Row } from "react-native-easy-grid";
import { THomeStackNavigator } from "../../../../../navigators/tab-navigator/sub-stack-navigator/HomeStackNavigator";
import { useCourseDetailsQuery } from "../../../../../apis/hooks/course/query/useCourseDetails.query";
import { useStudentDetailsQuery } from "../../../../../apis/hooks/students/query/useStudentDetails.query";
import { useListCouponsQuery } from "../../../../../apis/hooks/coupons/query/useListCoupons.query";
import { useEmployeesListQuery } from "../../../../../apis/hooks/employee/query/useEmployeesList.query";
import ActionIcon from "../../../../../@ui/action-icon/ActionIcon";
import AutoHeightImage from "../../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../../images";
import Button from "../../../../../@ui/button/Button";
import SelectDropdown from "../../../../../@ui/select-dropdown/SelectDropdown";
import Input from "../../../../../@ui/input/Input";
import DateInput from "../../../../../@ui/date-input/DateInput";
import DatePicker from "react-native-date-picker";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import RNBlobUtil from "react-native-blob-util";
import { request } from "../../../../../services/axios.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../../../apis/urls";
import { useSendStudentFeeSlipInvoiceMutation } from "../../../../../apis/hooks/students/mutation/useSendStudentFeeSlipInvoice.mutation";
import { useSendReminderMutation } from "../../../../../apis/hooks/students/mutation/useSendReminder.mutation";
import { useSendEmailReminderMutation } from "../../../../../apis/hooks/students/mutation/useSendEmailReminder.mutation";
import { ToastAndroid } from "react-native";

interface IUpdatePaymentScreen {
  course: TCourse;
  studentRollNo: string;
}

interface CouponOption {
  label: string;
  value: string;
  couponData?: any;
}

const UpdatePaymentScreen: FC = () => {
  const windowHeight = Dimensions.get("window").height;
  const navigation = useNavigation<THomeStackNavigator>();
  const route = useRoute<any>();
  const { course, studentRollNo } = route.params;
  const [activeTab, setActiveTab] = useState<"installment" | "payment">("installment");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today;
  });
  const [paymentMode, setPaymentMode] = useState<string>("");
  const [paymentReceiverId, setPaymentReceiverId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false); // for installment due dates
  const [statusDatePickerOpen, setStatusDatePickerOpen] = useState(false); // for Update Payment Status modal
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState<string | null>(null);
  const [isPayingFirstInstallment, setIsPayingFirstInstallment] = useState<string>('');
  const [installmentDescription, setInstallmentDescription] = useState('');
  const [selectedInstallmentForDate, setSelectedInstallmentForDate] = useState<string>('');
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [invoicePdf, setInvoicePdf] = useState<string | null>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  
  
  // Form handler for dynamic installments
  const installmentHandler = useForm();
  
  // Form handler for date inputs
  const dateHandler = useForm();
  
  // Coupon states
  const [availableCoupons, setAvailableCoupons] = useState<CouponOption[]>([
    { label: 'Select coupon', value: '' }
  ]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentAfterDiscount, setPaymentAfterDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Employee states
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  
  // Dynamic installment states
  const [dynamicInstallments, setDynamicInstallments] = useState<any[]>([]);
  const [nextInstallmentNumber, setNextInstallmentNumber] = useState(1);

  // Set default values for installment amounts
  useMemo(() => {
    dynamicInstallments.forEach((inst: any) => {
      installmentHandler.setValue(`installmentAmount${inst.installmentId}`, inst.duePayment?.toString() || "0");
    });
  }, [dynamicInstallments]);

  // Watch for changes in installment amounts
  const watchedAmounts = installmentHandler.watch();

  // Update installment amounts when form values change
  useEffect(() => {
    dynamicInstallments.forEach((inst) => {
      const fieldName = `installmentAmount${inst.installmentId}`;
      const newAmount = watchedAmounts[fieldName];
      
      if (newAmount !== undefined && newAmount !== inst.duePayment?.toString()) {
        const amount = parseFloat(newAmount) || 0;
        handleUpdateInstallmentAmount(inst.installmentId, amount);
      }
    });
  }, [watchedAmounts]);
  
  // Get user and organization data from Redux
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const selectedOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);
  const organization = useSelector((state: RootState) => state.organization.organization);

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Mutation hook for sending invoice email
  const { mutateAsync: sendInvoiceEmail, isPending: isSendingInvoice } = useSendStudentFeeSlipInvoiceMutation();
  
  // Mutation hook for sending reminders (WhatsApp/SMS)
  const { mutateAsync: sendReminder, isPending: isSendingReminder } = useSendReminderMutation();
  
  // Mutation hook for sending email reminders
  const { mutateAsync: sendEmailReminder, isPending: isSendingEmailReminder } = useSendEmailReminderMutation();

  // API calls for dynamic data
  const { data: courseData, isLoading: courseLoading } = useCourseDetailsQuery({
    courseId: course.courseId,
  });

  const { data: studentData, isLoading: studentLoading, refetch: refetchStudentData } = useStudentDetailsQuery(studentRollNo);

  // Fetch coupons from API
  const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useListCouponsQuery();
  
  // Fetch employees from API
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesListQuery();

  // Get payment details from student data
  const paymentDetails = useMemo(() => {
    console.log("Student Data:", JSON.stringify(studentData, null, 2));
    console.log("Course ID:", course.courseId);
    
    if (studentData?.data?.courses) {
      const foundCourse = studentData.data.courses.find((c: any) => c.courseId === course.courseId);
      console.log("Found Course:", JSON.stringify(foundCourse, null, 2));
      return foundCourse?.paymentDetails;
    }
    return null;
  }, [studentData, course.courseId]);

  // Get installment details
  const installmentDetails = useMemo(() => {
    console.log("Payment Details:", JSON.stringify(paymentDetails, null, 2));
    console.log("Installment Details:", JSON.stringify(paymentDetails?.installmentDetails, null, 2));
    return paymentDetails?.installmentDetails || [];
  }, [paymentDetails]);

  // Convert API coupon data to dropdown options
  useMemo(() => {
    if (couponsData && couponsData.length > 0) {
      const couponOptions: CouponOption[] = couponsData.map((coupon: any) => ({
        label: `${coupon.couponName} - ${coupon.couponType === 'Flat' ? '₹' : '%'}${coupon.couponValue}`,
        value: coupon.couponId || coupon.couponName.toLowerCase().replace(/\s+/g, ''),
        couponData: coupon // Store full coupon data for reference
      }));
      setAvailableCoupons(couponOptions);
      console.log('🎫 Coupons loaded from API:', couponOptions);
    }
  }, [couponsData]);

  // Convert API employee data to dropdown options
  useMemo(() => {
    if (employeesData?.data && employeesData.data.length > 0) {
      const employeeOptions = employeesData.data.map((employee: any) => {
        const firstName = employee?.employeePersonalDetails?.employeeFirstname || employee.employeeFirstName || '';
        const lastName = employee?.employeePersonalDetails?.employeeLastname || employee.employeeLastName || '';
        const displayName = `${firstName} ${lastName}`.trim();
        const employeeId = employee.employeeId || employee.id;
        
        return {
          label: `${displayName} (${employeeId})`,
          value: employeeId,
          employeeData: employee
        };
      });
      setAvailableEmployees(employeeOptions);
      console.log('👥 Employees loaded from API:', employeeOptions);
    }
  }, [employeesData]);

  // Calculate discount and payment after discount when coupon changes
  useMemo(() => {
    const totalDuePayment = paymentDetails?.totalDuePayment || 0;
    
    if (selectedCoupon && totalDuePayment > 0) {
      let calculatedDiscount = 0;
      
      if (selectedCoupon.couponType === 'flat') {
        calculatedDiscount = parseFloat(selectedCoupon.discountValue) || 0;
      } else if (selectedCoupon.couponType === 'percentage') {
        const percentageValue = parseFloat(selectedCoupon.discountValue) || 0;
        calculatedDiscount = (totalDuePayment * percentageValue) / 100;
      }
      
      const calculatedPaymentAfterDiscount = Math.max(0, totalDuePayment - calculatedDiscount);
      
      setDiscountAmount(Math.round(calculatedDiscount));
      setPaymentAfterDiscount(Math.round(calculatedPaymentAfterDiscount));
      
      console.log('Coupon calculation based on total due payment:', {
        totalDuePayment,
        selectedCoupon,
        calculatedDiscount,
        calculatedPaymentAfterDiscount
      });
    } else {
      setDiscountAmount(0);
      setPaymentAfterDiscount(totalDuePayment);
    }
  }, [selectedCoupon, paymentDetails?.totalDuePayment]);

  // Check if we're returning from AddCouponScreen with new coupon data
  useMemo(() => {
    if (route.params?.newCoupon) {
      const newCoupon = route.params.newCoupon;
      
      // Add the new coupon to the available coupons list
      const couponOption: CouponOption = {
        label: `${newCoupon.couponName} - ${newCoupon.couponType === 'flat' ? '₹' : ''}${newCoupon.couponType === 'percentage' ? '%' : ''}${newCoupon.discountValue}`,
        value: newCoupon.couponId || newCoupon.couponName.toLowerCase().replace(/\s+/g, ''),
        couponData: newCoupon
      };
      
      setAvailableCoupons((prev: CouponOption[]) => [...prev.slice(1), couponOption]); // Keep "Select coupon" as first option
      
      // Set the newly created coupon as selected
      setSelectedCoupon(newCoupon);
      
      // Clear the route params
      navigation.setParams({ newCoupon: undefined });
      
      // Refetch coupons to get updated list
      refetchCoupons();
    }
  }, [route.params?.newCoupon]);

  const handleCouponSelection = (selectedValue: string) => {
    console.log('Coupon selected:', selectedValue);
    if (selectedValue) {
      // Find the selected coupon object
      const coupon = availableCoupons.find((opt: CouponOption) => opt.value === selectedValue);
      if (coupon && coupon.value !== '') {
        // Use real coupon data from API
        const couponData = {
          couponName: coupon.couponData?.couponName || coupon.label.split(' - ')[0],
          couponType: coupon.couponData?.couponType?.toLowerCase() || (coupon.label.includes('₹') ? 'flat' : 'percentage'),
          discountValue: coupon.couponData?.couponValue || parseInt(coupon.label.match(/\d+/)?.[0] || '0'),
          couponId: coupon.couponData?.couponId
        };
        setSelectedCoupon(couponData);
        console.log('Coupon data set:', couponData);
      } else {
        setSelectedCoupon(null);
      }
    } else {
      setSelectedCoupon(null);
    }
  };

  const handleAddCoupon = () => {
    (navigation as any).navigate('AddCoupon', { returnScreen: 'UpdatePayment' });
  };

  // Initialize dynamic installments from existing due installments
  useMemo(() => {
    const dueInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'due');
    const mappedInstallments = dueInstallments.map((inst: any) => ({
      ...inst,
      isDynamic: false // Mark existing installments as non-dynamic
    }));
    
    setDynamicInstallments(mappedInstallments);
    setNextInstallmentNumber(dueInstallments.length + 1);
    
    // Set initial form values for existing installments
    mappedInstallments.forEach((inst: any) => {
      // Set amount
      const amountFieldName = `installmentAmount${inst.installmentId}`;
      installmentHandler.setValue(amountFieldName, inst.duePayment?.toString() || "0");
      
      // Set date - parse the date and set it
      const dateFieldName = `installmentDate${inst.installmentId}`;
      if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
        let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
        
        // Convert various date formats to Date object
        if (dateValue) {
          try {
            let parsedDate = new Date();
            
            // Check if it's already a valid Date string (ISO format YYYY-MM-DD)
            if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
              parsedDate = new Date(dateValue);
            }
            // Check if it's DD-MM-YYYY format
            else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
              const parts = dateValue.split('-');
              // If first part is 2 digits, it's DD-MM-YYYY
              if (parts[0].length === 2) {
                const [day, month, year] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              } else {
                // Otherwise it might be YYYY-MM-DD
                parsedDate = new Date(dateValue);
              }
            }
            // Check if it's DD/MM/YYYY format
            else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
              const parts = dateValue.split('/');
              if (parts[0].length === 2) {
                const [day, month, year] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              } else {
                const [year, month, day] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              }
            }
            // Try standard Date parsing
            else {
              parsedDate = new Date(dateValue);
            }
            
            if (!isNaN(parsedDate.getTime())) {
              dateHandler.setValue(dateFieldName, parsedDate);
              console.log(`✅ Set date for ${dateFieldName}:`, parsedDate);
            } else {
              console.log(`❌ Invalid date for ${dateFieldName}:`, dateValue);
            }
          } catch (error) {
            console.log('Date parsing error in initialization:', error, dateValue);
          }
        }
      }
    });
    
    console.log('Initialized dynamic installments:', {
      dueInstallments: mappedInstallments.length,
      mappedInstallments
    });
  }, [installmentDetails]);

  // Sync form values when dynamicInstallments change
  useEffect(() => {
    dynamicInstallments.forEach((inst: any) => {
      // Sync amount
      const amountFieldName = `installmentAmount${inst.installmentId}`;
      const currentAmount = installmentHandler.getValues(amountFieldName);
      const expectedAmount = inst.duePayment?.toString() || "0";
      if (currentAmount !== expectedAmount) {
        installmentHandler.setValue(amountFieldName, expectedAmount, { shouldValidate: false });
      }
      
      // Sync date
      const dateFieldName = `installmentDate${inst.installmentId}`;
      if (inst.nextpaymentDate || inst.formatedNextpaymentDate) {
        let dateValue = inst.formatedNextpaymentDate || inst.nextpaymentDate;
        if (dateValue) {
          try {
            let parsedDate = new Date();
            if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
              parsedDate = new Date(dateValue);
            } else if (dateValue.includes('-') && dateValue.split('-').length === 3) {
              const parts = dateValue.split('-');
              if (parts[0].length === 2) {
                const [day, month, year] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              } else {
                parsedDate = new Date(dateValue);
              }
            } else if (dateValue.includes('/') && dateValue.split('/').length === 3) {
              const parts = dateValue.split('/');
              if (parts[0].length === 2) {
                const [day, month, year] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              } else {
                const [year, month, day] = parts;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              }
            } else {
              parsedDate = new Date(dateValue);
            }
            
            if (!isNaN(parsedDate.getTime())) {
              const currentDate = dateHandler.getValues(dateFieldName);
              if (!currentDate || currentDate.getTime() !== parsedDate.getTime()) {
                dateHandler.setValue(dateFieldName, parsedDate, { shouldValidate: false });
              }
            }
          } catch (error) {
            console.log('Date sync error:', error);
          }
        }
      }
    });
  }, [dynamicInstallments]);


  // Get total due amount including paid installments and coupon discount (PaymentDetailsScreen style)
  const getTotalDueAmount = () => {
    const paidInstallments = installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid');
    const totalPaidAmount = paidInstallments.reduce((sum: number, inst: any) => sum + (inst.receivedPayment || inst.duePayment || 0), 0);
    
    // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
    const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
    
    // Total due amount = Base amount (after coupon) - Total paid amount
    const totalDueAmount = Math.max(0, baseAmount - totalPaidAmount);
    
    console.log('Total due calculation with coupon (PaymentDetailsScreen style):', {
      totalDuePayment: paymentDetails?.totalDuePayment,
      paymentAfterDiscount,
      selectedCoupon: selectedCoupon?.couponName,
      discountAmount,
      baseAmount,
      totalPaidAmount,
      totalDueAmount,
      paidInstallments: paidInstallments.length
    });
    
    return totalDueAmount;
  };

  // Add new installment
  const handleAddInstallment = () => {
    const newInstallment = {
      installmentId: `dynamic-${Date.now()}`,
      installmentNumber: nextInstallmentNumber,
      paymentStatus: 'due',
      duePayment: 0, // Will be calculated automatically
      nextpaymentDate: new Date().toLocaleDateString("en-GB"),
      paymentNotes: '',
      isDynamic: true
    };
    
    // Add new installment to the list
    const updatedInstallments = [...dynamicInstallments, newInstallment];
    setDynamicInstallments(updatedInstallments);
    setNextInstallmentNumber(prev => prev + 1);
    
    // Recalculate all amounts after adding new installment (PaymentDetailsScreen style)
    setTimeout(() => {
      // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
      const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
      const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, updatedInstallments.length);
      
      const finalInstallments = updatedInstallments.map((inst, index) => ({
        ...inst,
        duePayment: installmentAmounts[index] || inst.duePayment
      }));
      
      setDynamicInstallments(finalInstallments);
      
      // Update form values for all installments
      finalInstallments.forEach((inst) => {
        const fieldName = `installmentAmount${inst.installmentId}`;
        installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
      });
      
      console.log('Added new installment and recalculated (PaymentDetailsScreen style):', {
        newInstallment,
        baseAmount,
        equalAmount,
        remainder,
        installmentAmounts,
        totalInstallments: updatedInstallments.length,
        selectedCoupon: selectedCoupon?.couponName,
        paymentAfterDiscount,
        finalInstallments
      });
    }, 0);
  };

  // Remove installment
  const handleRemoveInstallment = (installmentId: string) => {
    // Prevent removing if only one installment remains
    if (dynamicInstallments.length <= 1) {
      Alert.alert(
        "Cannot Remove",
        "At least one installment must remain.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Remove installment from the list
    const remainingInstallments = dynamicInstallments.filter(inst => inst.installmentId !== installmentId);
    setDynamicInstallments(remainingInstallments);
    
    // Clear form value for removed installment
    installmentHandler.unregister(`installmentAmount${installmentId}`);
    
    // Recalculate all amounts after removing installment (PaymentDetailsScreen style)
    setTimeout(() => {
      // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
      const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
      const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, remainingInstallments.length);
      
      const updatedInstallments = remainingInstallments.map((inst, index) => ({
        ...inst,
        duePayment: installmentAmounts[index] || inst.duePayment
      }));
      
      setDynamicInstallments(updatedInstallments);
      
      // Update form values for all remaining installments
      updatedInstallments.forEach((inst) => {
        const fieldName = `installmentAmount${inst.installmentId}`;
        installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
      });
      
      console.log('Removed installment and recalculated (PaymentDetailsScreen style):', {
        removedInstallmentId: installmentId,
        baseAmount,
        equalAmount,
        remainder,
        installmentAmounts,
        remainingInstallments: updatedInstallments.length,
        selectedCoupon: selectedCoupon?.couponName,
        paymentAfterDiscount,
        updatedInstallments
      });
    }, 0);
  };

  // Update installment amount
  const handleUpdateInstallmentAmount = (installmentId: string, newAmount: number) => {
    setDynamicInstallments(prev => prev.map(inst => 
      inst.installmentId === installmentId 
        ? { ...inst, duePayment: newAmount }
        : inst
    ));
  };

  // Validate total amount
  const validateTotalAmount = () => {
    const totalCalculated = dynamicInstallments.reduce((sum, inst) => sum + (inst.duePayment || 0), 0);
    const expectedTotal = paymentAfterDiscount;
    const difference = Math.abs(totalCalculated - expectedTotal);
    
    console.log('Amount validation:', {
      totalCalculated,
      expectedTotal,
      difference,
      isValid: difference <= 1 // Allow 1 rupee difference due to rounding
    });
    
    return difference <= 1;
  };

  // Helper function to calculate and distribute installment amounts evenly (same as PaymentDetailsScreen)
  const calculateAndDistributeInstallments = (baseAmount: number, numberOfInstallments: number) => {
    const equalAmount = Math.floor(baseAmount / numberOfInstallments);
    const remainder = baseAmount % numberOfInstallments;
    
    const installmentAmounts: number[] = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      const installmentAmount = equalAmount + (i <= remainder ? 1 : 0);
      installmentAmounts.push(installmentAmount);
    }
    
    return {
      equalAmount,
      remainder,
      installmentAmounts
    };
  };

  // Function to recalculate all installment amounts
  const recalculateInstallmentAmounts = () => {
    if (dynamicInstallments.length > 0) {
      // If coupon is applied, always recalculate amounts based on paymentAfterDiscount
      // If no coupon and no dynamic installments, keep original amounts
      const hasDynamic = dynamicInstallments.some((inst: any) => inst.isDynamic);
      const hasCoupon = !!selectedCoupon;
      
      if (!hasDynamic && !hasCoupon) {
        // No coupon and no new installments - keep original amounts
        return dynamicInstallments;
      }

      // Use paymentAfterDiscount as base amount when coupon is applied
      // Otherwise use totalDuePayment
      const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
      const { equalAmount, remainder, installmentAmounts } = calculateAndDistributeInstallments(baseAmount, dynamicInstallments.length);
      
      const updatedInstallments = dynamicInstallments.map((inst, index) => ({
        ...inst,
        duePayment: installmentAmounts[index] || inst.duePayment
      }));
      
      setDynamicInstallments(updatedInstallments);
      
      // Update form values for the new amounts
      updatedInstallments.forEach((inst) => {
        const fieldName = `installmentAmount${inst.installmentId}`;
        installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
      });
      
      console.log('Recalculated amounts (PaymentDetailsScreen style):', {
        baseAmount,
        numberOfInstallments: dynamicInstallments.length,
        equalAmount,
        remainder,
        installmentAmounts,
        selectedCoupon: selectedCoupon?.couponName,
        discountAmount,
        paymentAfterDiscount,
        hasCoupon,
        hasDynamic,
        updatedInstallments
      });
      
      return updatedInstallments;
    }
    return dynamicInstallments;
  };

  // Recalculate all amounts when payment after discount or coupon changes
  useMemo(() => {
    recalculateInstallmentAmounts();
  }, [paymentAfterDiscount, installmentDetails, selectedCoupon, discountAmount]); // Add coupon dependencies


  // Monitor dynamicInstallments changes for debugging
  useEffect(() => {
    console.log('Dynamic installments updated:', dynamicInstallments);
  }, [dynamicInstallments]);

  // Trigger recalculation when installment count changes
  useEffect(() => {
    if (dynamicInstallments.length > 0) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        recalculateInstallmentAmounts();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [dynamicInstallments.length]);

  const handleEditInstallment = (installment: any) => {
    setSelectedInstallment(installment);
    setPaymentStatus(installment.paymentStatus || "paid");
    setPaymentMode(installment.paymentMode || "");
    setPaymentReceiverId(installment.paymentRecieverId || installment.paymentReceiverId || "");
    setTransactionId(installment.transactionId || "");
    
    // Safely parse the payment date
    let initialDate = new Date();
    try {
      if (installment.paymentReceiveDate) {
        // Handle different date formats
        if (installment.paymentReceiveDate.includes('-')) {
          const [day, month, year] = installment.paymentReceiveDate.split('-');
          initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (installment.paymentReceiveDate.includes('/')) {
          const [day, month, year] = installment.paymentReceiveDate.split('/');
          initialDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          initialDate = new Date(installment.paymentReceiveDate);
        }
        
        // Validate the date
        if (isNaN(initialDate.getTime())) {
          initialDate = new Date();
        }
      }
    } catch (error) {
      console.log('Date parsing error in handleEditInstallment:', error);
      initialDate = new Date();
    }
    
    setPaymentDate(initialDate);
    setModalVisible(true);
  };

  const handleSavePayment = async () => {
    if (!selectedInstallment || !authUser || !selectedOrganization) {
      Alert.alert("Error", "Required data is missing");
      return;
    }

    setIsUpdating(true);
    
    try {
      const payload = {
        user: {
          userCustomerId: authUser.customerId,
          userCustomerName: authUser.customerName,
          userCustomerEmail: authUser.customerEmail,
          roleName: selectedOrganization.role?.roleName || authUser.userType,
          roleId: selectedOrganization.role?.roleId || authUser.employeeId,
          userEmployeeId: authUser.employeeId
        },
        customerId: selectedOrganization.customerId,
        organizationId: selectedOrganization.organizationId,
        rollNo: studentRollNo,
        courseId: course.courseId,
        updatedPaymentStatus: paymentStatus,
        updatedDate: paymentDate.toLocaleDateString("en-GB").split("/").reverse().join("-"),
        installmentNumber: selectedInstallment.installmentNumber,
        ...(paymentMode && { paymentMode: paymentMode }),
        ...(paymentMode === "cash" && paymentReceiverId && { paymentRecieverId: paymentReceiverId }),
        ...(paymentMode === "online" && transactionId && { transactionId })
      };

      console.log("Updating payment status with payload:", payload);

      const response = await request({
        method: "POST",
        url: "/student-fnp-prod/updateStudentPaymentStatus",
        data: payload
      });

      console.log("Payment status update response:", response);

      if (response.statusCode === 200) {
        // Invalidate queries to refresh all related data
        console.log("🔄 Invalidating queries after payment status update");
        
        // Invalidate student details query
        queryClient.invalidateQueries({
          queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
        });
        
        // Invalidate course details query (in case it includes payment info)
        queryClient.invalidateQueries({
          queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
        });
        
        // Also invalidate student list queries that might show payment status
        queryClient.invalidateQueries({
          queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
        });
        
        // Refetch student data to ensure immediate update
        await refetchStudentData();
        
        Alert.alert("Success", "Payment status updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              setSelectedInstallment(null);
            }
          }
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Alert.alert("Error", "Failed to update payment status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedInstallment(null);
    setPaymentMode("");
    setPaymentReceiverId("");
    setTransactionId("");
  };

  const handleDownloadInvoice = async (installmentId: string) => {
    try {
      setIsInvoiceLoading(true);
      setInvoicePdf(null);

      // Find the installment details
      const installment = installmentDetails.find(
        (inst: any) => inst.installmentId === installmentId
      );

      if (!installment) {
        Alert.alert("Error", "Installment not found");
        return;
      }

      const studentDetails = studentData?.data;

      if (!studentDetails || !selectedOrganization) {
        Alert.alert("Error", "Student or organization details not found");
        return;
      }

      const payload = {
        customerId: selectedOrganization.customerId,
        organizationId: selectedOrganization.organizationId,
        action: "student",
        student: {
          rollNo: studentRollNo,
          enrollmentNo: studentDetails.studentEnrollmentNumber || "",
          courseId: course.courseId,
          installmentId,
        },
      };

      console.log("Downloading invoice with payload:", JSON.stringify(payload, null, 2));

      const response = await request({
        method: "POST",
        url: apiUrls.reports.DOWNLOAD_COMMON_REPORT,
        data: payload,
      });

      if (response.statusCode !== 200 || !response.data) {
        console.error("Failed to download invoice:", response);
        Alert.alert(
          "Error",
          response.message || "Failed to download invoice. Please try again."
        );
        return;
      }

      const base64Pdf: string = response.data;
      setInvoicePdf(base64Pdf);
      setInvoiceModalVisible(true);

      // Try to save a copy into the device Downloads folder on Android
      if (Platform.OS === "android") {
        try {
          const downloadDir =
            RNBlobUtil.fs.dirs.DownloadDir || RNFS.DocumentDirectoryPath;
          const downloadPath = `${downloadDir}/invoice_${studentRollNo}_${installmentId}.pdf`;

          // Write file using react-native-blob-util (better integration with Android's storage)
          await RNBlobUtil.fs.writeFile(downloadPath, base64Pdf, "base64");

          // Register with Android Download Manager so it shows under "Downloads"
          if (RNBlobUtil.android && RNBlobUtil.android.addCompleteDownload) {
            RNBlobUtil.android.addCompleteDownload({
              title: `invoice_${studentRollNo}_${installmentId}.pdf`,
              description: "Invoice receipt",
              mime: "application/pdf",
              path: `file://${downloadPath}`,
              showNotification: true,
            });
          }

          // Let media scanner see the file
          await RNBlobUtil.fs.scanFile([
            {
              path: downloadPath,
              mime: "application/pdf",
            },
          ]);

          ToastAndroid.show(
            "Invoice saved to Downloads folder",
            ToastAndroid.SHORT
          );
        } catch (saveError) {
          console.error("Error saving invoice to Downloads:", saveError);
          ToastAndroid.show(
            "Failed to save invoice in Downloads",
            ToastAndroid.SHORT
          );
        }
      }
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to download invoice. Please try again."
      );
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const handleViewInvoice = async (installmentId: string) => {
    try {
      console.log("📧 === SENDING INVOICE EMAIL ===");
      console.log("Installment ID:", installmentId);

      // Find the installment details
      const installment = installmentDetails.find((inst: any) => inst.installmentId === installmentId);
      if (!installment) {
        Alert.alert("Error", "Installment not found");
        return;
      }

      // Get student data
      const studentDetails = studentData?.data;
      if (!studentDetails) {
        Alert.alert("Error", "Student details not found");
        return;
      }

      // Get course data
      if (!courseData) {
        Alert.alert("Error", "Course details not found");
        return;
      }

      // Get organization and GST data
      const gstRuleData = organization?.gstRuleData;
      // Normalize inclusionType: backend expects "Incl" | "Excl" | "NoGST"
      // Frontend might have "included" | "excluded" | "noGST" (lowercase)
      const rawInclusionType: string = String(gstRuleData?.inclusionType || "noGST");
      let gstInclusionType: string = "NoGST";
      const normalizedType = rawInclusionType.toLowerCase();
      if (normalizedType === "included" || rawInclusionType === "Incl") {
        gstInclusionType = "Incl";
      } else if (normalizedType === "excluded" || rawInclusionType === "Excl") {
        gstInclusionType = "Excl";
      }
      
      const cgstPercentage = gstRuleData?.cgstPercentage || 0;
      const sgstPercentage = gstRuleData?.sgstPercentage || 0;
      const gstinNumber = gstRuleData?.gstinNumber || '';

      // Calculate amounts
      const paidAmount = installment.receivedPayment || installment.duePayment || 0;
      const courseFee = paymentDetails?.totalPayment || courseData?.data?.courseFee || courseData?.courseFee || 0;
      const totalReceivedAmount = paymentDetails?.totalReceivedPayment || 0;
      const totalDueAmount = paymentDetails?.totalDuePayment || 0;
      const discountAmount = paymentDetails?.discountedPaymentAmount || 0;
      const amountAfterDiscount = courseFee - discountAmount;
      
      // Calculate previous discount amount (total discount applied before this installment)
      const previousDiscountAmount = paymentDetails?.previousDiscountAmount || 0;
      
      console.log("💰 Amount Calculation Debug:", {
        paidAmount,
        courseFee,
        totalReceivedAmount,
        totalDueAmount,
        discountAmount,
        previousDiscountAmount,
      });

      // Calculate GST amounts based on inclusion type (match web logic exactly)
      let cgstAmount = 0;
      let sgstAmount = 0;
      let tuitionFee = paidAmount;

      console.log("📊 GST Calculation Debug:", {
        gstInclusionType,
        rawInclusionType: gstRuleData?.inclusionType,
        cgstPercentage,
        sgstPercentage,
        paidAmount,
      });

      if (gstInclusionType === "Incl" && (cgstPercentage > 0 || sgstPercentage > 0)) {
        // Match web: when GST is "included" in the final amount,
        // CGST/SGST = paidAmount * percentage / 100
        // tuitionFee = paidAmount - (CGST + SGST)
        cgstAmount = Math.round((paidAmount * cgstPercentage) / 100);
        sgstAmount = Math.round((paidAmount * sgstPercentage) / 100);
        tuitionFee = paidAmount - (cgstAmount + sgstAmount);
        console.log("✅ GST Included calculation:", { cgstAmount, sgstAmount, tuitionFee });
      } else if (gstInclusionType === "Excl" && (cgstPercentage > 0 || sgstPercentage > 0)) {
        // GST is added on top of tuition fee
        cgstAmount = Math.round((paidAmount * cgstPercentage) / 100);
        sgstAmount = Math.round((paidAmount * sgstPercentage) / 100);
        tuitionFee = paidAmount;
        console.log("✅ GST Excluded calculation:", { cgstAmount, sgstAmount, tuitionFee });
      } else {
        console.log("⚠️ No GST calculation (NoGST or zero percentages)");
      }
      // For "NoGST", keep defaults (all zero, tuitionFee = paidAmount)

      // Calculate previous received amount (sum of all installments paid BEFORE this one)
      // Match web: previousFeeSlipReceivedAmount = sum of all previous installments' receivedPayment
      let previousReceivedAmount = 0;
      const currentInstallmentIndex = installmentDetails.findIndex(
        (inst: any) => inst.installmentId === installmentId
      );
      
      if (currentInstallmentIndex > 0) {
        // Sum all installments before current one
        for (let i = 0; i < currentInstallmentIndex; i++) {
          const prevInst = installmentDetails[i];
          if (prevInst.paymentStatus?.toLowerCase() === 'paid') {
            previousReceivedAmount += prevInst.receivedPayment || prevInst.duePayment || 0;
          }
        }
      } else {
        // If this is the first installment, previousReceivedAmount = totalReceivedAmount - paidAmount
        previousReceivedAmount = Math.max(totalReceivedAmount - paidAmount, 0);
      }
      
      // Calculate Net Amount Due = Course Fee - Previous Payments - Previous Discount
      const netAmountDue = Math.max(courseFee - previousReceivedAmount - previousDiscountAmount, 0);
      
      // Calculate Final Amount Due = Net Amount Due - Current Discount
      const finalAmountDue = Math.max(netAmountDue - discountAmount, 0);
      
      const remainingDueAmount = totalDueAmount;
      
      console.log("📊 Previous Amount Calculation:", {
        currentInstallmentIndex,
        previousReceivedAmount,
        netAmountDue,
        finalAmountDue,
        totalReceivedAmount,
        paidAmount,
      });

      // Convert amount to words (simple implementation)
      const amountToWords = (amount: number) => {
        if (amount === 0) return 'Zero';
        if (amount === 1000) return 'Rupees One Thousand only';
        if (amount === 10000) return 'Rupees Ten Thousand only';
        if (amount === 15000) return 'Rupees Fifteen Thousand only';
        if (amount === 20000) return 'Rupees Twenty Thousand only';
        if (amount === 50000) return 'Rupees Fifty Thousand only';
        if (amount === 75000) return 'Rupees Seventy Five Thousand only';
        if (amount === 99000) return 'Rupees Ninety Nine Thousand only';
        return `Rupees ${amount.toLocaleString('en-IN')} only`;
      };

      // Format date (match web format: DD-MM-YYYY)
      const formatDateForInvoice = (dateValue: any) => {
        if (!dateValue) {
          const today = new Date();
          const day = today.getDate().toString().padStart(2, '0');
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const year = today.getFullYear();
          return `${day}-${month}-${year}`;
        }
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            // Invalid date, use today
            const today = new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear();
            return `${day}-${month}-${year}`;
          }
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } catch (error) {
          const today = new Date();
          const day = today.getDate().toString().padStart(2, '0');
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const year = today.getFullYear();
          return `${day}-${month}-${year}`;
        }
      };

      // Generate receipt number (backend will use this or generate its own)
      // For now, use a consistent format based on timestamp
      const receiptNo = Math.floor(Date.now() / 1000) % 100000;

      // Build invoice payload
      const invoicePayload: {
        action: "studentFeeSlip";
        studentFeeSlip: {
          studentFeeSlipCustomerId: string;
          studentFeeSlipOrganiationId: string;
          studentFeeSlipOrganizationName: string;
          studentFeeSlipOrganizationLogo: string;
          studentFeeSlipEnrollmentNo: string;
          studentFeeSlipRollNo: string;
          studentFeeSlipStudentEmail: string;
          studentFeeSlipOrganizationEmail: string;
          studentFeeSlipOrganizationAddress: string;
          studentFeeSlipOrganizationPhoneNumber: string;
          studentFeeSlipReceiptNo: number;
          studentFeeSlipStudentName: string;
          studentFeeSlipCourseName: string;
          studentFeeSlipCourseId: string;
          studentFeeSlipInstallmentId: string;
          studentFeeSlipPaymentMode: string;
          studentFeeSlipTransactionId: string;
          studentFeeSlipPaymentRecieverId: string;
          studentFeeSlipAmountInWords: string;
          studentFeeSlipPurpose: string;
          studentFeeSlipDate: string;
          studentFeeSlipGSTIN: string;
          studentFeeSlipStudentPhoneNumber: string;
          studentFeeSlipWebsiteUrl: string;
          studentFeeSlipStudentAddress: string;
          studentFeeSlipSGSTPercentage: number;
          studentFeeSlipCGSTPercentage: number;
          studentFeeSlipSGSTAmount: number;
          studentFeeSlipCGSTAmount: number;
          studentFeeSlipGrandTotal: number;
          studentFeeSlipCourseFee: number;
          previousFeeSlipReceivedAmount: number;
          totalRemainingDueAmount: number;
          studentFeeSlipDiscountAmount: number;
          studentFeeSlipAmountAfterDiscount: number;
          studentFeeSlipPaidAmount: number;
          receivedPaymentCGSTAmount: number;
          receivedPaymentSGSTAmount: number;
          studentFeeSlipTutionFee: number;
          studentFeeSlipDueAmount: number;
          previousDiscountAmount: number;
          inclusionType: string;
        };
      } = {
        action: "studentFeeSlip",
        studentFeeSlip: {
          studentFeeSlipCustomerId: studentDetails.customerId || authUser?.customerId || '',
          studentFeeSlipOrganiationId: selectedOrganization?.organizationId || '',
          studentFeeSlipOrganizationName: organization?.organizationName || selectedOrganization?.organizationName || '',
          studentFeeSlipOrganizationLogo: organization?.organizationLogo || '',
          studentFeeSlipEnrollmentNo: studentDetails.studentEnrollmentNumber || '',
          studentFeeSlipRollNo: studentRollNo || '',
          studentFeeSlipStudentEmail: studentDetails.studentEmail || '',
          studentFeeSlipOrganizationEmail: organization?.organizationEmail || '',
          studentFeeSlipOrganizationAddress: organization?.organizationAddress || '',
          studentFeeSlipOrganizationPhoneNumber: organization?.organizationPhoneNumber || '',
          studentFeeSlipReceiptNo: receiptNo,
          studentFeeSlipStudentName: `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim(),
          studentFeeSlipCourseName: courseData?.data?.courseName || courseData?.courseName || course.courseName || '',
          studentFeeSlipCourseId: course.courseId || '',
          studentFeeSlipInstallmentId: installmentId,
          studentFeeSlipPaymentMode: installment.paymentMode || '',
          studentFeeSlipTransactionId: installment.transactionId || '-',
          studentFeeSlipPaymentRecieverId: installment.paymentRecieverId || '',
          studentFeeSlipAmountInWords: amountToWords(paidAmount),
          studentFeeSlipPurpose: "mail",
          studentFeeSlipDate: formatDateForInvoice(installment.paymentReceiveDate || installment.paidDate || new Date()),
          studentFeeSlipGSTIN: gstinNumber,
          studentFeeSlipStudentPhoneNumber: studentDetails.studentContact || '',
          studentFeeSlipWebsiteUrl: organization?.organizationWebsiteUrl || '',
          studentFeeSlipStudentAddress: studentDetails.studentAddress || '',
          studentFeeSlipSGSTPercentage: sgstPercentage,
          studentFeeSlipCGSTPercentage: cgstPercentage,
          studentFeeSlipSGSTAmount: sgstAmount,
          studentFeeSlipCGSTAmount: cgstAmount,
          // Grand total is the amount paid for this receipt
          studentFeeSlipGrandTotal: paidAmount,
          studentFeeSlipCourseFee: courseFee,
          previousFeeSlipReceivedAmount: previousReceivedAmount,
          totalRemainingDueAmount: remainingDueAmount,
          studentFeeSlipDiscountAmount: discountAmount,
          studentFeeSlipAmountAfterDiscount: amountAfterDiscount,
          studentFeeSlipPaidAmount: paidAmount,
          receivedPaymentCGSTAmount: cgstAmount,
          receivedPaymentSGSTAmount: sgstAmount,
          studentFeeSlipTutionFee: tuitionFee,
          studentFeeSlipDueAmount: totalDueAmount,
          previousDiscountAmount: previousDiscountAmount,
          inclusionType: gstInclusionType
        }
      };

      console.log('📧 Invoice Payload:', JSON.stringify(invoicePayload, null, 2));
      console.log('🔍 Key Invoice Values:', {
        paidAmount,
        courseFee,
        tuitionFee,
        cgstAmount,
        sgstAmount,
        totalGST: cgstAmount + sgstAmount,
        grandTotal: paidAmount,
        previousReceivedAmount,
        previousDiscountAmount,
        netAmountDue,
        finalAmountDue,
        discountAmount,
        totalDueAmount,
        remainingDueAmount,
        paymentMode: installment.paymentMode,
        inclusionType: gstInclusionType,
        receiptNo,
        invoiceDate: invoicePayload.studentFeeSlip.studentFeeSlipDate,
      });

      // Call the API
      const response = await sendInvoiceEmail(invoicePayload);

      if (response && response.statusCode === 200) {
        ToastAndroid.show("Invoice sent successfully via email", ToastAndroid.SHORT);
        console.log('✅ Invoice email sent successfully:', response);
      } else {
        throw new Error(response?.message || 'Failed to send invoice email');
      }
    } catch (error: any) {
      console.error('❌ Invoice email error:', error);
      Alert.alert('Error', error.message || 'Failed to send invoice email. Please try again.');
    }
  };

  const handleReminderMenu = (installmentId: string) => {
    setShowReminderMenu(showReminderMenu === installmentId ? null : installmentId);
  };

  const handleEmailReminder = async (
    installment: any,
    studentDetails: any,
    courseName: string,
    formattedDueDate: string,
    installmentAmount: number
  ) => {
    try {
      // Validate required data
      if (!authUser || !selectedOrganization || !organization) {
        Alert.alert("Error", "Required data is missing");
        return;
      }

      // Get student email
      const studentEmail = studentDetails.studentEmail || '';
      if (!studentEmail) {
        Alert.alert("Error", "Student email not found");
        return;
      }

      // Get student name
      const studentName = `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim();
      if (!studentName) {
        Alert.alert("Error", "Student name is missing");
        return;
      }

      // Get organization details
      const organizationName = organization.organizationName || '';
      const organizationEmail = organization.organizationEmail || '';
      const organizationLogo = organization.organizationLogo || '';
      const organizationPhoneNumber = organization.organizationPhoneNumber || '';

      // Get student ID
      const studentId = studentDetails.studentId || studentDetails.studentEnrollmentNumber || '';

      // Build email reminder payload
      const emailPayload = {
        studentName: studentName,
        courseName: courseName,
        studentEmail: studentEmail,
        installmentsArray: [
          {
            overDueDate: formattedDueDate !== 'N/A' ? formattedDueDate : '',
            overDueAmount: installmentAmount,
            index: installment.installmentId || '',
            courseId: course.courseId || '',
          },
        ],
        organizationName: organizationName,
        organizationEmail: organizationEmail,
        organizationLogo: organizationLogo,
        organizationPhoneNumber: organizationPhoneNumber,
        customerId: authUser.customerId || studentDetails.customerId || '',
        studentId: studentId,
        accountId: '', // Empty as per payload example
        organizationId: selectedOrganization.organizationId || '',
      };

      console.log('📧 Sending email reminder payload:', JSON.stringify(emailPayload, null, 2));
      console.log('📧 API URL:', apiUrls.emailServiceUrl.NOTIFY_UPCOMING_FEE_NOTIFICATION);

      // Call email API
      const response = await sendEmailReminder(emailPayload);

      console.log('✅ Email reminder API response:', JSON.stringify(response, null, 2));

      // Check response
      if (response?.data) {
        const accepted = response.data.accepted || [];
        const rejected = response.data.rejected || [];

        if (accepted.length > 0) {
          Alert.alert(
            "Success",
            `Email reminder sent successfully to ${accepted.join(', ')}`,
            [{ text: "OK" }]
          );
        } else if (rejected.length > 0) {
          Alert.alert(
            "Error",
            `Failed to send email to ${rejected.join(', ')}`
          );
        } else {
          Alert.alert(
            "Success",
            "Email reminder sent successfully",
            [{ text: "OK" }]
          );
        }
      } else if (response?.statusCode === 200) {
        Alert.alert(
          "Success",
          "Email reminder sent successfully",
          [{ text: "OK" }]
        );
      } else {
        throw new Error(response?.message || 'Failed to send email reminder');
      }
    } catch (error: any) {
      console.error('❌ Email reminder error:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.data?.message
        || error?.message 
        || 'Failed to send email reminder. Please try again.';
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleReminderAction = async (action: string, installmentId: string) => {
    try {
      setShowReminderMenu(null);
      
      // Show loading indicator
      if (isSendingReminder) {
        return; // Prevent multiple simultaneous calls
      }
      
      // Find the installment details
      const installment = installmentDetails.find((inst: any) => inst.installmentId === installmentId);
      if (!installment) {
        Alert.alert("Error", "Installment not found");
        return;
      }

      // Get student data
      const studentDetails = studentData?.data;
      if (!studentDetails) {
        Alert.alert("Error", "Student details not found");
        return;
      }

      // Get course data
      if (!courseData) {
        Alert.alert("Error", "Course details not found");
        return;
      }

      // Log course data structure for debugging
      console.log('📚 Course data structure:', {
        courseDataExists: !!courseData,
        courseDataKeys: courseData ? Object.keys(courseData) : [],
        courseDataData: courseData?.data ? Object.keys(courseData.data) : [],
        courseDataStatusCode: courseData?.statusCode,
        courseDataDataCourseName: courseData?.data?.courseName,
        courseDataCourseName: courseData?.courseName,
        courseCourseName: course?.courseName,
      });

      // Validate required data
      if (!authUser || !selectedOrganization) {
        Alert.alert("Error", "Required data is missing");
        return;
      }

      // Get student phone number (required for WhatsApp/SMS, not for Email)
      const studentPhone = studentDetails.studentContact || studentDetails.studentMobileNumber || '';
      
      // Get student email (required for Email reminder)
      const studentEmail = studentDetails.studentEmail || '';
      
      // Validate based on action type
      if (action.toLowerCase() !== 'email' && !studentPhone) {
        Alert.alert("Error", "Student phone number not found");
        return;
      }
      
      if (action.toLowerCase() === 'email' && !studentEmail) {
        Alert.alert("Error", "Student email not found");
        return;
      }

      // Format due date - ensure DD-MM-YYYY format
      const dueDate = installment.nextpaymentDate || installment.formatedNextpaymentDate || '';
      let formattedDueDate = 'N/A';
      
      if (dueDate) {
        // formatDate returns DD/MM/YYYY, convert to DD-MM-YYYY for API
        const formatted = formatDate(dueDate);
        formattedDueDate = formatted.replace(/\//g, '-');
      }
      
      console.log('📅 Date formatting:', { dueDate, formattedDueDate });

      // Get installment amount
      const installmentAmount = installment.duePayment || installment.receivedPayment || 0;

      // Get course name - ensure it's not empty
      // courseData structure: { statusCode: 200, data: { courseName: ... } }
      const courseName = (
        courseData?.data?.courseName 
        || courseData?.courseName 
        || course?.courseName 
        || ''
      ).trim();
      
      console.log('📚 Course name check:', {
        courseDataExists: !!courseData,
        courseDataStructure: courseData ? Object.keys(courseData) : [],
        courseDataData: courseData?.data ? Object.keys(courseData.data) : [],
        courseDataDataCourseName: courseData?.data?.courseName,
        courseDataCourseName: courseData?.courseName,
        courseCourseName: course?.courseName,
        finalCourseName: courseName,
      });
      
      if (!courseName) {
        Alert.alert("Error", "Course name is missing. Please check course details.");
        return;
      }

      // Get student name - ensure it's not empty
      const studentName = `${studentDetails.studentFirstName || ''} ${studentDetails.studentLastName || ''}`.trim();
      if (!studentName) {
        Alert.alert("Error", "Student name is missing. Please check student details.");
        return;
      }

      // Get installment number - ensure it's valid
      const installmentNumber = installment.installmentNumber || 1;
      
      // Validate all required fields before building payload
      console.log('📋 Validating payload data:', {
        studentName,
        courseName,
        installmentNumber,
        installmentAmount,
        formattedDueDate,
        studentPhone,
      });

      // Determine action type
      let actionOn: string[] = [];
      let smsTemplateId: string | undefined;
      let smsNumber: string | undefined;

      if (action.toLowerCase() === 'whatsapp') {
        actionOn = ['whatsapp', ''];
      } else if (action.toLowerCase() === 'sms') {
        // SMS format: ["", "sms"] - empty string first, then "sms"
        actionOn = ['', 'sms'];
        smsTemplateId = '1707173891716321405'; // SMS template ID from payload
        smsNumber = studentPhone;
      } else if (action.toLowerCase() === 'email') {
        // Email reminder uses different API - handle separately
        await handleEmailReminder(installment, studentDetails, courseName, formattedDueDate, installmentAmount);
        return;
      } else {
        Alert.alert("Error", "Invalid action type");
        return;
      }

      console.log('📋 Action details:', { action, actionOn, smsTemplateId, smsNumber });

      // Validate walletId
      const walletId = organization?.walletId || '';
      if (!walletId) {
        console.warn('⚠️ WalletId not found, using empty string');
      }

      // Build payload
      const payload = {
        customerId: authUser.customerId || studentDetails.customerId || '',
        organizationId: selectedOrganization.organizationId || '',
        user: {
          userCustomerId: authUser.customerId || '',
          userCustomerName: authUser.customerName || '',
          userCustomerEmail: authUser.customerEmail || '',
          roleName: selectedOrganization?.role?.roleName || authUser.userType || 'admin',
          roleId: selectedOrganization?.role?.roleId || authUser.employeeId || '',
          userEmployeeId: authUser.employeeId || '',
        },
        action: {
          actionOn: actionOn,
          singleNumber: studentPhone,
          templateName: 'student_installment_upcoming_fee',
          templateId: '2354782141619006',
          bodyParams: [
            { type: 'text', text: studentName || 'Student' },
            { type: 'text', text: courseName || 'Course' },
            { type: 'text', text: installmentNumber.toString() },
            { type: 'text', text: installmentAmount.toString() || '0' },
            { type: 'text', text: courseName || 'Course' },
            { type: 'text', text: formattedDueDate !== 'N/A' ? formattedDueDate : 'N/A' },
          ],
          textBodyParams: [
            { value: courseName },
            { value: formattedDueDate },
          ],
          ...(smsTemplateId && { smsTemplateId }),
          ...(smsNumber && { smsNumber }),
        },
        walletId: walletId,
      };

      // Validate payload before sending
      if (!payload.customerId || !payload.organizationId || !payload.walletId) {
        console.error('❌ Invalid payload:', payload);
        Alert.alert("Error", "Missing required fields. Please check customer ID, organization ID, and wallet ID.");
        return;
      }

      // Validate all bodyParams have non-empty text values
      const invalidParams = payload.action.bodyParams.filter((param: any) => {
        const textValue = param.text?.toString().trim();
        return !textValue || textValue === '' || textValue === 'undefined' || textValue === 'null';
      });

      if (invalidParams.length > 0) {
        console.error('❌ Invalid bodyParams:', invalidParams);
        console.error('❌ Full bodyParams:', payload.action.bodyParams);
        Alert.alert(
          "Error", 
          `Some required parameters are missing or empty. Please check:\n- Student Name\n- Course Name\n- Installment Number\n- Installment Amount\n- Due Date`
        );
        return;
      }

      // Validate textBodyParams
      const invalidTextParams = payload.action.textBodyParams.filter((param: any) => {
        const value = param.value?.toString().trim();
        return !value || value === '' || value === 'undefined' || value === 'null';
      });

      if (invalidTextParams.length > 0) {
        console.error('❌ Invalid textBodyParams:', invalidTextParams);
        Alert.alert("Error", "Course name or due date is missing. Please check the data.");
        return;
      }

      console.log('📤 Sending reminder payload:', JSON.stringify(payload, null, 2));
      console.log('📤 API URL:', apiUrls.emailServiceUrl.SEND_REMINDER);
      console.log('📤 Request details:', {
        customerId: payload.customerId,
        organizationId: payload.organizationId,
        walletId: payload.walletId,
        action: payload.action.actionOn,
        phone: payload.action.singleNumber,
      });

      // Call API
      let response;
      try {
        response = await sendReminder(payload);
        console.log('✅ Reminder API response:', JSON.stringify(response, null, 2));
        console.log('✅ Response type:', typeof response);
        console.log('✅ Response keys:', response ? Object.keys(response) : 'null');
        
        // Check if response indicates an error (from axios service, errors return error.response)
        if (response?.status && response.status >= 400) {
          console.error('❌ API returned error status:', response.status);
          throw response; // Throw as error to be caught
        }
        
        // Check if response has statusCode indicating error
        if (response?.statusCode && response.statusCode !== 200) {
          console.error('❌ API returned error statusCode:', response.statusCode);
          throw response; // Throw as error to be caught
        }
      } catch (apiError: any) {
        console.error('❌ API call error:', apiError);
        console.error('❌ API error response:', apiError?.response);
        console.error('❌ API error data:', apiError?.response?.data || apiError?.data);
        console.error('❌ API error status:', apiError?.status || apiError?.response?.status);
        throw apiError; // Re-throw to be caught by outer catch
      }

      // Handle different response structures
      let status = false;
      let message = '';
      let errorDetails = null;

      console.log('📥 Processing response for action:', action);
      console.log('📥 Full response structure:', JSON.stringify(response, null, 2));

      if (response?.data) {
        // Response structure: { data: { whatsapp: { status, message, error } } } or { data: { sms: { status, message } } }
        const whatsappData = response.data.whatsapp;
        const smsData = response.data.sms;
        
        console.log('📥 WhatsApp data:', whatsappData);
        console.log('📥 SMS data:', smsData);
        
        if (action.toLowerCase() === 'whatsapp' && whatsappData) {
          status = whatsappData.status === true;
          
          if (status) {
            message = whatsappData.message || 'WhatsApp reminder sent successfully';
          } else {
            // Extract error details
            errorDetails = whatsappData.error?.error || whatsappData.error;
            message = errorDetails?.message 
              || errorDetails?.error_data?.details 
              || whatsappData.message 
              || 'Failed to send WhatsApp reminder';
          }
        } else if (action.toLowerCase() === 'sms' && smsData) {
          console.log('📥 SMS data details:', {
            status: smsData.status,
            statusCode: smsData.statusCode,
            message: smsData.message,
            error: smsData.error,
            errorType: typeof smsData.error,
          });
          
          // Check status - can be true or statusCode === 200
          status = smsData.status === true || smsData.statusCode === 200;
          
          if (status) {
            message = smsData.message || 'SMS reminder sent successfully';
            console.log('✅ SMS success:', message);
          } else {
            // Extract error details - error can be a string or an object
            if (typeof smsData.error === 'string') {
              // Error is a direct string (e.g., "Insufficient funds in wallet for sms.")
              message = smsData.error;
              errorDetails = smsData.error;
            } else if (smsData.error && typeof smsData.error === 'object') {
              // Error is an object with nested structure
              errorDetails = smsData.error?.error || smsData.error;
              message = errorDetails?.message 
                || errorDetails?.error_data?.details 
                || smsData.error?.message
                || smsData.message 
                || 'Failed to send SMS reminder';
            } else {
              // Fallback to message or default
              message = smsData.message || 'Failed to send SMS reminder';
            }
            
            console.error('❌ SMS error details:', errorDetails);
            console.error('❌ SMS error message:', message);
          }
        } else {
          // Neither whatsapp nor sms data found
          console.error('❌ No matching action data found:', {
            action,
            hasWhatsappData: !!whatsappData,
            hasSmsData: !!smsData,
            responseKeys: Object.keys(response.data || {}),
          });
          message = `No ${action} data found in response`;
        }
      } else if (response?.statusCode === 200) {
        // Response structure: { statusCode: 200, data: { whatsapp: {...} } }
        status = true;
        message = `${action} reminder sent successfully`;
      } else if (response?.whatsapp || response?.sms) {
        // Direct response structure: { whatsapp: { status, message } }
        const whatsappData = response.whatsapp;
        const smsData = response.sms;
        
        if (action.toLowerCase() === 'whatsapp' && whatsappData) {
          status = whatsappData.status === true;
          message = whatsappData.message || 'WhatsApp reminder sent successfully';
        } else if (action.toLowerCase() === 'sms' && smsData) {
          status = smsData.status === true || smsData.statusCode === 200;
          message = smsData.message || 'SMS reminder sent successfully';
        }
      } else {
        // Unknown response structure
        console.error('❌ Unknown response structure:', response);
        message = `Unknown response structure for ${action}`;
      }

      console.log('📊 Final status check:', { status, message, action });

      if (status) {
        Alert.alert(
          "Success", 
          message,
          [{ text: "OK" }]
        );
      } else {
        // Throw error with detailed message
        console.error('❌ API returned failure status:', {
          action,
          message,
          errorDetails,
          fullResponse: response,
        });
        throw new Error(message || `Failed to send ${action} reminder`);
      }
    } catch (error: any) {
      console.error('❌ Reminder error details:', {
        error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        errorMessage: error?.message,
        errorResponse: error?.response,
        errorData: error?.data,
        errorStatus: error?.status,
        errorStatusText: error?.statusText,
        fullError: JSON.stringify(error, null, 2),
      });

      // Extract error message from different possible locations
      // Note: axios service returns error.response, so error might be the response object itself
      let errorMessage = '';
      
      // Check if error is the response object (from axios service onError)
      if (error?.data) {
        errorMessage = error.data.message 
          || error.data.error 
          || error.data.errorMessage
          || error.data.whatsapp?.message
          || error.data.sms?.message
          || error.data.data?.whatsapp?.message
          || error.data.data?.sms?.message;
      }
      
      // Check if error has response property (standard axios error)
      if (!errorMessage && error?.response?.data) {
        errorMessage = error.response.data.message 
          || error.response.data.error 
          || error.response.data.errorMessage
          || error.response.data.whatsapp?.message
          || error.response.data.sms?.message;
      }
      
      // Fallback to error message or status text
      if (!errorMessage) {
        errorMessage = error?.message 
          || error?.statusText
          || error?.response?.statusText
          || `Failed to send ${action} reminder. Please try again.`;
      }

      // If still no message, show status code
      if (!errorMessage && (error?.status || error?.response?.status)) {
        const statusCode = error?.status || error?.response?.status;
        errorMessage = `Error ${statusCode}: ${errorMessage || 'Something went wrong'}`;
      }
      
      console.error('📢 Final error message:', errorMessage);
      console.error('📢 Error status:', error?.status || error?.response?.status);
      
      Alert.alert(
        'Error', 
        errorMessage
      );
    }
  };

  const handleSubmitPayment = async () => {
    if (!authUser || !selectedOrganization) {
      Alert.alert("Error", "Required data is missing");
      return;
    }

    // Validate required fields
    if (!isPayingFirstInstallment) {
      Alert.alert("Error", "Please select if you are paying first installment");
      return;
    }

    // Validate payment mode fields if paying first installment
    if (isPayingFirstInstallment === 'paid') {
      const firstInstallment = dynamicInstallments[0];
      if (!firstInstallment?.paymentMode) {
        Alert.alert("Error", "Please select payment mode for first installment");
        return;
      }
      
      if (firstInstallment.paymentMode === 'cash' && !firstInstallment.paymentRecieverId) {
        Alert.alert("Error", "Please select payment received by for cash payment");
        return;
      }
      
      if (firstInstallment.paymentMode === 'online' && !firstInstallment.transactionId) {
        Alert.alert("Error", "Please enter transaction ID for online payment");
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Prepare installment details
      const installmentDetails = dynamicInstallments.map((inst, index) => {
        const installmentData: any = {
          installmentNumber: inst.installmentNumber || index + 1,
          paymentStatus: isPayingFirstInstallment === 'paid' && index === 0 ? 'paid' : 'due',
          installmentId: inst.installmentId,
          paymentNotes: inst.paymentNotes || '',
          paymentMode: inst.paymentMode || '',
          transactionId: inst.transactionId || '',
          paymentRecieverId: inst.paymentRecieverId || ''
        };

        // Add payment date and amount based on status
        if (installmentData.paymentStatus === 'paid') {
          installmentData.paymentReceiveDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
          installmentData.receivedPayment = inst.duePayment || 0;
        } else {
          installmentData.nextpaymentDate = inst.nextpaymentDate || new Date().toLocaleDateString("en-GB");
          installmentData.duePayment = inst.duePayment || 0;
        }

        return installmentData;
      });

      // Determine course payment status
      const coursePaymentStatus = dynamicInstallments.every(inst => 
        isPayingFirstInstallment === 'paid' && dynamicInstallments.indexOf(inst) === 0 ? true : false
      ) ? 'paid' : 'due';

      const payload = {
        user: {
          userCustomerId: authUser.customerId,
          userCustomerName: authUser.customerName,
          userCustomerEmail: authUser.customerEmail,
          roleName: selectedOrganization.role?.roleName || authUser.userType,
          roleId: selectedOrganization.role?.roleId || authUser.employeeId,
          userEmployeeId: authUser.employeeId
        },
        customerId: selectedOrganization.customerId,
        organizationId: selectedOrganization.organizationId,
        rollNo: studentRollNo,
        courseId: course.courseId,
        paymentDetails: {
          isPartPayment: dynamicInstallments.length > 1,
          coursePaymentStatus: coursePaymentStatus,
          installmentDetails: installmentDetails
        },
        ...(selectedCoupon && {
          coupon: {
            couponId: selectedCoupon.couponId,
            discount: discountAmount
          }
        })
      };

      console.log("Submitting payment details with payload:", JSON.stringify(payload, null, 2));

      const response = await request({
        method: "POST",
        url: "/student-fnp-prod/updateStudentPaymentDetails",
        data: payload
      });

      console.log("Payment details update response:", response);

      if (response.statusCode === 200) {
        // Invalidate queries to refresh all related data
        console.log("🔄 Invalidating queries to refresh payment data");
        
        // Invalidate student details query
        queryClient.invalidateQueries({
          queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
        });
        
        // Invalidate course details query (in case it includes payment info)
        queryClient.invalidateQueries({
          queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
        });
        
        // Also invalidate student list queries that might show payment status
        queryClient.invalidateQueries({
          queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
        });
        
        // Refetch student data to ensure immediate update
        await refetchStudentData();
        
        Alert.alert("Success", "Payment details updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back after data refresh
              navigation.goBack();
            }
          }
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to update payment details");
      }
    } catch (error) {
      console.error("Error updating payment details:", error);
      Alert.alert("Error", "Failed to update payment details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if due date has passed
  const isDueDatePassed = (dueDateString: string): boolean => {
    if (!dueDateString) return false;
    
    try {
      let dueDate: Date;
      
      // Handle DD/MM/YYYY format
      if (dueDateString.includes('/')) {
        const [day, month, year] = dueDateString.split('/');
        dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      // Handle DD-MM-YYYY format
      else if (dueDateString.includes('-')) {
        const [day, month, year] = dueDateString.split('-');
        dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      // Handle standard date format
      else {
        dueDate = new Date(dueDateString);
      }
      
      if (isNaN(dueDate.getTime())) return false;
      
      // Get today's date without time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get due date without time
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      // Check if due date is before today
      return dueDateOnly < today;
    } catch (error) {
      console.log('Error checking due date:', error);
      return false;
    }
  };

  // Helper function to get display status (due -> overdue if date passed)
  const getDisplayStatus = (installment: any): string => {
    const status = installment.paymentStatus?.toLowerCase() || '';
    
    // If status is "due", check if due date has passed
    if (status === 'due') {
      const dueDate = installment.nextpaymentDate || installment.formatedNextpaymentDate;
      if (dueDate && isDueDatePassed(dueDate)) {
        return 'overdue';
      }
    }
    
    return status;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return { backgroundColor: "#ECFFE0", color: "#4AC400" };
      case "due":
        return { backgroundColor: "#FFE6E6", color: "#FF4444" };
      case "overdue":
        return { backgroundColor: "#FFE6E6", color: "#FF4444" };
      case "pending":
        return { backgroundColor: "#FFF3E0", color: "#FF9800" };
      default:
        return { backgroundColor: "#F5F5F5", color: "#666666" };
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${amount?.toLocaleString() || "0"}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    
    console.log('Formatting date:', dateString);
    
    try {
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        console.log('Parsed DD/MM/YYYY format:', { day, month, year });
        return `${day}/${month}/${year}`;
      }
      
      // Handle DD-MM-YYYY format
      if (dateString.includes('-')) {
        const [day, month, year] = dateString.split('-');
        console.log('Parsed DD-MM-YYYY format:', { day, month, year });
        return `${day}/${month}/${year}`;
      }
      
      // Handle standard date format
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        console.log('Parsed as standard date:', date);
        return date.toLocaleDateString("en-GB");
      }
      
      console.log('Invalid date:', dateString);
      return "Invalid date";
    } catch (error) {
      console.log('Date formatting error:', error);
      return "Error";
    }
  };

  return (
    <SafeView>
      <AppHeader
        showDrawer={false}
        title="Payment History"
        handleBackClick={() => navigation.goBack()}
      />
      
      <ThemeScrollView 
        paddingHorizontal={10}
        loading={courseLoading || studentLoading}
      >
        <Flex mt={20} flexDirection="column">
          {/* Tab Container */}
          <Flex styles={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "installment" ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setActiveTab("installment")}
            >
              <ScalableText style={activeTab === "installment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
                INSTALLMENT VIEW
              </ScalableText>
            </TouchableOpacity>
            {paymentDetails?.coursePaymentStatus === "due" && (
              <TouchableOpacity
                style={[styles.tab, activeTab === "payment" ? styles.activeTab : styles.inactiveTab]}
                onPress={() => setActiveTab("payment")}
              >
                <ScalableText style={activeTab === "payment" ? styles.activeTabText : styles.inactiveTabText} fontFamily="Medium">
                  INSTALLMENT UPDATE
                </ScalableText>
              </TouchableOpacity>
            )}
          </Flex>

          {/* Section Title */}
          <Flex mt={20} align="flex-start">
            <ScalableText style={styles.sectionTitle} fontFamily="Bold">
              {activeTab === "installment" ? "Installment Details" : "Update Installments"}
            </ScalableText>
          </Flex>

         

          {/* Conditional Content Based on Active Tab */}
          {activeTab === "installment" ? (
            // Installment Details Table - scrollable + wider layout
            <Flex mt={15}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.installmentTableWrapper}>
                  <Grid>
                    <Row style={styles.headerRow}>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "4%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          NO.
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          DATE
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          AMOUNT
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center', }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          MODE
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "15%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          STATUS
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          INVOICE
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          REMINDER
                        </ScalableText>
                      </Col>
                      <Col  style={{ alignItems: 'center', justifyContent: 'center',width: "8%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          EDIT
                        </ScalableText>
                      </Col>
                      <Col style={{ alignItems: 'center', justifyContent: 'center',width: "10%" }}>
                        <ScalableText fontFamily="SemiBold" style={styles.headerText}>
                          DOWNLOAD
                        </ScalableText>
                      </Col>
                    </Row>
                    
                    {/* Dynamic Table Data */}
                    {installmentDetails.length > 0 ? (
                      installmentDetails.map((installment: any, index: number) => {
                    console.log("Rendering installment:", installment);
                    console.log("Installment payment status:", installment.paymentStatus);
                    console.log("Available date fields:", {
                      nextpaymentDate: installment.nextpaymentDate,
                      formatedNextpaymentDate: installment.formatedNextpaymentDate,
                      paymentReceiveDate: installment.paymentReceiveDate,
                      paymentDate: installment.paymentDate,
                      receivedDate: installment.receivedDate,
                      paidDate: installment.paidDate
                    });
                    
                    // Get display status (due -> overdue if date passed)
                    const displayStatus = getDisplayStatus(installment);
                    const statusStyle = getStatusColor(displayStatus);
                    return (
                      <Row key={installment.installmentId} style={styles.dataRow}>
                        <Col size={8} style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <ScalableText style={styles.dataText} fontFamily="Regular">
                            {installment.installmentNumber}
                          </ScalableText>
                        </Col>
                        <Col size={10} style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <ScalableText style={styles.dataText} fontFamily="Regular">
                            {(() => {
                              // For paid installments, show payment received date
                              if (installment.paymentStatus?.toLowerCase() === 'paid') {
                                return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate);
                              }
                              // For due installments, show next payment date
                              else if (installment.paymentStatus?.toLowerCase() === 'due') {
                                return formatDate(installment.nextpaymentDate || installment.formatedNextpaymentDate);
                              }
                              // Fallback for other statuses
                              else {
                                return formatDate(installment.paymentReceiveDate || installment.paidDate || installment.receivedDate || installment.paymentDate || installment.nextpaymentDate || installment.formatedNextpaymentDate);
                              }
                            })()}
                          </ScalableText>
                        </Col>
                        <Col size={15} style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <ScalableText style={styles.dataText} fontFamily="Regular">
                            {formatCurrency(installment.receivedPayment || installment.duePayment)}
                          </ScalableText>
                        </Col>
                        <Col size={16} style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <ScalableText style={styles.dataText} fontFamily="Regular">
                            {(installment.paymentMode || '').toString().toUpperCase() || '-'}
                          </ScalableText>
                          </Col>
                          <Col size={18} style={{ alignItems: 'center', justifyContent: 'center',   }}>
                          <Flex
                            styles={{
                              ...styles.statusChip,
                              backgroundColor: statusStyle.backgroundColor,
                            }}
                           >
                            <ScalableText
                              style={{
                                ...styles.statusChipText,
                                color: statusStyle.color,
                              }}
                              fontFamily="Medium"
                            >
                              {displayStatus.toUpperCase()}
                            </ScalableText>
                          </Flex>
                          </Col>
                          <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                          <Flex flexDirection="row" justify="flex-start" align="center">
                            <TouchableOpacity 
                              onPress={() => handleViewInvoice(installment.installmentId)}
                              disabled={isSendingInvoice}
                              style={{ opacity: isSendingInvoice ? 0.5 : 1 }}
                            >
                              <AutoHeightImage source={IMAGES.fileSearchIcon} width={16} />
                            </TouchableOpacity>
                          </Flex>
                        </Col>
                        <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Flex flexDirection="row" justify="flex-start" align="center">
                            <TouchableOpacity 
                              onPress={() => handleReminderMenu(installment.installmentId)}
                              style={styles.reminderButton}
                            >
                              <AutoHeightImage source={IMAGES.mailIconGray} width={16} />
                            </TouchableOpacity>
                          </Flex>
                        </Col>
                        <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Flex flexDirection="row" justify="flex-start" align="center">
                            <TouchableOpacity onPress={() => handleEditInstallment(installment)}>
                              <AutoHeightImage source={IMAGES.editIcon} width={16} />
                            </TouchableOpacity>
                          </Flex>
                        </Col>
                        <Col size={8} style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Flex flexDirection="row" justify="flex-start" align="center">
                            <TouchableOpacity onPress={() => handleDownloadInvoice(installment.installmentId)}>
                              <AutoHeightImage source={IMAGES.downloadIcon} width={16} />
                            </TouchableOpacity>
                          </Flex>
                        </Col>
                      </Row>
                    );
                  })
                ) : (
                  <Row style={styles.dataRow}>
                    <Col size={100}>
                      <ScalableText style={styles.noDataText} fontFamily="Medium">
                        No installment details available
                      </ScalableText>
                    </Col>
                  </Row>
                )}
                  </Grid>
                </View>
              </ScrollView>
            </Flex>
          ) : (
            // Update Installments Form - Matching PaymentDetailsScreen UI
            <Flex mt={15}>
              <View style={styles.updateFormContainer}>
                {/* Summary Section */}
                <View style={styles.formField}>
                  <ScalableText style={styles.formLabel} fontFamily="Medium">
                    Payment Summary
                  </ScalableText>
                  
                  <View style={styles.inputSpacing}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Total Payment Amount
                    </ScalableText>
                    <View style={styles.inputContainer}>
                      <ScalableText style={styles.inputValue} fontFamily="Regular">
                        {formatCurrency(paymentDetails?.totalPayment || 0)}
                      </ScalableText>
                    </View>
                  </View>

                  <View style={styles.inputSpacing}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Total Received Amount
                    </ScalableText>
                    <View style={styles.inputContainer}>
                      <ScalableText style={styles.inputValue} fontFamily="Regular">
                        {formatCurrency(paymentDetails?.totalReceivedPayment || 0)}
                      </ScalableText>
                    </View>
                  </View>

                  <View style={styles.inputSpacing}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Total Due Amount
                    </ScalableText>
                    <View style={styles.inputContainer}>
                      <ScalableText style={styles.inputValue} fontFamily="Regular">
                        {formatCurrency(paymentDetails?.totalDuePayment || 0)}
                      </ScalableText>
                    </View>
                  </View>
                </View>

                {/* Paid Installments Section */}
                {installmentDetails.filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid').length > 0 && (
                  <View style={styles.formField}>
                    <ScalableText style={styles.formLabel} fontFamily="Medium">
                      Paid Installments
                    </ScalableText>
                    {installmentDetails
                      .filter((inst: any) => inst.paymentStatus?.toLowerCase() === 'paid')
                      .map((paidInst: any, index: number) => (
                        <View key={`paid-${paidInst.installmentId}`} style={styles.installmentContainer}>
                          <ScalableText style={styles.installmentTitle} fontFamily="Medium">
                            Paid Installment {paidInst.installmentNumber}
                          </ScalableText>
                          
                          <View style={styles.inputSpacing}>
                            <ScalableText style={styles.inputLabel} fontFamily="Medium">
                              Payment Date
                            </ScalableText>
                            <View style={styles.inputContainer}>
                              <ScalableText style={styles.inputValue} fontFamily="Regular">
                                {formatDate(paidInst.paymentReceiveDate || paidInst.paidDate || paidInst.receivedDate || paidInst.paymentDate)}
                              </ScalableText>
                            </View>
                          </View>

                          <View style={styles.inputSpacing}>
                            <ScalableText style={styles.inputLabel} fontFamily="Medium">
                              Amount Paid
                            </ScalableText>
                            <View style={styles.inputContainer}>
                              <ScalableText style={styles.inputValue} fontFamily="Regular">
                                {formatCurrency(paidInst.receivedPayment || paidInst.duePayment)}
                              </ScalableText>
                            </View>
                          </View>

                          <View style={styles.inputSpacing}>
                            <ScalableText style={styles.inputLabel} fontFamily="Medium">
                              Description
                            </ScalableText>
                            <View style={styles.inputContainer}>
                              <ScalableText style={styles.inputValue} fontFamily="Regular">
                                {paidInst.paymentNotes || "No description"}
                              </ScalableText>
                            </View>
                          </View>

                          {/* PAID Status Badge */}
                          <View style={styles.paidStatusBadge}>
                            <ScalableText style={styles.paidStatusText} fontFamily="Bold">
                              PAID
                            </ScalableText>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {/* Apply Coupon Section */}
                <View style={styles.formField}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Apply Coupon
                  </ScalableText>
                  <View style={styles.couponContainer}>
                    {/* Show selected coupon in input field */}
                    {selectedCoupon ? (
                      <View style={styles.selectedCouponContainer}>
                        <View style={styles.selectedCouponInfo}>
                          <ScalableText style={styles.selectedCouponName} fontFamily="Medium">
                            {selectedCoupon.couponName} - {selectedCoupon.couponType === 'flat' ? '₹' : '%'}{selectedCoupon.discountValue}
                          </ScalableText>
                        </View>
                        <TouchableOpacity 
                          style={styles.removeCouponButton}
                          onPress={() => {
                            setSelectedCoupon(null);
                            
                            // Force refresh installment amounts when coupon is removed
                            setTimeout(() => {
                              console.log('🔄 Coupon removed - forcing installment amount refresh');
                              recalculateInstallmentAmounts();
                            }, 100);
                          }}
                        >
                          <ScalableText style={styles.removeCouponText} fontFamily="Bold">×</ScalableText>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Show dropdown when no coupon is selected */
                      <SelectDropdown
                        label="Select coupon"
                        onChange={(value) => handleCouponSelection(value)}
                        options={couponsLoading ? [{ label: 'Loading...', value: '' }] : availableCoupons}
                        value={
                          availableCoupons.find(
                            (opt: CouponOption) => opt.value === (selectedCoupon?.couponId || '')
                          ) as any
                        }
                        dropdownButtonStyle={styles.couponDropdownStyle}
                      />
                    )}
                    <TouchableOpacity style={styles.addButton} onPress={handleAddCoupon}>
                      <ScalableText style={styles.addButtonText} fontFamily="Bold">+</ScalableText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Discount Amount */}
                <View style={styles.formField}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Discount Amount
                  </ScalableText>
                  <View style={styles.inputContainer}>
                    <ScalableText style={styles.inputValue} fontFamily="Regular">
                      {formatCurrency(discountAmount)}
                    </ScalableText>
                  </View>
                </View>

                {/* Discounted Payment Amount */}
                <View style={styles.formField}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Payment After Discount
                  </ScalableText>
                  <View style={styles.inputContainer}>
                    <ScalableText style={styles.inputValue} fontFamily="Regular">
                      {formatCurrency(paymentAfterDiscount)}
                    </ScalableText>
                  </View>
                </View>

                {/* First Installment Question */}
                <View style={styles.formField}>
                  <ScalableText style={styles.inputLabel} fontFamily="Medium">
                    Are you paying first installment right now? *
                  </ScalableText>
                  <SelectDropdown
                    label="Select option"
                    onChange={(value) => setIsPayingFirstInstallment(value)}
                    options={[
                      { label: 'Paid', value: 'paid' },
                      { label: 'Due', value: 'due' }
                    ]}
                    value={
                      isPayingFirstInstallment
                        ? ({
                            label: isPayingFirstInstallment === 'paid' ? 'Paid' : 'Due',
                            value: isPayingFirstInstallment,
                          } as any)
                        : (undefined as any)
                    }
                    dropdownButtonStyle={styles.couponDropdownStyle}
                  />
                </View>

                {/* Payment Mode Fields - Only show if paying first installment */}
                {isPayingFirstInstallment === 'paid' && dynamicInstallments.length > 0 && (
                  <View style={styles.formField}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Mode of Payment for Paid Installment *
                    </ScalableText>
                    
                    {/* Payment Mode Selection */}
                    <View style={styles.paymentModeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.paymentModeButton,
                          dynamicInstallments[0]?.paymentMode === 'cash' && styles.paymentModeButtonActive
                        ]}
                        onPress={() => {
                          const updatedInstallments = dynamicInstallments.map((inst, index) => 
                            index === 0 ? { ...inst, paymentMode: 'cash' } : inst
                          );
                          setDynamicInstallments(updatedInstallments);
                        }}
                      >
                        <ScalableText
                          style={{
                            ...styles.paymentModeButtonText,
                            ...(dynamicInstallments[0]?.paymentMode === 'cash'
                              ? styles.paymentModeButtonTextActive
                              : {}),
                          }}
                          fontFamily="Medium"
                        >
                          Cash
                        </ScalableText>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.paymentModeButton,
                          dynamicInstallments[0]?.paymentMode === 'online' && styles.paymentModeButtonActive
                        ]}
                        onPress={() => {
                          const updatedInstallments = dynamicInstallments.map((inst, index) => 
                            index === 0 ? { ...inst, paymentMode: 'online' } : inst
                          );
                          setDynamicInstallments(updatedInstallments);
                        }}
                      >
                        <ScalableText
                          style={{
                            ...styles.paymentModeButtonText,
                            ...(dynamicInstallments[0]?.paymentMode === 'online'
                              ? styles.paymentModeButtonTextActive
                              : {}),
                          }}
                          fontFamily="Medium"
                        >
                          Online
                        </ScalableText>
                      </TouchableOpacity>
                    </View>

                    {/* Payment Received By - Only show for cash mode */}
                    {dynamicInstallments[0]?.paymentMode === 'cash' && (
                      <View style={styles.inputSpacing}>
                        <ScalableText style={styles.inputLabel} fontFamily="Medium">
                          Payment Received By *
                        </ScalableText>
                        <SelectDropdown
                          label="Select employee"
                          onChange={(value) => {
                            const updatedInstallments = dynamicInstallments.map((inst, index) => 
                              index === 0 ? { ...inst, paymentRecieverId: value } : inst
                            );
                            setDynamicInstallments(updatedInstallments);
                          }}
                          options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
                          value={availableEmployees.find(emp => emp.value === dynamicInstallments[0]?.paymentRecieverId)}
                          dropdownButtonStyle={styles.couponDropdownStyle}
                        />
                      </View>
                    )}

                    {/* Transaction ID - Only show for online mode */}
                    {dynamicInstallments[0]?.paymentMode === 'online' && (
                      <View style={styles.inputSpacing}>
                        <ScalableText style={styles.inputLabel} fontFamily="Medium">
                          Transaction ID *
                        </ScalableText>
                        <Input
                          handler={installmentHandler}
                          name={`transactionId${dynamicInstallments[0]?.installmentId}`}
                          label=""
                          containerStyles={styles.inputContainer}
                          placeholder="Enter transaction ID"
                          value={dynamicInstallments[0]?.transactionId || ''}
                          onChangeText={(text) => {
                            const updatedInstallments = dynamicInstallments.map((inst, index) => 
                              index === 0 ? { ...inst, transactionId: text } : inst
                            );
                            setDynamicInstallments(updatedInstallments);
                          }}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Due Installments Section */}
                <View style={styles.formField}>
                  <ScalableText style={styles.formLabel} fontFamily="Medium">
                    Due Installments
                  </ScalableText>
                  
                  {dynamicInstallments.map((dueInst: any, index: number) => (
                    <View key={`due-${dueInst.installmentId}`} style={styles.installmentContainer}>
                      <View style={styles.installmentHeader}>
                        <ScalableText style={styles.installmentTitle} fontFamily="Medium">
                          Due Installment
                        </ScalableText>
                        <TouchableOpacity
                          style={styles.removeInstallmentButton}
                          onPress={() => handleRemoveInstallment(dueInst.installmentId)}
                        >
                          <ScalableText style={styles.removeButtonText} fontFamily="Bold">−</ScalableText>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.inputSpacing}>
                        <ScalableText style={styles.inputLabel} fontFamily="Medium">
                          Date *
                        </ScalableText>
                        <View style={styles.inputContainer}>
                          <DateInput
                            handler={dateHandler}
                            name={`installmentDate${dueInst.installmentId}`}
                            label="Select due date"
                            inputRoot={styles.dateInputStyle}
                            minimumDate={new Date()}
                          />
                        </View>
                      </View>

                      <View style={styles.inputSpacing}>
                        <ScalableText style={styles.inputLabel} fontFamily="Medium">
                          Amount *
                        </ScalableText>
                        <Input
                          handler={installmentHandler}
                          name={`installmentAmount${dueInst.installmentId}`}
                          label=""
                          keyboardType="numeric"
                          containerStyles={styles.inputContainer}
                          placeholder="Enter amount"
                          editable={false}
                          onChangeText={(text) => {
                            // Update the installment amount in state
                            const newAmount = parseFloat(text) || 0;
                            const updatedInstallments = dynamicInstallments.map(inst => 
                              inst.installmentId === dueInst.installmentId 
                                ? { ...inst, duePayment: newAmount }
                                : inst
                            );
                            setDynamicInstallments(updatedInstallments);
                            
                            console.log('🎯 Updated installment state:', {
                              updatedInstallments,
                              currentInstallmentId: dueInst.installmentId,
                              newAmount
                            });
                            
                            // Auto-adjust remaining installments to maintain total
                            // Use paymentAfterDiscount as base amount (same as PaymentDetailsScreen logic)
                            const baseAmount = selectedCoupon ? paymentAfterDiscount : (paymentDetails?.totalDuePayment || 0);
                            const remainingAmount = baseAmount - newAmount;
                            const remainingInstallments = dynamicInstallments.length - 1;
                            
                            console.log('🎯 Auto-adjusting remaining installments:', {
                              newAmount,
                              baseAmount,
                              remainingAmount,
                              remainingInstallments,
                              currentInstallmentId: dueInst.installmentId,
                              selectedCoupon: selectedCoupon?.couponName,
                              paymentAfterDiscount
                            });
                            
                            if (remainingInstallments > 0 && remainingAmount >= 0) {
                              // Distribute remaining amount equally among remaining installments
                              const equalAmount = Math.floor(remainingAmount / remainingInstallments);
                              const remainder = remainingAmount % remainingInstallments;
                              
                              let currentIndex = 1;
                              const finalUpdatedInstallments = updatedInstallments.map(inst => {
                                if (inst.installmentId !== dueInst.installmentId) {
                                  const installmentAmount = equalAmount + (currentIndex <= remainder ? 1 : 0);
                                  currentIndex++;
                                  console.log(`🎯 Auto-adjusted installment ${inst.installmentId} to: ${installmentAmount}`);
                                  return { ...inst, duePayment: installmentAmount };
                                }
                                return inst;
                              });
                              
                              setDynamicInstallments(finalUpdatedInstallments);
                              
                              console.log('🎯 Final updated installments after auto-adjustment:', finalUpdatedInstallments);
                              
                              // Update form values for all installments
                              finalUpdatedInstallments.forEach((inst) => {
                                const fieldName = `installmentAmount${inst.installmentId}`;
                                installmentHandler.setValue(fieldName, inst.duePayment?.toString() || "0");
                              });
                            }
                          }}
                        />
                      </View>

                      <View style={styles.inputSpacing}>
                        <ScalableText style={styles.inputLabel} fontFamily="Medium">
                          Description
                        </ScalableText>
                        <Input
                          handler={installmentHandler}
                          name={`installmentDescription${dueInst.installmentId}`}
                          label=""
                          containerStyles={styles.inputContainer}
                          placeholder="Enter description"
                          value={dueInst.paymentNotes || ''}
                          onChangeText={(text) => {
                            // Update the installment description in state
                            const updatedInstallments = dynamicInstallments.map(inst => 
                              inst.installmentId === dueInst.installmentId 
                                ? { ...inst, paymentNotes: text }
                                : inst
                            );
                            setDynamicInstallments(updatedInstallments);
                          }}
                        />
                      </View>
                    </View>
                  ))}

                  {/* Add New Due Installment Button */}
                  <TouchableOpacity style={styles.addNewInstallmentButton} onPress={handleAddInstallment}>
                    <ScalableText style={styles.addNewButtonText} fontFamily="Bold">+</ScalableText>
                    <ScalableText style={styles.addNewButtonLabel} fontFamily="Medium">
                      Add Due Installment
                    </ScalableText>
                  </TouchableOpacity>

 
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmitPayment}
                  disabled={isSubmitting}
                >
                  <ScalableText style={styles.submitButtonText} fontFamily="SemiBold">
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                  </ScalableText>
                </TouchableOpacity>
              </View>
            </Flex>
          )}
        </Flex>
      </ThemeScrollView>

      {/* Invoice Preview Modal */}
      <Modal
        visible={invoiceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              justifyContent: "flex-start",
              paddingTop: 80,
            },
          ]}
        >
          <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
            <Flex flexDirection="row" justify="space-between" align="center" mb={15}>
              <ScalableText style={styles.modalTitle} fontFamily="Bold">
                Download Invoice
              </ScalableText>
              <TouchableOpacity
                onPress={() => setInvoiceModalVisible(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <View style={styles.closeIconContainer}>
                  <ScalableText style={styles.closeIcon} fontFamily="Bold">
                    ×
                  </ScalableText>
                </View>
              </TouchableOpacity>
            </Flex>

            {isInvoiceLoading && (
              <Flex justify="center" align="center" styles={{ minHeight: 200 }}>
                <ScalableText fontFamily="Medium" style={{ color: COLORS.textSecondary }}>
                  Loading invoice...
                </ScalableText>
              </Flex>
            )}

            {!isInvoiceLoading && !!invoicePdf && (
              <View
                style={{
                  flex: 1,
                  minHeight: windowHeight * 0.5,
                }}
              >
                <Pdf
                  source={{ uri: `data:application/pdf;base64,${invoicePdf}` }}
                  onError={() => {
                    ToastAndroid.show("Failed to load invoice", ToastAndroid.SHORT);
                  }}
                  style={{
                    width: "95%",
                    height: windowHeight * 0.5,
                    backgroundColor: COLORS.white,
                  }}
                  showsVerticalScrollIndicator
                  scale={1.1}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Update Payment Status Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <Flex flexDirection="row" justify="space-between" align="center" mb={25}>
              <ScalableText style={styles.modalTitle} fontFamily="Bold">
                Update Payment Status
              </ScalableText>
              <TouchableOpacity 
                onPress={handleCloseModal} 
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <View style={styles.closeIconContainer}>
                  <ScalableText style={styles.closeIcon} fontFamily="Bold">×</ScalableText>
                </View>
              </TouchableOpacity>
            </Flex>

            {/* Current Payment Details - Single line format (web-style) */}
            <View style={styles.currentPaymentDetailContainer}>
              <Flex flexDirection="row" align="center" justify="space-between">
                <Flex flexDirection="row" align="center" styles={{ flexWrap: 'wrap', flex: 1 }}>
                  {/* Date section */}
                  <Flex flexDirection="row" align="center" mr={16}>
                    <ScalableText style={styles.currentPaymentValue} fontFamily="Regular">
                      {(() => {
                        if (!selectedInstallment) return "-";
                        if (selectedInstallment.paymentStatus?.toLowerCase() === "paid") {
                          return formatDate(
                            selectedInstallment.paymentReceiveDate ||
                              selectedInstallment.paidDate ||
                              selectedInstallment.receivedDate ||
                              selectedInstallment.paymentDate
                          );
                        }
                        return formatDate(
                          selectedInstallment.nextpaymentDate ||
                            selectedInstallment.formatedNextpaymentDate
                        );
                      })()}
                    </ScalableText>
                  </Flex>

                  {/* Amount section */}
                  <Flex flexDirection="row" align="center">
                    <ScalableText style={styles.currentPaymentAmountValue} fontFamily="Bold">
                      {formatCurrency(
                        selectedInstallment?.receivedPayment ||
                          selectedInstallment?.duePayment ||
                          0
                      )}
                    </ScalableText>
                  </Flex>
                </Flex>

                {/* Status chip on right */}
                {selectedInstallment && (() => {
                  const modalDisplayStatus = getDisplayStatus(selectedInstallment);
                  const modalStatusStyle = getStatusColor(modalDisplayStatus);
                  return (
                    <Flex
                      styles={{
                        ...styles.statusChip,
                        backgroundColor: modalStatusStyle.backgroundColor,
                      }}
                      >
                      <ScalableText
                        style={{
                          ...styles.statusChipText,
                          color: modalStatusStyle.color,
                        }}
                        fontFamily="Medium"
                      >
                        {modalDisplayStatus.toUpperCase()}
                      </ScalableText>
                    </Flex>
                  );
                })()}
              </Flex>
            </View>

            {/* Form row: Status + Date (side by side) */}
            <View style={styles.formRowContainer}>
              {/* Status field */}
              <View style={styles.formFieldHalf}>
                <ScalableText style={styles.inputLabel} fontFamily="Medium">
                  Status *
                </ScalableText>
                <SelectDropdown
                  label=""
                  onChange={(value) => setPaymentStatus(value)}
                  options={[
                    { label: "Paid", value: "paid" },
                    { label: "Due", value: "due" },
                  ]}
                  value={{
                    label:
                      paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
                    value: paymentStatus,
                  }}
                  dropdownButtonStyle={styles.modalDropdownStyle}
                />
              </View>

              {/* Date field */}
              <View style={styles.formFieldHalf}>
                <ScalableText style={styles.inputLabel} fontFamily="Medium">
                  Date *
                </ScalableText>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setStatusDatePickerOpen(true)}
                 >  
                  <Flex flexDirection="row" align="center" justify="space-between">
                    <ScalableText style={styles.dateInputText} fontFamily="Regular">
                      {paymentDate.toLocaleDateString("en-GB")}
                    </ScalableText>
                    <ScalableText style={styles.calendarIcon} fontFamily="Regular">
                      📅
                    </ScalableText>
                  </Flex>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mode of payment for this installment */}
            <View style={styles.paymentModeSection}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Mode of payment for this installment
              </ScalableText>
              <View style={styles.paymentModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentModeButton,
                    paymentMode === 'cash' && styles.paymentModeButtonActive
                  ]}
                  onPress={() => setPaymentMode('cash')}
                >
                  <ScalableText 
                    style={paymentMode === 'cash' 
                      ? styles.paymentModeButtonTextActive 
                      : styles.paymentModeButtonText
                    } 
                    fontFamily="Medium"
                  >
                    Cash
                  </ScalableText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentModeButton,
                    paymentMode === 'online' && styles.paymentModeButtonActive
                  ]}
                  onPress={() => setPaymentMode('online')}
                >
                  <ScalableText 
                    style={paymentMode === 'online' 
                      ? styles.paymentModeButtonTextActive 
                      : styles.paymentModeButtonText
                    } 
                    fontFamily="Medium"
                  >
                    Online
                  </ScalableText>
                </TouchableOpacity>
              </View>

              {/* Extra fields for selected payment mode - fixed height container to avoid jumping */}
              <View style={styles.paymentModeExtraContainer}>
                {/* Payment Received By - only for cash */}
                {paymentMode === 'cash' && (
                  <View style={styles.modalFieldSpacing}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Payment received by
                    </ScalableText>
                    <SelectDropdown
                      label="Select employee"
                      onChange={(value) => setPaymentReceiverId(value)}
                      options={employeesLoading ? [{ label: 'Loading employees...', value: '' }] : availableEmployees}
                      value={availableEmployees.find(emp => emp.value === paymentReceiverId) as any}
                      dropdownButtonStyle={styles.modalDropdownStyle}
                    />
                  </View>
                )}

                {/* Transaction ID - only for online */}
                {paymentMode === 'online' && (
                  <View style={styles.modalFieldSpacing}>
                    <ScalableText style={styles.inputLabel} fontFamily="Medium">
                      Transaction ID
                    </ScalableText>
                    <View style={styles.transactionIdInputWrapper}>
                      <Input
                        handler={installmentHandler}
                        name="modalTransactionId"
                        label=""
                        containerStyles={styles.transactionIdInputContainer}
                        placeholder="Enter transaction ID"
                        value={transactionId}
                        onChangeText={(text) => setTransactionId(text)}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Note text */}
            <View style={styles.noteContainer}>
              <ScalableText style={styles.modalNote} fontFamily="Regular">
                Note: If you change the status of this installment from Paid to Due, the
                payment mode, transaction details and payment receiver details will also
                be removed.
              </ScalableText>
            </View>

            {/* Save Button */}
            <Button
              title={isUpdating ? "UPDATING..." : "SAVE"}
              onPress={handleSavePayment}
              btnStyles={isUpdating ? styles.saveButtonDisabled : styles.saveButton}
              btnTxtStyles={styles.saveButtonText}
              disabled={isUpdating}
            />
          </View>
        </View>
      </Modal>

      {/* Status Date Picker (for Update Payment Status modal) */}
      <DatePicker
        modal
        open={statusDatePickerOpen}
        mode="date"
        date={paymentDate || new Date()}
        onConfirm={(date) => {
          setStatusDatePickerOpen(false);
          if (date && !isNaN(date.getTime())) {
            setPaymentDate(date);
          }
        }}
        onCancel={() => setStatusDatePickerOpen(false)}
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDatePicker(false);
          setSelectedInstallmentForDate('');
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowDatePicker(false);
          setSelectedInstallmentForDate('');
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <ScalableText style={styles.datePickerTitle} fontFamily="Bold">
                    Select Due Date
                  </ScalableText>
                  <TouchableOpacity onPress={() => {
                    setShowDatePicker(false);
                    setSelectedInstallmentForDate('');
                  }}>
                    <View style={styles.closeButtonContainer}>
                      <ScalableText style={styles.closeButton} fontFamily="Bold">×</ScalableText>
                    </View>
                  </TouchableOpacity>
                </View>
                
                <DatePicker
                  date={paymentDate || new Date()}
                  mode="date"
                  onDateChange={(date) => {
                    console.log('DatePicker onDateChange:', date);
                    if (date && !isNaN(date.getTime())) {
                      console.log('Setting payment date to:', date);
                      setPaymentDate(date);
                    } else {
                      console.log('Invalid date received:', date);
                    }
                  }}
                  minimumDate={new Date()}
                />
                
                <View style={styles.datePickerActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowDatePicker(false);
                      setSelectedInstallmentForDate('');
                    }}
                    btnStyles={styles.cancelButton}
                    btnTxtStyles={styles.cancelButtonText}
                  />
                  <Button
                    title="Confirm"
                    onPress={() => {
                      // Update only the selected installment's due date
                      if (paymentDate && !isNaN(paymentDate.getTime())) {
                        console.log('Updating installment date:', {
                          installmentId: selectedInstallmentForDate,
                          newDate: paymentDate.toLocaleDateString("en-GB"),
                          formattedDate: paymentDate.toISOString().split('T')[0]
                        });
                        
                        const updatedInstallments = dynamicInstallments.map(inst => 
                          inst.installmentId === selectedInstallmentForDate 
                            ? {
                                ...inst,
                                nextpaymentDate: paymentDate.toLocaleDateString("en-GB"),
                                formatedNextpaymentDate: paymentDate.toISOString().split('T')[0]
                              }
                            : inst
                        );
                        
                        console.log('Updated installments:', updatedInstallments);
                        setDynamicInstallments(updatedInstallments);
                        setShowDatePicker(false);
                        setSelectedInstallmentForDate('');
                      } else {
                        console.log('Invalid payment date:', paymentDate);
                      }
                    }}
                    btnStyles={styles.confirmButton}
                    btnTxtStyles={styles.confirmButtonText}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Reminder Menu Modal */}
      <Modal
        visible={showReminderMenu !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReminderMenu(null)}
      >
        <View style={styles.reminderModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowReminderMenu(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.reminderMenuModal}>
            <TouchableOpacity 
              style={styles.reminderMenuItem}
              onPress={() => {
                if (showReminderMenu) {
                  handleReminderAction('WhatsApp', showReminderMenu);
                }
              }}
              activeOpacity={0.7}
            >
              <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
                WhatsApp
              </ScalableText>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E8E8E8', marginVertical: 2 }} />
            <TouchableOpacity 
              style={styles.reminderMenuItem}
              onPress={() => {
                if (showReminderMenu) {
                  handleReminderAction('Email', showReminderMenu);
                }
              }}
              activeOpacity={0.7}
            >
              <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
                Email
              </ScalableText>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#E8E8E8', marginVertical: 2 }} />
            <TouchableOpacity 
              style={styles.reminderMenuItem}
              onPress={() => {
                if (showReminderMenu) {
                  handleReminderAction('SMS', showReminderMenu);
                }
              }}
              activeOpacity={0.7}
            >
              <ScalableText style={styles.reminderMenuText} fontFamily="Medium">
                SMS
              </ScalableText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  activeTabText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  inactiveTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: "Poppins-Bold",
    marginBottom: 5,
  },
  headerRow: {
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    
  },
  installmentTableWrapper: {
    minWidth: 900, // wider table so columns have more space
  },
  headerText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
   
  },
  dataRow: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataText: {
    color: COLORS.black,
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
    lineHeight: 16,
  },
  statusChip: {
    borderRadius: 12,
    paddingHorizontal: 8,
 marginLeft:"-15%",
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusChipText: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  noDataText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    height: "90%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: "Poppins-Bold",
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  currentLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  currentValue: {
    fontSize: 13,
    color: COLORS.black,
  },
  paymentAmount: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Poppins-Bold",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    color: COLORS.black,
    fontFamily: "Poppins-Medium",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
  closeIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Bold",
    lineHeight: 28,
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    width: "100%",
    marginTop: 8,
    minHeight: 48,
  },
  dateInputText: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Regular",
  },
  calendarIcon: {
    fontSize: 18,
  },
  paymentDetailsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  modalCloseButton: {
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.7,
  },
  modalNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
    lineHeight: 16,
  },
  currentPaymentDetailContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 20,
  },
  currentPaymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
    marginRight: 8,
  },
  currentPaymentValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Regular",
  },
  currentPaymentAmountValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Poppins-Bold",
  },
  formRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  formFieldHalf: {
    flex: 1,
  },
  modalDropdownStyle: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginTop: 8,
  },
  modalFieldSpacing: {
    marginTop: 8,
  },
  paymentModeExtraContainer: {
    marginTop: 12,
    minHeight: 110, // enough space for either dropdown or input, keeps modal position stable
  },
  noteContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginTop: 18,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFA500",
  },
  updateFormText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  updateFormContainer: {
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    color: COLORS.black,
    fontFamily: "Poppins-Medium",
    marginBottom: 10,
    fontWeight: "600",
  },
  inputField: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Regular",
  },
  couponSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  couponDropdown: {
    flex: 1,
    marginRight: 10,
  },
  couponPlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  addCouponButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 24,
  },
  dropdownField: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  installmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  installmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  installmentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
    marginBottom: 8,
  },
  dateField: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  amountField: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  amountValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Regular",
  },
  addInstallmentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionField: {
    marginTop: 15,
  },
  textAreaField: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  textAreaPlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.7,
  },
  paymentModeSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  paymentModeContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  paymentModeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentModeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentModeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  paymentModeButtonTextActive: {
    color: COLORS.white,
  },
  debugContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  debugText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
    marginBottom: 5,
  },
  reminderMenu: {
    position: 'absolute',
    top: 25,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
    minWidth: 120,
    width: 120,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  reminderMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 0,
    width: '100%',
  },
  reminderMenuText: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: 'Poppins-Medium',
    textAlign: 'left',
  },
  reminderButton: {
    padding: 2,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  reminderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderMenuModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minWidth: 150,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  summarySection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Bold",
  },
  paidStatusBadge: {
    backgroundColor: "#ECFFE0",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  paidStatusText: {
    fontSize: 12,
    color: "#4AC400",
    fontFamily: "Poppins-Bold",
  },
  removeInstallmentButton: {
    backgroundColor: "#FFE6E6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 18,
    color: "#FF4444",
    fontFamily: "Poppins-Bold",
  },
  addNewInstallmentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginTop: 15,
  },
  addNewButtonText: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: "Poppins-Bold",
    marginRight: 8,
  },
  addNewButtonLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  descriptionValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  installmentContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  installmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    fontFamily: "Poppins-Medium",
  },
  inputSpacing: {
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  transactionIdInputWrapper: {
    marginTop: 8,
  },
  transactionIdInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  dateInputStyle: {
    marginTop: 0,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    backgroundColor: COLORS.white,
    elevation: 0,
    shadowOpacity: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  couponContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 0,
  },
  couponDropdownStyle: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    elevation: 0,
    shadowOpacity: 0,
  },
  selectedCouponContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  selectedCouponInfo: {
    flex: 1,
  },
  selectedCouponName: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Medium",
  },
  removeCouponButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeCouponText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: "Poppins-Bold",
  },
  totalAmountSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  totalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Medium",
  },
  totalAmountValue: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: "Poppins-Bold",
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: "Poppins-Bold",
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontFamily: "Poppins-Bold",
  },
  closeButtonContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default UpdatePaymentScreen; 



