import { StyleSheet } from "react-native";
import React, { FC, memo, useMemo } from "react";
import Flex from "../../../../../@ui/flex/Flex";
import { Col, Grid, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import CourseDetailRow from "./CourseDetailRow";
import Center from "../../../../../@ui/center/Center";
import { COLORS } from "../../../../../colors";
import { useCourseListsQuery } from "../../../../../apis/hooks/course/query/useCourseLists.query";
import { useBatchListsQuery } from "../../../../../apis/hooks/batch/query/useBatchLists.query";

interface ICourseDetailsTab {
  teacherId: string;
}

const CourseDetailsTab: FC<ICourseDetailsTab> = ({ teacherId }) => {
  const { data: coursesData, isLoading: coursesLoading } = useCourseListsQuery();
  const { data: batchesData, isLoading: batchesLoading } = useBatchListsQuery();

  // Filter courses where teacher is assigned to batches
  // Web logic: Check both batch-level teacher assignment AND subject-level teacher assignment
  const filteredCourses = useMemo(() => {
    if (coursesLoading || batchesLoading) return [];

    if (
      coursesData?.statusCode === 200 &&
      Array.isArray(coursesData.data) &&
      batchesData?.statusCode === 200 &&
      Array.isArray(batchesData.data)
    ) {
      const allCourses = coursesData.data as any[];
      const allBatches = batchesData.data as any[];

      // Find all batchIds where this teacher is assigned
      // Check both:
      // 1. Batch-level: batch.teacher array
      // 2. Subject-level: batch.subjects[].teacherId
      const teacherBatchIds = new Set<string>();
      allBatches.forEach((batch) => {
        let isTeacherAssigned = false;
        let assignmentType = "";

        // Check batch-level teacher assignment
        if (
          Array.isArray(batch.teacher) &&
          batch.teacher.some(
            (t: any) => t.teacherId === teacherId && t.teacherStatus === "active"
          )
        ) {
          isTeacherAssigned = true;
          assignmentType = "batch-level";
        }

        // Check subject-level teacher assignment
        if (!isTeacherAssigned && Array.isArray(batch.subjects)) {
          const hasTeacherInSubject = batch.subjects.some((subject: any) => {
            // Subject can be string (subjectId) or object {subjectId, teacherId, ...}
            if (typeof subject === "object" && subject.teacherId) {
              return subject.teacherId === teacherId;
            }
            return false;
          });
          if (hasTeacherInSubject) {
            isTeacherAssigned = true;
            assignmentType = "subject-level";
          }
        }

        if (isTeacherAssigned) {
          teacherBatchIds.add(batch.batchId);
          console.log(
            `✅ Teacher ${teacherId} assigned to batch ${batch.batchName} (${batch.batchId}) via ${assignmentType}`
          );
        }
      });

      console.log(
        `📊 Teacher ${teacherId} - Found ${teacherBatchIds.size} batches with teacher assignment`
      );

      // Filter courses that have batches where teacher is assigned
      const coursesWithTeacherBatches = allCourses.filter((course) => {
        if (!Array.isArray(course.batch)) return false;
        const hasMatchingBatch = course.batch.some((batch: any) =>
          teacherBatchIds.has(batch.batchId)
        );
        if (hasMatchingBatch) {
          console.log(
            `📚 Course "${course.courseName}" (${course.courseId}) has batches with teacher assignment`
          );
        }
        return hasMatchingBatch;
      });

      console.log(
        `📚 Teacher ${teacherId} - Found ${coursesWithTeacherBatches.length} courses with teacher batches`
      );

      // Create a map of batchId to batchName for display
      const batchNameMap = new Map<string, string>();
      allBatches.forEach((batch) => {
        batchNameMap.set(batch.batchId, batch.batchName);
      });

      // Return courses with batch information
      return coursesWithTeacherBatches.map((course) => {
        const courseBatches = course.batch
          .filter((b: any) => teacherBatchIds.has(b.batchId))
          .map((b: any) => ({
            batchId: b.batchId,
            batchName: batchNameMap.get(b.batchId) || b.batchId,
            batchStatus: b.batchStatus,
          }));

        return {
          ...course,
          teacherBatches: courseBatches,
        };
      });
    }

    return [];
  }, [coursesData, batchesData, coursesLoading, batchesLoading, teacherId]);

  const isLoading = coursesLoading || batchesLoading;

  return (
    <Flex mt={5}>
      <Grid>
        <Row style={styles.headerRow}>
          <Col size={25}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Course Name
            </ScalableText>
          </Col>
          <Col size={25}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              {"Course\nFee"}
            </ScalableText>
          </Col>
          <Col size={30}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              {"Max\nPayment\nInstallment"}
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Course Status
            </ScalableText>
          </Col>
        </Row>
        {isLoading && (
          <Center styles={{ minHeight: 350 }}>
            <ScalableText
              fontFamily="Medium"
              style={{ color: COLORS.black, fontSize: 14 }}
            >
              Loading...
            </ScalableText>
          </Center>
        )}
        {!isLoading && filteredCourses.length === 0 && (
          <Center styles={{ minHeight: 350 }}>
            <ScalableText
              fontFamily="Medium"
              style={{ color: COLORS.black, fontSize: 14 }}
            >
              No data found
            </ScalableText>
          </Center>
        )}
        {!isLoading &&
          filteredCourses.map((course, index) => (
            <CourseDetailRow
              course={course}
              key={course.courseId || `course-${index}`}
            />
          ))}
      </Grid>
    </Flex>
  );
};

export default memo(CourseDetailsTab);

const styles = StyleSheet.create({
  headerRow: {
    borderBottomWidth: 1,
    borderColor: "#030303",
    paddingVertical: 20,
  },
  headerText: {
    color: "#1B1A1A",
    fontSize: 14,
  },
});




// import { StyleSheet } from "react-native";
// import React, { FC, memo, useEffect } from "react";
// import Flex from "../../../../../@ui/flex/Flex";
// import { Col, Grid, Row } from "react-native-easy-grid";
// import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
// import CourseDetailRow from "./CourseDetailRow";
// import Center from "../../../../../@ui/center/Center";
// import { COLORS } from "../../../../../colors";
// import { useFetchTeacherDetailsMutation } from "../../../../../apis/hooks/teachers/mutation/useFetchTeacherDetailsMutation";
// import { useCourseListsQuery } from "../../../../../apis/hooks/course/query/useCourseLists.query";

// interface ICourseDetailsTab {
//   teacherId: string;
// }

// const CourseDetailsTab: FC<ICourseDetailsTab> = ({ teacherId }) => {
//   // Teacher API (customerId, organizationId auto injected)
//   const {
//     mutate: fetchTeacherDetails,
//     data: teacherRes,
//     isLoading: teacherLoading,
//   } = useFetchTeacherDetailsMutation();

//   // Course List API
//   const {
//     data: courseRes,
//     isLoading: courseLoading,
//   } = useCourseListsQuery();

//   useEffect(() => {
//     console.log("🔥 useEffect CALLED");
//     fetchTeacherDetails({
//       teacherId: "NTO-d7523",
//       customerId: "08107b64-2973-4800-bd05-40f11bf1e2e1",
//       organizationId: "NTO-482939",
//     });
//   }, []);

//   // 1. Teacher batchIds
//   const teacherBatchIds =
//     teacherRes?.data?.batch?.map((b) => b.batchId) || [];

//   // 2. Filter courses by batchId
//   const filteredCourses =
//     courseRes?.data?.filter((course) =>
//       course.batch?.some((b) =>
//         teacherBatchIds.includes(b.batchId)
//       )
//     ) || [];

//   // 3. Only required fields
//   const finalCourses = filteredCourses.map((c) => ({
//     courseId: c.courseId,
//     courseName: c.courseName,
//     courseFee: c.courseFee,
//     maxPaymentInstallment: c.maxPaymentInstallment,
//     courseStatus: c.courseStatus,
//   }));

//   return (
//     <Flex mt={5}>
//       <Grid>
//         <Row style={styles.headerRow}>
//           <Col size={25}>
//             <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//               Course Name
//             </ScalableText>
//           </Col>
//           <Col size={25}>
//             <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//               {"Course\nFee"}
//             </ScalableText>
//           </Col>
//           <Col size={30}>
//             <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//               {"Max\nPayment\nInstallment"}
//             </ScalableText>
//           </Col>
//           <Col size={20}>
//             <ScalableText fontFamily="SemiBold" style={styles.headerText}>
//               Course Status
//             </ScalableText>
//           </Col>
//         </Row>

//         {finalCourses.length === 0 && !teacherLoading && !courseLoading && (
//           <Center styles={{ minHeight: 350 }}>
//             <ScalableText
//               fontFamily="Medium"
//               style={{ color: COLORS.black, fontSize: 14 }}
//             >
//               No data found
//             </ScalableText>
//           </Center>
//         )}

//         {finalCourses.map((course) => (
//           <CourseDetailRow course={course} key={course.courseId} />
//         ))}
//       </Grid>
//     </Flex>
//   );
// };

// export default memo(CourseDetailsTab);

// const styles = StyleSheet.create({
//   headerRow: {
//     borderBottomWidth: 1,
//     borderColor: "#030303",
//     paddingVertical: 20,
//   },
//   headerText: {
//     color: "#1B1A1A",
//     fontSize: 14,
//   },
// });

