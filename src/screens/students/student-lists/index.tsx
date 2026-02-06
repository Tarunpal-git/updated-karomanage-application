// import React, { useMemo, useState, useEffect } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
// import Flex from "../../../@ui/flex/Flex";
// import SearchBar from "../../../@ui/search-bar/SearchBar";
// import FilterButton from "./component/FilterButton";
// import PaymentCards from "./component/PaymentCards";
// import { Col, Grid } from "react-native-easy-grid";
// import StudentFilterSelect from "./component/StudentFilterSelect";
// import GridTable from "../../../@ui/table/GridTable";
// import { studentColumns } from "./component/tableColumns";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { View, StyleSheet } from "react-native";
// import { TTableColumns } from "../../../types/table/tableColomuns";

// import { useStudentsListQuery } from "../../../apis/hooks/students/query/useStudentsList.query";
// import { useCourseListsQuery } from "../../../apis/hooks/course/query/useCourseLists.query";
// import { useBatchListsQuery } from "../../../apis/hooks/batch/query/useBatchLists.query";
// import { filteredStudentData } from "./utils/filteredStudentData";
// import Avatar from "../../../@ui/avatar/Avatar";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import Button from "../../../@ui/button/Button";
// import PaymentRestrictionNotice from "../../../@ui/restriction/PaymentRestrictionNotice";
// import { hasCreatePermission, hasOnlyReadPermission } from "../../../utils/fetchPermissionsTitle";

// const StudentLists = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const route = useRoute();
//   const hidePaymentInfo = hasOnlyReadPermission("Student");

//   const { data: courseData } = useCourseListsQuery();
//   const { data: batchData } = useBatchListsQuery();

//   // getting select values for course data

//   const COURSES_LIST: TSelectOptions[] = useMemo(() => {
//     if (courseData && courseData.statusCode === 200 && Array.isArray(courseData.data)) {
//       return courseData.data.map((course: TCourseData) => ({
//         label: course.courseName,
//         value: course.courseId,
//       }));
//     }
//     return [];
//   }, [courseData]);

//   const BATCHES_LIST: TSelectOptions[] = useMemo(() => {
//     if (batchData && batchData.statusCode === 200 && Array.isArray(batchData.data)) {
//       return batchData.data.map((batch: TBatchData) => ({
//         label: batch.batchName,
//         value: batch.batchId,
//       }));
//     }
//     return [];
//   }, [batchData]);

//   const [filters, setFilters] = useState({
//     search: "",
//     studentStatus: "",
//     paymentStatus: "",
//     courseName: "",
//     batchName: "",
//   });

//   const [visibleColumns, setVisibleColumns] = useState<
//     { label: string; key: string }[]
//   >([
//     { label: "Student Enrollment", key: "studentEnrollment" },
//     { label: "Student Name", key: "studentName" },
//     { label: "Mobile Number", key: "studentContact" },
//   ]);

//   const tableColumns = useMemo(() => {
//     const columns = [...studentColumns];

//     // Perform the unshift operation on the copied array
//     columns.unshift({
//       key: "studentEnrollment",
//       label: "Student Enrollment",
//       field: "studentEnrollment",
//       minWidth: 130,
//       hidden: true,
//       renderCell: (row) => (
//         <Flex>
//           <Avatar content={row.studentEnrollmentNumber} />
//           <ScalableText
//             fontFamily="Regular"
//             style={{ fontSize: 12, marginLeft: 5 }}
//           >
//             {row.studentEnrollmentNumber}
//           </ScalableText>
//         </Flex>
//       ),
//     });
//     return columns.filter((column) =>
//       visibleColumns.some((visibleColumn) => visibleColumn.key === column.key)
//     );
//   }, [visibleColumns, studentColumns]);

//   const { isLoading, data, refetch } = useStudentsListQuery({
//     studentStatus: filters.studentStatus || undefined,
//     paymentStatus: filters.paymentStatus || undefined,
//     courseName: filters.courseName || undefined,
//     batchName: filters.batchName || undefined,
//   });

//   // Handle refresh parameter from navigation
//   useEffect(() => {
//     const params = route.params as { refresh?: boolean } | undefined;
//     if (params?.refresh) {
//       console.log('🔄 Refreshing student list due to new admission');
//       refetch();
//       // Clear the refresh parameter
//       navigation.setParams({ refresh: undefined });
//     }
//   }, [route.params, refetch, navigation]);

//   // Refresh data when screen comes into focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       console.log('🔄 Screen focused, refreshing student list');
//       refetch();
//     });

//     return unsubscribe;
//   }, [navigation, refetch]);

//   const studentsList: TStudentList[] = useMemo(() => {
//     if (!isLoading && data && data.statuscode === 200 && Array.isArray(data.data)) {
//       // New API studentFilterListV2 can return a summary object as first element.
//       // Filter out any entries that don't look like real student records.
//       const raw = data.data as any[];
//       const onlyStudents = raw.filter(
//         (item) =>
//           item &&
//           (item.studentEnrollmentNumber || item.rollNo || item.studentFirstName)
//       );

//       return filteredStudentData(onlyStudents as unknown as TStudentList[], filters);
//     } else {
//       return [];
//     }
//   }, [isLoading, data, filters]);

//   const totalPaymentDetails = useMemo(() => {
//     // 1) Try to use new summary fields from studentFilterListV2 (backend sample)
//     // Expected shape:
//     // data: [{ totalReceivedPayment, totalDuePayment, ... }]
//     const summary = Array.isArray(data?.data) ? (data!.data as any[])[0] : undefined;

//     if (summary && typeof summary.totalReceivedPayment === "number" && typeof summary.totalDuePayment === "number") {
//       return {
//         totalReceivedPayment: summary.totalReceivedPayment,
//         totalDuePayment: summary.totalDuePayment,
//       };
//     }

//     // 2) Fallback to old logic using per-student allPaymentDetails
//     let totalReceivedPayment = 0;
//     let totalDuePayment = 0;

//     studentsList.forEach((student) => {
//       if (filters.courseName) {
//         student.courses.forEach((course) => {
//           if (course.courseId === filters.courseName && course.paymentDetails) {
//             totalDuePayment += course.paymentDetails.totalDuePayment || 0;
//             totalReceivedPayment +=
//               (course.paymentDetails.totalReceivedPayment || 0) -
//               (course.paymentDetails.refundAmount || 0); // Subtract refund;
//           }
//         });
//       } else if (student.allPaymentDetails) {
//         totalDuePayment += student.allPaymentDetails.totalDuePayment || 0;
//         totalReceivedPayment +=
//           (student.allPaymentDetails.totalReceivedPayment || 0) -
//           (student.allPaymentDetails.grandRefundAmount || 0); // Subtract refund;
//       }
//     });

//     return {
//       totalReceivedPayment,
//       totalDuePayment,
//     };
//   }, [studentsList, filters, data]);

//   return (
//     <SafeView>
//       <AppHeader
//         title="Student List"
//         handleBackClick={() => navigation.navigate("Home")}
//       />
//       <Flex mx={25} my={14}>
//         <SearchBar
//           value={filters.search}
//           onChange={(e) =>
//             setFilters((previous) => ({ ...previous, search: e }))
//           }
//         />
//         <FilterButton
//           setVisibleColumns={setVisibleColumns}
//           visibleColumns={visibleColumns}
//         />
//       </Flex>

//       {/* Add Student Button - right after search bar */}
//       {hasCreatePermission("Student") && (
//         <Flex mb={2} mt={2} flexDirection="row" justify="flex-end" mx={25}>
//           <Button
//             title="Add Student"
//             onPress={() => navigation.navigate("StudentAdmission" as any)}
//             btnStyles={{ width: 110, height: 34, borderRadius: 8 }}
//             btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
//           />
//         </Flex>
//       )}

//       {hidePaymentInfo ? (
//         <PaymentRestrictionNotice
//           variant="inline"
//           containerStyle={{ marginHorizontal: 25, marginBottom: 10 }}
//           description="You don’t have permission to view the course payments."
//         />
//       ) : (
//         <Flex mx={25}>
//           <PaymentCards
//             containerStyles={{ marginRight: 7 }}
//             amount={totalPaymentDetails.totalReceivedPayment}
//             textVariant="success"
//             title="Received Payment"
//           />

//           <PaymentCards
//             containerStyles={{ marginLeft: 7 }}
//             amount={totalPaymentDetails.totalDuePayment}
//             textVariant="error"
//             title="Due Payment"
//           />
//         </Flex>
//       )}
//       <View style={{ marginBottom: 25 }}>
//         <Grid
//           style={{
//             flexWrap: "wrap",
//             marginHorizontal: 10,
//             marginVertical: 30,
//           }}
//         >
//           <Col>
//             <StudentFilterSelect
//               onChange={(e) =>
//                 setFilters((previous) => ({ ...previous, studentStatus: e }))
//               }
//               label="Student Status"
//               options={[
//                 { label: "Active", value: "active" },
//                 { label: "Inactive", value: "inActive" },
//                 { label: "Defaulter", value: "defaulter" },
//               ]}
//             />
//           </Col>
//           <Col>
//             <StudentFilterSelect
//               onChange={(e) =>
//                 setFilters((previous) => ({ ...previous, paymentStatus: e }))
//               }
//               label="Payment Status"
//               options={[
//                 { label: "Paid", value: "paid" },
//                 { label: "Due", value: "due" },
//               ]}
//             />
//           </Col>
//           <Col>
//             <StudentFilterSelect
//               onChange={(e) =>
//                 setFilters((previous) => ({ ...previous, courseName: e }))
//               }
//               label="Course Name"
//               options={COURSES_LIST}
//             />
//           </Col>
//           <Col>
//             <StudentFilterSelect
//               onChange={(e) =>
//                 setFilters((previous) => ({ ...previous, batchName: e }))
//               }
//               label="Batch Name"
//               options={BATCHES_LIST}
//             />
//           </Col>
//         </Grid>
//       </View>

//       <ThemeScrollView paddingHorizontal={12} reloadData={refetch}>
//         <Flex styles={{ marginBottom: 20 }}>
//           <GridTable
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             data={studentsList}
//             columns={tableColumns as TTableColumns<unknown>[]}
//             isLoading={false}
//             columnHeight={50}
//             headerHeight={75}
//             fixedFirstElement
//             handleRowClick={(e: unknown) => {
//               const data = e as TStudentList;
//               navigation.navigate("StudentDetails", { rollNo: data.rollNo });
//             }}
//           />
//         </Flex>
//       </ThemeScrollView>
//     </SafeView>
//   );
// };

// const styles = StyleSheet.create({
//   // Removed fab styles since we're using regular button now
// });

// export default StudentLists;
import React, { useMemo, useState, useEffect } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
import Flex from "../../../@ui/flex/Flex";
import SearchBar from "../../../@ui/search-bar/SearchBar";
import FilterButton from "./component/FilterButton";
import PaymentCards from "./component/PaymentCards";
import { Col, Grid } from "react-native-easy-grid";
import StudentFilterSelect from "./component/StudentFilterSelect";
import GridTable from "../../../@ui/table/GridTable";
import { studentColumns } from "./component/tableColumns";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { TTableColumns } from "../../../types/table/tableColomuns";

import { useStudentsListQuery } from "../../../apis/hooks/students/query/useStudentsList.query";
import { useCourseListsQuery } from "../../../apis/hooks/course/query/useCourseLists.query";
import { useBatchListsQuery } from "../../../apis/hooks/batch/query/useBatchLists.query";
import { filteredStudentData } from "./utils/filteredStudentData";
import Avatar from "../../../@ui/avatar/Avatar";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import Button from "../../../@ui/button/Button";
import PaymentRestrictionNotice from "../../../@ui/restriction/PaymentRestrictionNotice";
import { hasCreatePermission, hasOnlyReadPermission } from "../../../utils/fetchPermissionsTitle";
import { COLORS } from "../../../colors";

const StudentLists = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const route = useRoute();
  const hidePaymentInfo = hasOnlyReadPermission("Student");

  const { data: courseData } = useCourseListsQuery();
  const { data: batchData } = useBatchListsQuery();

  // Helper function to capitalize first letter of first word
  const capitalizeFirstWord = (text: string): string => {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // getting select values for course data

  const COURSES_LIST: TSelectOptions[] = useMemo(() => {
    if (courseData && courseData.statusCode === 200 && Array.isArray(courseData.data)) {
      return courseData.data.map((course: TCourseData) => ({
        label: capitalizeFirstWord(course.courseName),
        value: course.courseId,
      }));
    }
    return [];
  }, [courseData]);

  const BATCHES_LIST: TSelectOptions[] = useMemo(() => {
    if (batchData && batchData.statusCode === 200 && Array.isArray(batchData.data)) {
      return batchData.data
        .filter((batch: TBatchData) => batch && batch.batchId && batch.batchName)
        .map((batch: TBatchData) => ({
          label: batch.batchName || "",
          value: batch.batchId,
          courses: Array.isArray(batch.courses) ? batch.courses : [], // Store all courses for filtering
        }));
    }
    return [];
  }, [batchData]);

  const [filters, setFilters] = useState({
    search: "",
    studentStatus: "",
    paymentStatus: "",
    paymentMode: "",
    paymentDateStart: "",
    paymentDateEnd: "",
    admissionDateStart: "",
    admissionDateEnd: "",
    courseName: "",
    batchName: "",
  });

  // Filter batches based on selected course
  const FILTERED_BATCHES_LIST: TSelectOptions[] = useMemo(() => {
    if (!filters.courseName) {
      return []; // No batches shown when no course is selected
    }
    return BATCHES_LIST.filter((batch: any) => {
      // Check if batch belongs to selected course by checking if any course in batch.courses matches
      if (!batch || !batch.courses || !Array.isArray(batch.courses) || batch.courses.length === 0) {
        return false;
      }
      return batch.courses.some((course: any) => {
        return course && course.courseId && course.courseId === filters.courseName;
      });
    });
  }, [BATCHES_LIST, filters.courseName]);

  const [visibleColumns, setVisibleColumns] = useState<
    { label: string; key: string }[]
  >([
    { label: "Student Enrollment", key: "studentEnrollment" },
    { label: "Student Name", key: "studentName" },
    { label: "Mobile Number", key: "studentContact" },
    { label: "Email", key: "studentEmail" },
    { label: "Student Status", key: "studentStatus" },
    { label: "Payment Status", key: "paymentStatus" },
  ]);

  const tableColumns = useMemo(() => {
    const columns = [...studentColumns];

    // Perform the unshift operation on the copied array
    columns.unshift({
      key: "studentEnrollment",
      label: "Student Enrollment",
      field: "studentEnrollment",
      minWidth: 130,
      hidden: true,
      renderCell: (row) => (
        <Flex>
          <Avatar content={row.studentEnrollmentNumber} />
          <ScalableText
            fontFamily="Regular"
            style={{ fontSize: 12, marginLeft: 5 }}
          >
            {row.studentEnrollmentNumber}
          </ScalableText>
        </Flex>
      ),
    });

    // Add Payment Status column
    columns.push({
      key: "paymentStatus",
      field: "paymentStatus",
      label: "Payment Status",
      minWidth: 120,
      renderCell: (row) => {
        try {
          // Payment status from student filter list v2 API - check in order:
          // 1. Direct paymentStatus field
          // 2. Direct allPaymentStatus field (from API response)
          // 3. allPaymentDetails.allPaymentStatus (fallback)
          const paymentStatus = row?.paymentStatus || row?.allPaymentStatus || row?.allPaymentDetails?.allPaymentStatus || "";
          const statusLower = paymentStatus ? String(paymentStatus).toLowerCase().trim() : "";
          const displayStatus = paymentStatus || "-";
          const isDue = statusLower === "due";
          
          return (
            <ScalableText
              fontFamily="SemiBold"
              style={{
                fontSize: 12,
                marginLeft: 5,
                textTransform: "capitalize",
                color: isDue ? COLORS.textError : COLORS.textSuccess,
              }}
            >
              {displayStatus}
            </ScalableText>
          );
        } catch (error) {
          console.error("Error rendering payment status:", error, row);
          return (
            <ScalableText
              fontFamily="SemiBold"
              style={{
                fontSize: 12,
                marginLeft: 5,
                color: COLORS.textSecondary,
              }}
            >
              -
            </ScalableText>
          );
        }
      },
    });

    return columns.filter((column) =>
      visibleColumns.some((visibleColumn) => visibleColumn.key === column.key)
    );
  }, [visibleColumns, studentColumns]);

  const apiFilters = useMemo(() => {
    const apiParams: any = {};
    
    if (filters.studentStatus) apiParams.studentStatus = filters.studentStatus;
    if (filters.paymentStatus) apiParams.paymentStatus = filters.paymentStatus;
    if (filters.paymentMode) apiParams.paymentMode = filters.paymentMode;
    if (filters.paymentDateStart) apiParams.paymentDateStart = filters.paymentDateStart;
    if (filters.paymentDateEnd) apiParams.paymentDateEnd = filters.paymentDateEnd;
    if (filters.admissionDateStart) apiParams.admissionDateStart = filters.admissionDateStart;
    if (filters.admissionDateEnd) apiParams.admissionDateEnd = filters.admissionDateEnd;
    
    // Only send courseId and batchId when batch is selected
    // Course select alone should not trigger filter, only batch select should
    if (filters.batchName && filters.courseName) {
      apiParams.courseId = filters.courseName; // courseName contains courseId value
      apiParams.batchId = filters.batchName; // batchName contains batchId value
    }

    console.log('🔍 API Filters being sent:', apiParams);
    return apiParams;
  }, [filters]);

  const { isLoading, data, refetch } = useStudentsListQuery(apiFilters);

  // Clear batch filter when course changes and selected batch doesn't belong to new course
  useEffect(() => {
    if (filters.courseName && filters.batchName) {
      const selectedBatch = FILTERED_BATCHES_LIST.find((batch) => batch.value === filters.batchName);
      if (!selectedBatch) {
        // Selected batch doesn't belong to selected course, clear it
        setFilters((previous) => ({ ...previous, batchName: "" }));
      }
    } else if (!filters.courseName && filters.batchName) {
      // If course is cleared, also clear batch
      setFilters((previous) => ({ ...previous, batchName: "" }));
    }
  }, [filters.courseName, FILTERED_BATCHES_LIST]);

  // Handle refresh parameter from navigation
  useEffect(() => {
    const params = route.params as { refresh?: boolean } | undefined;
    if (params?.refresh) {
      console.log('🔄 Refreshing student list due to new admission');
      refetch();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params, refetch, navigation]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Screen focused, refreshing student list');
      refetch();
    });

    return unsubscribe;
  }, [navigation, refetch]);

  const studentsList: TStudentList[] = useMemo(() => {
    console.log('📊 Student List Debug:', {
      isLoading,
      hasData: !!data,
      statuscode: data?.statuscode,
      dataLength: Array.isArray(data?.data) ? data.data.length : 0,
      filters,
    });

    if (!isLoading && data && data.statuscode === 200 && Array.isArray(data.data)) {
      // New API studentFilterListV2 can return a summary object as first element.
      // Filter out any entries that don't look like real student records.
      const raw = data.data as any[];
      console.log('📊 Raw data length:', raw.length);
      
      const onlyStudents = raw.filter(
        (item) =>
          item &&
          (item.studentEnrollmentNumber || item.rollNo || item.studentFirstName)
      );

      console.log('📊 Filtered students length:', onlyStudents.length);
      const finalList = filteredStudentData(onlyStudents as unknown as TStudentList[], filters);
      console.log('📊 Final students list length:', finalList.length);
      
      return finalList;
    } else {
      console.log('⚠️ No data or loading:', { isLoading, hasData: !!data, statuscode: data?.statuscode });
      return [];
    }
  }, [isLoading, data, filters]);

  // Extract all payment and student statistics from API response
  const paymentStatistics = useMemo(() => {
    // 1) Try to use new summary fields from studentFilterListV2 API
    // Expected shape: data: [{ totalReceivedPayment, totalDuePayment, totalStudents, ... }]
    const summary = Array.isArray(data?.data) ? (data!.data as any[])[0] : undefined;
    
    // Debug: Log API response summary
    if (summary) {
      console.log('📊 API Summary Data:', summary);
    }

    // Initialize default values
    let stats = {
      totalStudents: 0,
      totalReceivedPayment: 0,
      cashReceived: 0,
      onlineReceived: 0,
      unknownModePayment: 0,
      overduePayment: 0,
      upcomingPayment: 0,
      refundedStudents: 0,
      refundedAmount: 0,
      defaulterStudents: 0,
    };

    // If summary object exists, use it
    if (summary) {
      stats = {
        totalStudents: summary.totalStudents || summary.totalStudentCount || studentsList.length || 0,
        totalReceivedPayment: summary.totalReceivedPayment || 0,
        cashReceived: summary.cashReceived || summary.totalCashReceived || 0,
        onlineReceived: summary.onlineReceived || summary.totalOnlineReceived || 0,
        unknownModePayment: summary.unknownModePayment || summary.totalUnknownModePayment || 0,
        overduePayment: summary.overduePayment || summary.totalOverduePayment || summary.totalDuePayment || 0,
        upcomingPayment: summary.upcomingPayment || summary.totalUpcomingPayment || 0,
        refundedStudents: summary.refundedStudents || summary.totalRefundedStudents || 0,
        refundedAmount: summary.refundedAmount || summary.totalRefundedAmount || summary.grandRefundAmount || 0,
        defaulterStudents: summary.defaulterStudents || summary.totalDefaulterStudents || 0,
      };
    }

    // 2) Fallback: Calculate from studentsList if summary not available
    if (!summary || (!summary.totalReceivedPayment && !summary.totalDuePayment)) {
      let totalReceivedPayment = 0;
      let totalDuePayment = 0;
      let refundedAmount = 0;
      let defaulterCount = 0;
      let refundedStudentsCount = 0;

      studentsList.forEach((student) => {
        // Count defaulter students
        if (student.studentStatus === "defaulter") {
          defaulterCount++;
        }

        // Count refunded students
        if (student.refundList && student.refundList.length > 0) {
          refundedStudentsCount++;
        }

        if (filters.courseName) {
          student.courses.forEach((course) => {
            if (course.courseId === filters.courseName && course.paymentDetails) {
              totalDuePayment += course.paymentDetails.totalDuePayment || 0;
              totalReceivedPayment +=
                (course.paymentDetails.totalReceivedPayment || 0) -
                (course.paymentDetails.refundAmount || 0);
              refundedAmount += course.paymentDetails.refundAmount || 0;
            }
          });
        } else if (student.allPaymentDetails) {
          totalDuePayment += student.allPaymentDetails.totalDuePayment || 0;
          totalReceivedPayment +=
            (student.allPaymentDetails.totalReceivedPayment || 0) -
            (student.allPaymentDetails.grandRefundAmount || 0);
          refundedAmount += student.allPaymentDetails.grandRefundAmount || 0;
        }
      });

      // Update stats with calculated values
      stats.totalStudents = studentsList.length;
      stats.totalReceivedPayment = totalReceivedPayment;
      stats.overduePayment = totalDuePayment;
      stats.refundedAmount = refundedAmount;
      stats.defaulterStudents = defaulterCount;
      stats.refundedStudents = refundedStudentsCount;
    }

    return stats;
  }, [studentsList, filters, data]);

  return (
    <SafeView>
      <AppHeader
        title="Student List"
        handleBackClick={() => navigation.navigate("Home")}
      />
      <Flex mx={25} my={14}>
        <SearchBar
          value={filters.search}
          onChange={(e) =>
            setFilters((previous) => ({ ...previous, search: e }))
          }
        />
        <FilterButton
          filters={filters}
          setFilters={setFilters}
          coursesList={COURSES_LIST}
          batchesList={FILTERED_BATCHES_LIST}
        />
      </Flex>

      {/* Add Student Button - right after search bar */}
      {hasCreatePermission("Student") && (
        <Flex mb={2} mt={2} flexDirection="row" justify="flex-end" mx={25}>
          <Button
            title="Add Student"
            onPress={() => navigation.navigate("StudentAdmission" as any)}
            btnStyles={{ width: 110, height: 34, borderRadius: 8 }}
            btnTxtStyles={{ fontSize: 13, fontFamily: 'Poppins-Medium' }}
          />
        </Flex>
      )}

      {hidePaymentInfo ? (
        <PaymentRestrictionNotice
          variant="inline"
          containerStyle={{ marginHorizontal: 25, marginBottom: 10 }}
          description="You don't have permission to view the course payments."
        />
      ) : (
        <View style={styles.paymentCardsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
            snapToInterval={Dimensions.get('window').width * 0.75 + 14}
            decelerationRate="fast"
            pagingEnabled={false}
          >
            {/* Total Students */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.totalStudents}
              textVariant="primary"
              title="Total Students"
              showRupeeIcon={false}
              isNumber={true}
            />

            {/* Received Payment */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.totalReceivedPayment}
              textVariant="success"
              title="Received Payment"
            />

            {/* Cash Received */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.cashReceived}
              textVariant="primary"
              title="Cash Received"
            />

            {/* Online Received */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.onlineReceived}
              textVariant="primary"
              title="Online Received"
            />

            {/* Unknown Mode Payment */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.unknownModePayment}
              textVariant="warning"
              title="Unknown Mode Payment"
            />

            {/* Overdue Payment */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.overduePayment}
              textVariant="error"
              title="Overdue Payment"
            />

            {/* Upcoming Payment */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.upcomingPayment}
              textVariant="primary"
              title="Upcoming Payment"
            />

            {/* Refunded Students */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.refundedStudents}
              textVariant="error"
              title="Refunded Students"
              showRupeeIcon={false}
              isNumber={true}
            />

            {/* Refunded Amount */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.refundedAmount}
              textVariant="error"
              title="Refunded Amount"
            />

            {/* Defaulter Students */}
            <PaymentCards
              containerStyles={styles.cardStyle}
              amount={paymentStatistics.defaulterStudents}
              textVariant="error"
              title="Defaulter Students"
              showRupeeIcon={false}
              isNumber={true}
            />
          </ScrollView>
        </View>
      )}

      <ThemeScrollView paddingHorizontal={12} reloadData={refetch}>
        <Flex styles={{ marginBottom: 20 }}>
          <GridTable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={studentsList}
            columns={tableColumns as TTableColumns<unknown>[]}
            isLoading={false}
            columnHeight={50}
            headerHeight={75}
            fixedFirstElement
            handleRowClick={(e: unknown) => {
              const data = e as TStudentList;
              navigation.navigate("StudentDetails", { rollNo: data.rollNo });
            }}
          />
        </Flex>
      </ThemeScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  paymentCardsContainer: {
    marginVertical: 16,
    marginHorizontal: 0,
    paddingBottom: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 25,
    paddingLeft: 25,
  },
  cardStyle: {
    marginRight: 12,
    width: (Dimensions.get('window').width - 50 - 12) / 2, // Screen width - left/right padding (25*2) - margin between cards (12)
  },
});

export default StudentLists;
