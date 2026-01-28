import { StyleSheet } from "react-native";
import React, { FC, memo, useMemo } from "react";
import Flex from "../../../../../@ui/flex/Flex";
import { Col, Grid, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import SubjectDetailRow from "./SubjectDetailRow";
import Center from "../../../../../@ui/center/Center";
import { COLORS } from "../../../../../colors";
import { useBatchListsQuery } from "../../../../../apis/hooks/batch/query/useBatchLists.query";
import { useCourseListsQuery } from "../../../../../apis/hooks/course/query/useCourseLists.query";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../../../apis/urls";

interface ISubjectDetailsTab {
  teacherId: string;
}

const SubjectDetailsTab: FC<ISubjectDetailsTab> = ({ teacherId }) => {
  const queryClient = useQueryClient();
  const { data: batchesData, isLoading: batchesLoading, refetch: refetchBatches } = useBatchListsQuery();
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useCourseListsQuery();

  const handleSubjectRemoved = () => {
    // Refetch both queries to update the list
    refetchBatches();
    refetchCourses();
  };

  // Filter subjects where teacher is assigned to batches/subjects
  // Web logic: Check both batch-level teacher assignment AND subject-level teacher assignment
  const filteredSubjects = useMemo(() => {
    if (batchesLoading || coursesLoading) return [];

    if (
      batchesData?.statusCode === 200 &&
      Array.isArray(batchesData.data) &&
      coursesData?.statusCode === 200 &&
      Array.isArray(coursesData.data)
    ) {
      const allBatches = batchesData.data as any[];
      const allCourses = coursesData.data as any[];
      const subjectsList: any[] = [];

      // Create a map of subjectId to subjectName from courses
      const subjectNameMap = new Map<string, string>();
      allCourses.forEach((course) => {
        if (Array.isArray(course.subjects)) {
          course.subjects.forEach((subject: any) => {
            if (subject.subjectId && subject.subjectName) {
              subjectNameMap.set(subject.subjectId, subject.subjectName);
            }
          });
        }
      });

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
        if (Array.isArray(batch.subjects)) {
          batch.subjects.forEach((subject: any) => {
            // Subject can be string (subjectId) or object {subjectId, teacherId, startTime, endTime, ...}
            if (typeof subject === "object" && subject.teacherId) {
              if (subject.teacherId === teacherId) {
                isTeacherAssigned = true;
                assignmentType = "subject-level";

                // Add subject to list with batch info
                const subjectName =
                  subject.subjectName ||
                  subjectNameMap.get(subject.subjectId) ||
                  "Unknown Subject";
                subjectsList.push({
                  batchId: batch.batchId,
                  batchName: batch.batchName,
                  subjectId: subject.subjectId,
                  subjectName: subjectName,
                  startTime: subject.startTime || null,
                  endTime: subject.endTime || null,
                });
              }
            }
          });
        }

        // If teacher is assigned at batch level but no specific subjects, show all subjects from that batch
        if (isTeacherAssigned && assignmentType === "batch-level" && Array.isArray(batch.subjects)) {
          batch.subjects.forEach((subject: any) => {
            // Only add if not already added (avoid duplicates)
            const alreadyExists = subjectsList.some(
              (s) => s.batchId === batch.batchId && s.subjectId === (typeof subject === "object" ? subject.subjectId : subject)
            );

            if (!alreadyExists) {
              if (typeof subject === "object" && subject.subjectId) {
                const subjectName =
                  subject.subjectName ||
                  subjectNameMap.get(subject.subjectId) ||
                  "Unknown Subject";
                subjectsList.push({
                  batchId: batch.batchId,
                  batchName: batch.batchName,
                  subjectId: subject.subjectId,
                  subjectName: subjectName,
                  startTime: subject.startTime || null,
                  endTime: subject.endTime || null,
                });
              } else if (typeof subject === "string") {
                // Subject is just an ID, get name from course map
                const subjectName = subjectNameMap.get(subject) || "Unknown Subject";
                subjectsList.push({
                  batchId: batch.batchId,
                  batchName: batch.batchName,
                  subjectId: subject,
                  subjectName: subjectName,
                  startTime: null,
                  endTime: null,
                });
              }
            }
          });
        }

        if (isTeacherAssigned) {
          console.log(
            `✅ Teacher ${teacherId} assigned to batch ${batch.batchName} (${batch.batchId}) via ${assignmentType}`
          );
        }
      });

      console.log(
        `📚 Teacher ${teacherId} - Found ${subjectsList.length} subjects with teacher assignment`
      );

      return subjectsList;
    }

    return [];
  }, [batchesData, coursesData, batchesLoading, coursesLoading, teacherId]);

  const isLoading = batchesLoading || coursesLoading;

  return (
    <Flex mt={5}>
      <Grid>
        <Row style={styles.headerRow}>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Batch Name
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Subject Name
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              {"Subject\nStart Time"}
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              {"Subject\nEnd Time"}
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Remove Subjects
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
        {!isLoading && filteredSubjects.length === 0 && (
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
          filteredSubjects.map((subject, index) => (
            <SubjectDetailRow
              subject={subject}
              key={`${subject.batchId}-${subject.subjectId}-${index}`}
              onSubjectRemoved={handleSubjectRemoved}
            />
          ))}
      </Grid>
    </Flex>
  );
};

export default memo(SubjectDetailsTab);

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
