import { StyleSheet } from "react-native";
import React, { FC, memo } from "react";
import { Col, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import Flex from "../../../../../@ui/flex/Flex";

interface ICourseDetailRow {
  course: any; // Course data from listCourses API
}

const CourseDetailRow: FC<ICourseDetailRow> = ({ course }) => {
  if (!course) {
    return null;
  }

  return (
    <Row style={styles.dataRow}>
      <Col size={25}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {course?.courseName || "-"}
        </ScalableText>
      </Col>
      <Col size={25}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {course?.courseFee ? course.courseFee.toLocaleString() : "-"}
        </ScalableText>
      </Col>
      <Col size={30}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {course?.maxPaymentInstallment || "-"}
        </ScalableText>
      </Col>
      <Col size={20}>
        <Flex
          styles={{
            ...styles.statusChip,
            backgroundColor:
              course?.courseStatus === "active" ? "#ECFFE0" : "#FFE3E3",
          }}
        >
          <ScalableText
            style={{
              ...styles.statusChipText,
              color: course?.courseStatus === "active" ? "#4AC400" : "#FF6363",
            }}
            fontFamily="Medium"
          >
            {course?.courseStatus || "-"}
          </ScalableText>
        </Flex>
      </Col>
    </Row>
  );
};

export default memo(CourseDetailRow);

const styles = StyleSheet.create({
  statusChip: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusChipText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  dataRow: {
    borderBottomWidth: 1,
    borderColor: "#D1D1D1",
    paddingVertical: 20,
  },
  dataText: {
    color: "#1B1A1A",
    fontSize: 12,

    textTransform: "capitalize",
  },
});







// import React from "react";
// import { Col, Row } from "react-native-easy-grid";
// import ScalableText from "../../../../../@ui/scalable-text/ScalableText";

// const CourseDetailRow = ({ course }) => {
//   return (
//     <Row style={{ paddingVertical: 15 }}>
//       <Col size={25}>
//         <ScalableText>{course.courseName}</ScalableText>
//       </Col>
//       <Col size={25}>
//         <ScalableText>{course.courseFee}</ScalableText>
//       </Col>
//       <Col size={30}>
//         <ScalableText>{course.maxPaymentInstallment}</ScalableText>
//       </Col>
//       <Col size={20}>
//         <ScalableText>{course.courseStatus}</ScalableText>
//       </Col>
//     </Row>
//   );
// };

// export default CourseDetailRow;
