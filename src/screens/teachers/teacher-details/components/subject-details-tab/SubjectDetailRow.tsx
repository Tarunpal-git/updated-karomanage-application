import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { FC, memo } from "react";
import { Col, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import Flex from "../../../../../@ui/flex/Flex";
import { COLORS } from "../../../../../colors";
import { useBatchDetailsQuery } from "../../../../../apis/hooks/batch/query/useBatchDetails.query";
import { useUpdateBatchMutation } from "../../../../../apis/hooks/batch/mutation/useUpdateBatch.mutation";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../../../apis/urls";

interface ISubjectDetailRow {
  subject: {
    batchId: string;
    batchName: string;
    subjectId: string;
    subjectName: string;
    startTime: string | null;
    endTime: string | null;
  };
  onSubjectRemoved?: () => void;
}

const SubjectDetailRow: FC<ISubjectDetailRow> = ({ subject, onSubjectRemoved }) => {
  const queryClient = useQueryClient();
  const { data: batchDetailsData } = useBatchDetailsQuery(
    subject?.batchId ? { batchId: subject.batchId } : { batchId: "" }
  );
  const { mutateAsync: updateBatch, isPending } = useUpdateBatchMutation();

  const handleRemoveSubject = () => {
    Alert.alert(
      "Remove Subject",
      `Are you sure you want to remove "${subject?.subjectName}" from batch "${subject?.batchName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (!batchDetailsData?.data) {
                Alert.alert("Error", "Batch information not available");
                return;
              }

              const batchDetails = batchDetailsData.data;
              
              // Get current subjects and remove the one we want to delete
              const currentSubjects = batchDetails.subjects || [];
              const updatedSubjects = currentSubjects.filter((s: any) => {
                // Subject can be string (subjectId) or object {subjectId, ...}
                const sId = typeof s === "string" ? s : s.subjectId || s.id;
                return sId !== subject.subjectId;
              });

              // Prepare update payload
              const updatePayload = {
                batchId: subject.batchId,
                batchName: batchDetails.batchName || "",
                batchStartDate: batchDetails.batchStartDate || "",
                batchEndDate: batchDetails.batchEndDate || "",
                setBatchTime: batchDetails.batchClassStartTime ? "Yes" : "No",
                batchClassStartTime: batchDetails.batchClassStartTime || "",
                batchClassEndTime: batchDetails.batchClassEndTime || "",
                batchStatus: batchDetails.batchStatus || "active",
                subjects: updatedSubjects,
                batchDetails: batchDetails, // Pass full batch details for mutation
              };

              const response = await updateBatch(updatePayload);

              if (response?.statusCode === 200) {
                Alert.alert("Success", "Subject removed successfully!");
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    return (
                      query.queryKey[0] === apiUrls.batch.FETCH_BATCHES_LIST_NEW ||
                      query.queryKey[0] === apiUrls.batch.FETCH_BATCH_DETAILS
                    );
                  },
                });

                if (onSubjectRemoved) {
                  onSubjectRemoved();
                }
              } else {
                Alert.alert("Error", response?.message || "Failed to remove subject");
              }
            } catch (error: any) {
              console.error("Remove subject error:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to remove subject"
              );
            }
          },
        },
      ]
    );
  };

  if (!subject) {
    return null;
  }

  return (
    <Row style={styles.dataRow}>
      <Col size={20}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {subject?.batchName || "-"}
        </ScalableText>
      </Col>
      <Col size={20}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {subject?.subjectName || "-"}
        </ScalableText>
      </Col>
      <Col size={20}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {subject?.startTime || "-"}
        </ScalableText>
      </Col>
      <Col size={20}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {subject?.endTime || "-"}
        </ScalableText>
      </Col>
      <Col size={20}>
        <Flex flexDirection="row" justify="center" align="center">
          <TouchableOpacity
            onPress={handleRemoveSubject}
            disabled={isPending}
            style={styles.deleteButton}
          >
            <ScalableText style={styles.deleteButtonText} fontFamily="Medium">
              {isPending ? "..." : "REMOVE"}
            </ScalableText>
          </TouchableOpacity>
        </Flex>
      </Col>
    </Row>
  );
};

export default memo(SubjectDetailRow);

const styles = StyleSheet.create({
  dataRow: {
    borderBottomWidth: 1,
    borderColor: "#D1D1D1",
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  dataText: {
    color: "#1B1A1A",
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 60,
    minHeight: 28,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 8,
    textAlign: 'center',
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
