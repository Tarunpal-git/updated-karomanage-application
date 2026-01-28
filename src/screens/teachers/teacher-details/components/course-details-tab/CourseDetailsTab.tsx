import { StyleSheet } from "react-native";
import React, { FC, memo } from "react";
import Flex from "../../../../../@ui/flex/Flex";
import { Col, Grid, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import CourseDetailRow from "./CourseDetailRow";
import Center from "../../../../../@ui/center/Center";
import { COLORS } from "../../../../../colors";

interface ICourseDetailsTab {
  courses: TTeacherCourses[];
}

const CourseDetailsTab: FC<ICourseDetailsTab> = ({ courses }) => {
  const filteredCourseList = courses.filter(
    (obj) => Object.keys(obj).length > 0
  );
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
        {filteredCourseList.length === 0 && (
          <Center styles={{ minHeight: 350 }}>
            <ScalableText
              fontFamily="Medium"
              style={{ color: COLORS.black, fontSize: 14 }}
            >
              No data found
            </ScalableText>
          </Center>
        )}
        {filteredCourseList.map((course) => (
          <CourseDetailRow courseId={course.courseId} key={course.courseId} />
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

