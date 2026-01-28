import { StyleSheet } from "react-native";
import React, { FC, memo, useMemo } from "react";
import Flex from "../../../../@ui/flex/Flex";
import { Col, Grid, Row } from "react-native-easy-grid";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import BatchDetailRow from "./BatchDetailRow";
import Center from "../../../../@ui/center/Center";
import { COLORS } from "../../../../colors";
import { useBatchListsQuery } from "../../../../apis/hooks/batch/query/useBatchLists.query";

interface IBatchDetailsTab {
  teacherId: string;
}

const BatchDetailsTab: FC<IBatchDetailsTab> = ({ teacherId }) => {
  const { data: batchesData, isLoading: batchesLoading } = useBatchListsQuery();

  // Filter batches where teacher is assigned
  // Web logic: Check both batch-level teacher assignment AND subject-level teacher assignment
  const filteredBatches = useMemo(() => {
    if (batchesLoading) return [];

    if (batchesData?.statusCode === 200 && Array.isArray(batchesData.data)) {
      const allBatches = batchesData.data as any[];

      // Find batches where this teacher is assigned
      const teacherBatches = allBatches.filter((batch) => {
        let isTeacherAssigned = false;

        // Check batch-level teacher assignment
        if (
          Array.isArray(batch.teacher) &&
          batch.teacher.some(
            (t: any) => t.teacherId === teacherId && t.teacherStatus === "active"
          )
        ) {
          isTeacherAssigned = true;
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
          }
        }

        return isTeacherAssigned;
      });

      console.log(
        `📊 Teacher ${teacherId} - Found ${teacherBatches.length} batches with teacher assignment`
      );

      return teacherBatches;
    }

    return [];
  }, [batchesData, batchesLoading, teacherId]);

  const isLoading = batchesLoading;

  return (
    <Flex mt={5}>
      <Grid>
        <Row style={styles.headerRow}>
          <Col size={25}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Batch Name
            </ScalableText>
          </Col>
          <Col size={30}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Interval
            </ScalableText>
          </Col>
          <Col size={25}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Class Time
            </ScalableText>
          </Col>
          <Col size={20}>
            <ScalableText fontFamily="SemiBold" style={styles.headerText}>
              Batch Status
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
        {!isLoading && filteredBatches.length === 0 && (
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
          filteredBatches.map((batch, index) => (
            <BatchDetailRow
              batch={batch}
              key={batch.batchId || `batch-${index}`}
            />
          ))}
      </Grid>
    </Flex>
  );
};

export default memo(BatchDetailsTab);

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
