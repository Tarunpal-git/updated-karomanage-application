import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStudentDetailsQuery } from '../../../apis/hooks/students/query/useStudentDetails.query';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateStudentMutation } from '../../../apis/hooks/students/mutation/useUpdateStudent.mutation';
import { useDeleteStudentMutation } from '../../../apis/hooks/students/mutation/useDeleteStudent.mutation';
import { useUpdateStudentAndBatchInCourseMutation } from '../../../apis/hooks/organization/mutation/useUpdateStudentAndBatchInCourse.mutation';
import { apiUrls } from '../../../apis/urls';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import SafeView from '../../../@ui/safe-view/SafeView';
import AppHeader from '../../../@ui/app-header/AppHeader';
import Input from '../../../@ui/input/Input';
import Button from '../../../@ui/button/Button';
import ScalableText from '../../../@ui/scalable-text/ScalableText';
import ControlledSelect from '../../../@ui/controlled-select/ControlledSelect';
import DateInput from '../../../@ui/date-input/DateInput';
import { COLORS } from '../../../colors';
import ThemeScrollView from '../../../@ui/theme-scroll-view/ThemeScrollView';
import Flex from '../../../@ui/flex/Flex';
import FileInputField from '../../../@ui/file-input/FileInputField';
import moment from 'moment';

// Validation schema
const editStudentValidation = yup.object().shape({
  studentFirstName: yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[A-Za-z\s]+$/, 'First name can only contain alphabets and spaces'),
  studentLastName: yup.string()
    .optional()
    .matches(/^[A-Za-z\s]*$/, 'Last name can only contain alphabets and spaces'),
  studentEmail: yup.string().email('Invalid email').optional(),
  studentContact: yup.string().required('Phone number is required').matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  studentFatherName: yup.string()
    .optional()
    .matches(/^[A-Za-z\s]*$/, 'Father name can only contain alphabets and spaces'),
  studentFatherContact: yup.string()
    .optional()
    .test('length', 'Father contact number must be exactly 10 digits', (value) => {
      if (!value || value.trim() === '') return true; // Optional field, allow empty
      return /^\d{10}$/.test(value);
    })
    .test('valid-start', 'Father contact number must start with 6, 7, 8, or 9', (value) => {
      if (!value || value.trim() === '') return true; // Optional field, allow empty
      return /^[6-9]/.test(value);
    }),
  studentAddress: yup.string().optional(),
  studentGender: yup.string().optional(),
  studentDateOfBirth: yup.string().nullable().optional(),
  dateOfAdmission: yup.string().nullable().optional(),
  collegeName: yup.string().optional(),
  collegeCourse: yup.string().optional(),
  departmentName: yup.string().optional(),
  collegeSemester: yup.string().optional(),
  studentStatus: yup.string().optional(),
});

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Defaulter', value: 'defaulter' },
];

const EditStudentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { studentData } = route.params || {};
  const queryClient = useQueryClient();
  const { authUser, selectedOrganization } = useSelector((state: RootState) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>(studentData?.studentDynamicFields || []);
  
  // Get student details if not passed in params
  const { data: studentDetailsData, isLoading } = useStudentDetailsQuery(studentData?.rollNo || '');
  const studentDetails = studentData || studentDetailsData?.data;

  // Helper function to parse date string to Date object
  // Handles formats like: DD-MM-YY, DD-MM-YYYY, DD/MM/YY, DD/MM/YYYY, ISO strings, timestamps
  const parseDateForInput = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }
      
      // If it's a number (timestamp)
      if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // If it's a string
      if (typeof dateValue === 'string') {
        const trimmed = dateValue.trim();
        if (!trimmed || trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
          return null;
        }
        
        // Handle DD-MM-YY or DD-MM-YYYY format
        if (trimmed.includes('-')) {
          const parts = trimmed.split('-');
          if (parts.length === 3) {
            const [day, month, year] = parts.map(p => p.trim());
            if (day && month && year) {
              // Handle 2-digit year (YY) - assume 20XX for years < 50, 19XX otherwise
              let fullYear = parseInt(year);
              if (year.length === 2) {
                fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
              }
              const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
          }
        }
        
        // Handle DD/MM/YY or DD/MM/YYYY format
        if (trimmed.includes('/')) {
          const parts = trimmed.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts.map(p => p.trim());
            if (day && month && year) {
              // Handle 2-digit year (YY) - assume 20XX for years < 50, 19XX otherwise
              let fullYear = parseInt(year);
              if (year.length === 2) {
                fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
              }
              const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
          }
        }
        
        // Try parsing with moment (handles various formats)
        const momentDate = moment(trimmed, ['DD-MM-YYYY', 'DD-MM-YY', 'DD/MM/YYYY', 'DD/MM/YY', 'YYYY-MM-DD', 'MM-DD-YYYY', 'MM/DD/YYYY', moment.ISO_8601], true);
        if (momentDate.isValid()) {
          return momentDate.toDate();
        }
        
        // Fallback to standard Date parsing
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error, 'Value:', dateValue);
      return null;
    }
  };

  // Helper function to format Date object to DD-MM-YYYY string for API (matching create format)
  const formatDateForAPI = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    try {
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // If it's already a formatted string (DD-MM-YY or DD-MM-YYYY), return as is
        if (dateValue.match(/^\d{2}[-/]\d{2}[-/]\d{2,4}$/)) {
          // Convert DD-MM-YY to DD-MM-YYYY if needed
          const parts = dateValue.replace(/\//g, '-').split('-');
          if (parts.length === 3 && parts[2].length === 2) {
            const year = parseInt(parts[2]);
            const fullYear = year < 50 ? 2000 + year : 1900 + year;
            return `${parts[0]}-${parts[1]}-${fullYear}`;
          }
          return dateValue.replace(/\//g, '-');
        }
        date = new Date(dateValue);
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        return null;
      }
      
      if (isNaN(date.getTime())) return null;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      // Format as DD-MM-YYYY (full year to match create format)
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date for API:', error, 'Value:', dateValue);
      return null;
    }
  };
  
  // Update mutation
  const { mutateAsync: updateStudent, isPending } = useUpdateStudentMutation();
  const { mutateAsync: deleteStudent } = useDeleteStudentMutation();
  const { mutateAsync: updateStudentAndBatchInCourse } = useUpdateStudentAndBatchInCourseMutation();

  const handler = useForm({
    defaultValues: {
      studentFirstName: studentDetails?.studentFirstName || '',
      studentLastName: studentDetails?.studentLastName || '',
      studentEmail: studentDetails?.studentEmail || '',
      studentContact: studentDetails?.studentContact || '',
      studentFatherName: studentDetails?.studentFatherName || '',
      studentFatherContact: studentDetails?.studentFatherContact || '',
      studentAddress: studentDetails?.studentAddress || '',
      studentGender: studentDetails?.studentGender || '',
      studentDateOfBirth: parseDateForInput(studentDetails?.studentDateOfBirth),
      dateOfAdmission: parseDateForInput(studentDetails?.dateOfAdmission),
      collegeName: studentDetails?.studentCollage || '',
      collegeCourse: studentDetails?.studentCourse || '',
      departmentName: studentDetails?.studentDepartmentName || '',
      collegeSemester: studentDetails?.studentSemester || '',
      studentStatus: studentDetails?.studentStatus || 'active',
      studentImage: studentDetails?.studentImage || '', // ✅ Add studentImage to form
    },
    resolver: yupResolver(editStudentValidation),
  });

  // Store dateOfAdmission in a ref to preserve it across updates
  const dateOfAdmissionRef = React.useRef<string | null | undefined>(undefined);

  // Update form when student details load
  useEffect(() => {
    if (studentDetails) {
      console.log('🔍 === LOADING STUDENT DETAILS ===');
      console.log('🔍 Full studentDetails object:', JSON.stringify(studentDetails, null, 2));
      console.log('🔍 Raw dateOfAdmission:', studentDetails.dateOfAdmission);
      console.log('🔍 Raw dateOfAdmission type:', typeof studentDetails.dateOfAdmission);
      console.log('🔍 Raw studentDateOfBirth:', studentDetails.studentDateOfBirth);
      console.log('🔍 Raw studentDateOfBirth type:', typeof studentDetails.studentDateOfBirth);
      
      const dobDate = parseDateForInput(studentDetails.studentDateOfBirth);
      
      // Use stored dateOfAdmission if backend doesn't return it
      let admissionDateValue = studentDetails.dateOfAdmission;
      if (!admissionDateValue && dateOfAdmissionRef.current) {
        admissionDateValue = dateOfAdmissionRef.current;
        console.log('📌 Using stored dateOfAdmission from ref:', dateOfAdmissionRef.current);
      }
      
      const admissionDate = parseDateForInput(admissionDateValue);
      
      // Store the dateOfAdmission value in ref for future use
      if (admissionDate && admissionDate instanceof Date && !isNaN(admissionDate.getTime())) {
        dateOfAdmissionRef.current = formatDateForAPI(admissionDate);
      } else if (studentDetails.dateOfAdmission) {
        dateOfAdmissionRef.current = studentDetails.dateOfAdmission;
      }
      
      console.log('📅 === DATE PARSING RESULTS ===');
      console.log('📅 Parsed DOB:', dobDate);
      console.log('📅 Parsed DOB type:', dobDate instanceof Date ? 'Date' : typeof dobDate);
      console.log('📅 Parsed Admission:', admissionDate);
      console.log('📅 Parsed Admission type:', admissionDate instanceof Date ? 'Date' : typeof admissionDate);
      console.log('📅 Stored dateOfAdmission in ref:', dateOfAdmissionRef.current);
      
      const formData = {
        studentFirstName: studentDetails.studentFirstName || '',
        studentLastName: studentDetails.studentLastName || '',
        studentEmail: studentDetails.studentEmail || '',
        studentContact: studentDetails.studentContact || '',
        studentFatherName: studentDetails.studentFatherName || '',
        studentFatherContact: studentDetails.studentFatherContact || '',
        studentAddress: studentDetails.studentAddress || '',
        studentGender: studentDetails.studentGender || '',
        studentDateOfBirth: dobDate,
        dateOfAdmission: admissionDate,
        studentImage: studentDetails.studentImage || '',
        collegeName: studentDetails.studentCollage || '',
        collegeCourse: studentDetails.studentCourse || '',
        departmentName: studentDetails.studentDepartmentName || '',
        collegeSemester: studentDetails.studentSemester || '',
        studentStatus: studentDetails.studentStatus || 'active',
      };
      
      console.log('📝 === FORM DATA BEING SET ===');
      console.log('📝 dateOfAdmission in form:', formData.dateOfAdmission);
      console.log('📝 studentDateOfBirth in form:', formData.studentDateOfBirth);
      
      handler.reset(formData);
      
      console.log('✅ === FORM RESET COMPLETE ===');
      console.log('✅ Form dateOfAdmission value:', handler.getValues('dateOfAdmission'));
      console.log('✅ Form studentDateOfBirth value:', handler.getValues('studentDateOfBirth'));
    }
  }, [studentDetails, handler]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const previousStatus = studentDetails?.studentStatus || 'active';
      const newStatus = values.studentStatus;

      // Build studentDynamicFields from customFields
      const studentDynamicFields = customFields.map((field: any, index: number) => {
        const fieldName = Object.keys(field).find(key => key !== 'type') || '';
        const fieldValue = field[fieldName];
        const fieldType = field.type || 'text';
        
        // Get the value from form if it exists, otherwise use existing value
        const formFieldName = `customField_${index}`;
        const allFormValues = handler.getValues();
        const formValue = (allFormValues as any)[formFieldName];
        
        const dynamicField: any = {};
        if (fieldName) {
          dynamicField[fieldName] = formValue !== undefined && formValue !== '' ? formValue : fieldValue || '';
        }
        dynamicField.type = fieldType;
        
        return dynamicField;
      });

      // Merge existing student data with updated values
      console.log('🔄 === PREPARING UPDATE PAYLOAD ===');
      console.log('🔄 Form values.dateOfAdmission:', values.dateOfAdmission);
      console.log('🔄 Form values.dateOfAdmission type:', typeof values.dateOfAdmission);
      console.log('🔄 Form values.studentDateOfBirth:', values.studentDateOfBirth);
      console.log('🔄 Form values.studentDateOfBirth type:', typeof values.studentDateOfBirth);
      console.log('🔄 Existing studentDetails.dateOfAdmission:', studentDetails.dateOfAdmission);
      
      // Format dates properly - preserve existing date if not changed
      const formattedDOB = formatDateForAPI(values.studentDateOfBirth);
      const formattedAdmission = formatDateForAPI(values.dateOfAdmission);
      
      // Check if user actually selected a date (not just empty/null)
      const hasNewAdmissionDate = values.dateOfAdmission && 
        values.dateOfAdmission !== null && 
        values.dateOfAdmission !== undefined &&
        !isNaN(new Date(values.dateOfAdmission).getTime());
      
      // Use stored dateOfAdmission from ref if backend doesn't return it
      const storedDateOfAdmission = dateOfAdmissionRef.current 
        ? formatDateForAPI(dateOfAdmissionRef.current) 
        : null;
      
      // Only include dateOfAdmission in payload if:
      // 1. User selected a new date, OR
      // 2. Existing date exists in studentDetails, OR
      // 3. Stored date exists in ref (from previous load)
      const finalDateOfAdmission = hasNewAdmissionDate 
        ? formattedAdmission 
        : (studentDetails.dateOfAdmission 
            ? formatDateForAPI(studentDetails.dateOfAdmission) 
            : storedDateOfAdmission);
      
      // Update ref with the final value
      if (finalDateOfAdmission) {
        dateOfAdmissionRef.current = finalDateOfAdmission;
      }
      
      console.log('📅 === DATE FORMATTING RESULTS ===');
      console.log('📅 formattedDOB:', formattedDOB);
      console.log('📅 formattedAdmission:', formattedAdmission);
      console.log('📅 hasNewAdmissionDate:', hasNewAdmissionDate);
      console.log('📅 studentDetails.dateOfAdmission:', studentDetails.dateOfAdmission);
      console.log('📅 storedDateOfAdmission from ref:', storedDateOfAdmission);
      console.log('📅 dateOfAdmissionRef.current:', dateOfAdmissionRef.current);
      console.log('📅 Final dateOfAdmission to send:', finalDateOfAdmission);
      
      const updatePayload: any = {
        rollNo: studentDetails.rollNo,
        studentFirstName: values.studentFirstName,
        studentLastName: values.studentLastName,
        studentEnrollmentNumber: studentDetails?.studentEnrollmentNumber || studentDetails?.enrollmentNumber || '',
        studentEmail: values.studentEmail,
        studentContact: values.studentContact,
        studentFatherName: values.studentFatherName,
        studentFatherContact: values.studentFatherContact,
        studentAddress: values.studentAddress,
        studentGender: values.studentGender,
        studentDateOfBirth: formattedDOB,
        collegeName: values.collegeName,
        collegeCourse: values.collegeCourse,
        departmentName: values.departmentName,
        collegeSemester: values.collegeSemester,
        studentStatus: newStatus,
        studentImage: values.studentImage || studentDetails?.studentImage || '', // ✅ Add studentImage to payload
        // Map form fields to API fields
        studentCollage: values.collegeName,
        studentCourse: values.collegeCourse,
        studentDepartmentName: values.departmentName,
        studentSemester: values.collegeSemester,
        studentDynamicFields: studentDynamicFields,
      };
      
      // Only include dateOfAdmission if it has a valid value
      // This prevents clearing the date if backend doesn't return it
      if (finalDateOfAdmission !== undefined && finalDateOfAdmission !== null && finalDateOfAdmission !== '') {
        updatePayload.dateOfAdmission = finalDateOfAdmission;
      }

      console.log('📝 === FINAL UPDATE PAYLOAD ===');
      console.log('📝 Full Payload:', JSON.stringify(updatePayload, null, 2));
      console.log('📝 dateOfAdmission in payload:', updatePayload.dateOfAdmission);
      console.log('📝 studentDateOfBirth in payload:', updatePayload.studentDateOfBirth);

      const response = await updateStudent(updatePayload);
      
      console.log('📝 === UPDATE RESPONSE ===');
      console.log('📝 Full Response:', JSON.stringify(response, null, 2));
      console.log('📝 Response data:', response?.data);
      console.log('📝 Response statusCode:', response?.statusCode || response?.status);
      
      // Handle response structure - could be response.data or response directly
      const responseData = (response as any)?.data || response;
      const statusCode =
        (response as any)?.statusCode ??
        (responseData as any)?.statusCode ??
        (response as any)?.status;
      
      // Store dateOfAdmission in ref after successful update
      if (statusCode === 200 || statusCode === 201) {
        // If we sent dateOfAdmission, store it in ref
        if (finalDateOfAdmission) {
          dateOfAdmissionRef.current = finalDateOfAdmission;
          console.log('💾 Stored dateOfAdmission in ref after update:', finalDateOfAdmission);
        }
        // Also check if response contains dateOfAdmission
        const responseDateOfAdmission = (responseData as any)?.dateOfAdmission || (responseData as any)?.data?.dateOfAdmission;
        if (responseDateOfAdmission) {
          dateOfAdmissionRef.current = responseDateOfAdmission;
          console.log('💾 Stored dateOfAdmission from response:', responseDateOfAdmission);
        }
        
        const statusChanged = previousStatus !== newStatus;

        if (statusChanged) {
          // 1) Call deleteStudentDetails API to update status on main student record
          try {
            const deletePayload = {
              user: {
                userCustomerId: authUser?.customerId || '',
                userCustomerName: authUser?.customerName || '',
                userCustomerEmail: authUser?.customerEmail || '',
                roleName: (selectedOrganization as any)?.role?.roleName || '',
                roleId: (selectedOrganization as any)?.role?.roleId || '',
                userEmployeeId: selectedOrganization?.organizationId || '',
              },
              customerId: selectedOrganization?.customerId || '',
              rollNo: studentDetails.rollNo,
              organizationId: selectedOrganization?.organizationId || '',
              studentStatus: newStatus,
            };

            console.log('🗑️ === STATUS UPDATE VIA DELETE STUDENT CALL ===');
            console.log('Payload:', JSON.stringify(deletePayload, null, 2));
            const deleteResp = await deleteStudent(deletePayload);
            console.log('🗑️ Status update response:', deleteResp);
          } catch (deleteError) {
            console.log('⚠️ Error while updating status via deleteStudentDetails:', deleteError);
          }

          // 2) Call updateStudentAndBatchInCourse for each course (if any)
          try {
            const courses = (studentDetails as any)?.courses || [];
            if (Array.isArray(courses) && courses.length > 0) {
              for (const course of courses) {
                if (!course?.courseId) continue;

                await updateStudentAndBatchInCourse({
                  courseId: course.courseId,
                  rollNo: studentDetails.rollNo,
                  studentStatus: newStatus,
                });
              }
            }
          } catch (courseError) {
            console.log('⚠️ Error while updating student & batch in course:', courseError);
          }
        }

        // Invalidate student related queries so that listing/profile screens get fresh data
        try {
          const rollNo = studentDetails?.rollNo || studentData?.rollNo || updatePayload.rollNo;
          if (rollNo) {
            await queryClient.invalidateQueries({
              queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, rollNo],
            });
          }
          // Also refresh student list (if any screen uses it)
          await queryClient.invalidateQueries({
            queryKey: [apiUrls.student.FETCH_ALL_STUDENTS],
          });
        } catch (e) {
          console.log('⚠️ Error invalidating student queries', e);
        }

        Alert.alert(
          'Success', 
          'Student details updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(responseData?.message || response?.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update student details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const onCancel = () => {
    navigation.goBack();
  };
  if (isLoading) {
    return (
      <SafeView>
        <AppHeader
          title="Edit Student"
          handleBackClick={() => navigation.goBack()}
          showDrawer={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <ScalableText style={styles.loadingText} fontFamily="Medium">Loading student details...</ScalableText>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <AppHeader
        title="Edit Student"
        handleBackClick={() => navigation.goBack()}
        showDrawer={false}
      />
      <View style={styles.screenRoot}>
        <View style={styles.formCard}>
          <ThemeScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <ScalableText style={styles.sectionTitle} fontFamily="Medium">
              Edit Student's Information
            </ScalableText>
            <ScalableText style={styles.stepIndicator} fontFamily="Regular">
              Update Student Information
            </ScalableText>
            
            {/* Student Image Section */}
                         <View style={styles.inputSpacing}>
               <ScalableText style={styles.inputLabel} fontFamily="Medium">
                 First Name*
               </ScalableText>
               <Input
                 handler={handler}
                 name="studentFirstName"
                 label="Enter first name"
                 containerStyles={styles.inputContainer}
                 placeholder="Enter first name"
                 onChangeText={(text) => {
                   // Remove numbers and special characters, keep only alphabets and spaces
                   const cleanText = text.replace(/[^A-Za-z\s]/g, '');
                   handler.setValue('studentFirstName', cleanText);
                 }}
               />
             </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Last Name
              </ScalableText>
              <Input
                handler={handler}
                name="studentLastName"
                label="Enter last name"
                containerStyles={styles.inputContainer}
                placeholder="Enter last name"
                onChangeText={(text) => {
                  // Remove numbers and special characters, keep only alphabets and spaces
                  const cleanText = text.replace(/[^A-Za-z\s]/g, '');
                  handler.setValue('studentLastName', cleanText);
                }}
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Email
              </ScalableText>
              <Input
                handler={handler}
                name="studentEmail"
                label="Enter email address"
                containerStyles={styles.inputContainer}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Phone Number*
              </ScalableText>
              <Input
                handler={handler}
                name="studentContact"
                label="Enter phone number"
                keyboardType="phone-pad"
                containerStyles={styles.inputContainer}
                placeholder="Enter phone number"
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Father's Name
              </ScalableText>
              <Input
                handler={handler}
                name="studentFatherName"
                label="Enter father's name"
                containerStyles={styles.inputContainer}
                placeholder="Enter father's name"
                onChangeText={(text) => {
                  // Remove numbers and special characters, keep only alphabets and spaces
                  const cleanText = text.replace(/[^A-Za-z\s]/g, '');
                  handler.setValue('studentFatherName', cleanText);
                }}
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Father's Phone Number
              </ScalableText>
              <Input
                handler={handler}
                name="studentFatherContact"
                label="Enter father's phone number"
                keyboardType="phone-pad"
                containerStyles={styles.inputContainer}
                placeholder="Enter father's phone number"
                maxLength={10}
                onChangeText={(text) => {
                  // Remove any non-digit characters
                  const cleanText = text.replace(/\D/g, '');
                  // Limit to 10 digits
                  const limitedText = cleanText.slice(0, 10);
                  handler.setValue('studentFatherContact', limitedText);
                }}
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Address
              </ScalableText>
              <Input
                handler={handler}
                name="studentAddress"
                label="Enter address"
                containerStyles={styles.inputContainer}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Gender
              </ScalableText>
              <ControlledSelect
                handler={handler}
                name="studentGender"
                label="Select gender"
                options={GENDER_OPTIONS}
                value={GENDER_OPTIONS.find(opt => opt.value === handler.watch('studentGender')) || { label: '', value: '' }}
                dropdownButtonStyle={styles.inputContainer}
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Date of Birth
              </ScalableText>
              <View style={styles.inputContainer}>
                <DateInput
                  handler={handler}
                  name="studentDateOfBirth"
                  label="Select date of birth"
                  inputRoot={styles.dateInputStyle}
                />
              </View>
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Date of Admission
              </ScalableText>
              <View style={styles.inputContainer}>
                <DateInput
                  handler={handler}
                  name="dateOfAdmission"
                  label="Select date of admission"
                  inputRoot={styles.dateInputStyle}
                />
              </View>
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                College Name
              </ScalableText>
              <Input
                handler={handler}
                name="collegeName"
                label="Enter college name"
                containerStyles={styles.inputContainer}
                placeholder="Enter college name"
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Course
              </ScalableText>
              <Input
                handler={handler}
                name="collegeCourse"
                label="Enter course"
                containerStyles={styles.inputContainer}
                placeholder="Enter course"
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Department Name
              </ScalableText>
              <Input
                handler={handler}
                name="departmentName"
                label="Enter department name"
                containerStyles={styles.inputContainer}
                placeholder="Enter department name"
              />
            </View>
            
            <View style={styles.inputSpacing}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Semester
              </ScalableText>
              <Input
                handler={handler}
                name="collegeSemester"
                label="Enter semester"
                containerStyles={styles.inputContainer}
                placeholder="Enter semester"
              />
            </View>
            
                         <View style={styles.inputSpacing}>
               <ScalableText style={styles.inputLabel} fontFamily="Medium">
                 Status
               </ScalableText>
               <ControlledSelect
                 handler={handler}
                 name="studentStatus"
                 label="Select status"
                 options={STATUS_OPTIONS}
                 value={STATUS_OPTIONS.find(opt => opt.value === handler.watch('studentStatus')) || { label: '', value: '' }}
                 dropdownButtonStyle={styles.inputContainer}
               />
             </View>
             
             {/* Student Image Section */}
             <View style={styles.inputSpacing}>
               <ScalableText style={styles.inputLabel} fontFamily="Medium">
                 Student Image
               </ScalableText>
               <View style={styles.imageContainer}>
                 <FileInputField
                   handler={handler}
                   name="studentImage"
                 />
               </View>
               {/* Image Preview */}
               {handler.watch('studentImage') && (
                 <View style={styles.imagePreviewContainer}>
                   <Image
                     source={{ uri: handler.watch('studentImage') }}
                     style={styles.imagePreview}
                     resizeMode="cover"
                   />
                 </View>
               )}
             </View>
             
             {/* Custom Fields Section */}
             {customFields.length > 0 && (
              <View style={styles.inputSpacing}>
                <ScalableText style={styles.inputLabel} fontFamily="Medium">
                  Custom Fields
                </ScalableText>
                {customFields.map((field: any, index: number) => {
                  const fieldName = Object.keys(field)[0];
                  const fieldValue = field[fieldName];
                  const fieldType = field.type;
                  
                  return (
                    <View key={index} style={styles.customFieldContainer}>
                      <View style={styles.customFieldHeader}>
                        <ScalableText style={styles.customFieldName} fontFamily="Medium">
                          {fieldName}
                        </ScalableText>
                        <View style={styles.fieldTypeContainer}>
                          <ScalableText style={styles.fieldType} fontFamily="Regular">
                            {fieldType.toUpperCase()}
                          </ScalableText>
                        </View>
                      </View>
                      
                                             <View style={styles.customFieldContent}>
                         {fieldType === 'media' || fieldType === 'Media' ? (
                           <FileInputField
                             handler={handler}
                             name={`customField_${index}`}
                           />
                         ) : (
                           <Input
                             handler={handler}
                             name={`customField_${index}`}
                             label={`Enter ${fieldName}`}
                             containerStyles={styles.inputContainer}
                             placeholder={`Enter ${fieldName}`}
                             defaultValue={fieldValue || ''}
                           />
                         )}
                       </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ThemeScrollView>
        </View>
        <View style={styles.buttonBelowCardWrapper}>
          <View style={styles.buttonRow}>
            <Button 
              title="CANCEL" 
              onPress={onCancel} 
              btnStyles={styles.cancelBtn}
              btnTxtStyles={styles.cancelBtnText}
            />
            <Button 
              title="SUBMIT" 
              onPress={handler.handleSubmit(onSubmit)} 
              btnStyles={styles.submitBtn}
              btnTxtStyles={styles.submitBtnText}
              disabled={isSubmitting || isPending}
            />
          </View>
        </View>
      </View>
      
      {(isSubmitting || isPending) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ScalableText style={styles.loadingText} fontFamily="Medium">Updating student details...</ScalableText>
        </View>
      )}
    </SafeView>
  );
};

export default EditStudentScreen;

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
    marginBottom: 8,
    color: COLORS.black,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputSpacing: {
    marginBottom: 16,
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
  dateInputStyle: {
    marginTop: 0,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonBelowCardWrapper: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '90%',
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  cancelBtnText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: COLORS.black,
  },
  submitBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  submitBtnText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: COLORS.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: "Poppins-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Image styles
  imageContainer: {
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  // Custom field styles
  customFieldContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.whiteSmoke,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customFieldName: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  fieldTypeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fieldType: {
    fontSize: 10,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  customFieldContent: {
    marginTop: 4,
  },
}); 