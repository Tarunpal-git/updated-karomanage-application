import { StyleSheet, TouchableOpacity, Alert, View, Modal } from "react-native";
import React, { FC, memo, useMemo, useState } from "react";
import { Col, Row } from "react-native-easy-grid";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";
import Flex from "../../../../../@ui/flex/Flex";
import { useCourseDetailsQuery } from "../../../../../apis/hooks/course/query/useCourseDetails.query";
import { useRemoveCourseStudentMutation } from "../../../../../apis/hooks/students/mutation/useRemoveCourseStudent.mutation";
import { useBatchListsQuery } from "../../../../../apis/hooks/batch/query/useBatchLists.query";
import { useBatchDetailsQuery } from "../../../../../apis/hooks/batch/query/useBatchDetails.query";
import { useReassignBatchForCourseStudentMutation } from "../../../../../apis/hooks/students/mutation/useReassignBatchForCourseStudent.mutation";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";
import { COLORS } from "../../../../../colors";
import { hasUpdatePermission } from "../../../../../utils/fetchPermissionsTitle";
import ActionIcon from "../../../../../@ui/action-icon/ActionIcon";
import AutoHeightImage from "../../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../../images";

interface ICourseDetailRow {
  courseId: string;
  studentRollNo: string;
  allBatches: TStudentBatch[];
  studentBatch?: TStudentBatch | null;
  paymentDetails: TPaymentDetails;
  coupons?: any[];
  onCourseDeleted?: () => void;
}

const CourseDetailRow: FC<ICourseDetailRow> = ({
  courseId,
  studentRollNo,
  allBatches,
  studentBatch,
  paymentDetails,
  coupons = [],
  onCourseDeleted,
}) => {
  const { data, isLoading } = useCourseDetailsQuery({ courseId });
  const { mutateAsync: removeCourse, isPending } = useRemoveCourseStudentMutation();
  const { data: batchListsData, isLoading: batchLoading } = useBatchListsQuery();
  const { data: batchDetailsData, isLoading: batchDetailsLoading } = useBatchDetailsQuery(
    studentBatch ? { batchId: studentBatch.batchId } : { batchId: "" }
  );
  const { mutateAsync: reassignBatch, isPending: isUpdatingBatch } =
    useReassignBatchForCourseStudentMutation();
  
  // Get auth user and organization details from Redux at component level
  const { authUser } = useSelector((state: RootState) => state.auth);
  const { selectedOrganization } = useSelector((state: RootState) => state.auth);
  const { organization } = useSelector((state: RootState) => state.organization);

  const [isReassignModalVisible, setIsReassignModalVisible] = useState(false);
  const [selectedBatchOption, setSelectedBatchOption] = useState<{
    label: string;
    value: string;
    batchId: string;
  } | null>(null);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);

  const course: TCourseData = useMemo(() => {
    if (!isLoading && data?.data) {
      return data.data;
    } else {
      return undefined;
    }
  }, [data, isLoading]);

  const currentBatchDetails: TBatchData | undefined = useMemo(() => {
    if (!batchDetailsLoading && batchDetailsData?.data && studentBatch?.batchId) {
      return batchDetailsData.data;
    }
    return undefined;
  }, [batchDetailsLoading, batchDetailsData, studentBatch]);

  const batchOptions = useMemo<{
    label: string;
    value: string;
    batchId: string;
  }[]>(() => {
    if (
      !batchLoading &&
      batchListsData?.statusCode === 200 &&
      Array.isArray(batchListsData.data)
    ) {
      const allBatches = batchListsData.data as TBatchData[];

      // Course details ke andar se batchIds lo (yehi web bhi use karta hai)
      const courseBatchIds: string[] =
        (course as any)?.batch?.map((b: any) => b.batchId) || [];

      let effectiveList: TBatchData[];

      if (courseBatchIds.length > 0) {
        // Sirf wahi batches jinke batchId course.batch me present hain
        effectiveList = allBatches.filter((batch) =>
          courseBatchIds.includes(batch.batchId)
        );
      } else {
        // Fallback: agar mapping na mile to saare batches dikha do
        effectiveList = allBatches;
      }

      return effectiveList.map((batch) => ({
        label: batch.batchName,
        value: batch.batchId,
        batchId: batch.batchId,
      }));
    }
    return [];
  }, [batchLoading, batchListsData, course]);

  // Exclude current batch from selectable list
  const selectableBatchOptions = useMemo(() => {
    if (!currentBatchDetails) return batchOptions;
    return batchOptions.filter(
      (batch) => batch.batchId !== currentBatchDetails.batchId
    );
  }, [batchOptions, currentBatchDetails]);

  // Debug: Log batch data and options for this course
  React.useEffect(() => {
    console.log('🎯 Batch Reassign Debug - CourseDetailRow', {
      courseId,
      batchLoading,
      hasBatchListsData: !!batchListsData,
      statusCode: batchListsData?.statusCode,
      rawDataSample: Array.isArray(batchListsData?.data)
        ? batchListsData?.data.slice(0, 2).map((b: any) => ({
            batchId: b.batchId,
            batchName: b.batchName,
            courses: b.courses,
          }))
        : batchListsData?.data,
      batchOptionsLength: batchOptions.length,
      selectableBatchOptionsLength: selectableBatchOptions.length,
      currentBatchId: currentBatchDetails?.batchId || null,
    });
  }, [courseId, batchLoading, batchListsData, batchOptions, selectableBatchOptions, currentBatchDetails]);

  const handleConfirmReassign = async () => {
    if (!selectedBatchOption) {
      Alert.alert("Error", "Please select a batch");
      return;
    }

    if (!currentBatchDetails?.batchId) {
      Alert.alert("Error", "Current batch information not available");
      return;
    }

    try {
      const payload = {
        rollNo: studentRollNo,
        courseId: courseId,
        newBatchId: selectedBatchOption.batchId,
        oldBatchId: currentBatchDetails.batchId,
      };

      const response = await reassignBatch(payload);

      if (response?.statusCode === 200) {
        Alert.alert("Success", "Batch reassigned successfully!");
        setIsReassignModalVisible(false);
        setSelectedBatchOption(null);
        setIsBatchDropdownOpen(false);

        if (onCourseDeleted) {
          // Use callback to trigger parent refresh (student details refetch)
          onCourseDeleted();
        }
      } else {
        Alert.alert("Error", response?.message || "Failed to reassign batch");
      }
    } catch (error: any) {
      console.error("Batch reassign error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to reassign batch"
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to remove "${course?.courseName}" from this student?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const payload = {
                user: {
                  userCustomerId: authUser?.customerId || '',
                  userCustomerName: authUser?.customerName || '',
                  userCustomerEmail: authUser?.customerEmail || '',
                  roleName: organization?.role?.roleName || '',
                  roleId: organization?.role?.roleId || '', 
                  userEmployeeId: selectedOrganization?.organizationId || '',
                },
                customerId: selectedOrganization?.customerId || '',
                organizationId: selectedOrganization?.organizationId || '',
                rollNo: studentRollNo,
                courseId: courseId,
              };

              await removeCourse(payload);
              Alert.alert("Success", "Course removed successfully!");
              
              // Call the callback to refresh student details
              if (onCourseDeleted) {
                onCourseDeleted();
              }
            } catch (error) {
              console.error('Remove course error:', error);
              Alert.alert("Error", "Failed to remove course");
            }
          }
        }
      ]
    );
  };

  // Show loading state if data is not available
  if (isLoading || !course) {
    return (
      <Row style={styles.dataRow}>
        <Col size={24}>
          <ScalableText fontFamily="Regular" style={styles.courseNameText}>
            Loading...
          </ScalableText>
        </Col>
        <Col size={19}>
          <ScalableText fontFamily="Regular" style={styles.dataText}>
            -
          </ScalableText>
        </Col>
        <Col size={19}>
          <ScalableText fontFamily="Regular" style={styles.dataText}>
            -
          </ScalableText>
        </Col>
        <Col size={20}>
          <Flex
            styles={styles.statusChip}
          >
            <ScalableText style={styles.statusChipText} fontFamily="Medium">
              -
            </ScalableText>
          </Flex>
        </Col>
        {hasUpdatePermission("Student") && (
          <Col size={18}>
            <Flex flexDirection="row" justify="center" align="center">
              <TouchableOpacity disabled style={styles.deleteButton}>
                <ScalableText style={styles.deleteButtonText} fontFamily="Medium">
                  DELETE
                </ScalableText>
              </TouchableOpacity>
            </Flex>
          </Col>
        )}
      </Row>
    );
  }

  return (
    <Row style={styles.dataRow}>
      <Col size={24}>
        <ScalableText 
          fontFamily="Regular" 
          style={styles.dataText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {course?.courseName || '-'}
        </ScalableText>
      </Col>
      <Col size={19}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {currentBatchDetails?.batchName || "-"}
        </ScalableText>
      </Col>
      <Col size={19}>
        {hasUpdatePermission("Student") ? (
          <Flex flexDirection="row" justify="center" align="center">
            <ActionIcon
              onPress={() => setIsReassignModalVisible(true)}
              disabled={isUpdatingBatch || batchLoading}
              styles={styles.reassignIconButton}
            >
              <AutoHeightImage
                source={IMAGES.assignIconBlue}
                width={25}
              />
            </ActionIcon>
          </Flex>
        ) : (
          <ScalableText fontFamily="Regular" style={styles.dataText}>
            -
          </ScalableText>
        )}
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
            {course?.courseStatus}
          </ScalableText>
        </Flex>
      </Col>
      {hasUpdatePermission("Student") && (
        <Col size={18}>
          <Flex flexDirection="row" justify="center" align="center">
            <TouchableOpacity 
              onPress={handleDelete}
              disabled={isPending}
              style={styles.deleteButton}
            >
              <ScalableText style={styles.deleteButtonText} fontFamily="Medium">
                {isPending ? "..." : "DELETE"}
              </ScalableText>
            </TouchableOpacity>
          </Flex>
        </Col>
      )}
      {/* Batch Reassign Modal */}
      <Modal
        visible={isReassignModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setIsReassignModalVisible(false);
          setSelectedBatchOption(null);
          setIsBatchDropdownOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header with title and close button */}
            <Flex flexDirection="row" justify="space-between" align="center">
              <ScalableText style={styles.modalTitle} fontFamily="SemiBold">
                Batch Reassign
              </ScalableText>
              <TouchableOpacity
                onPress={() => {
                  setIsReassignModalVisible(false);
                  setSelectedBatchOption(null);
                  setIsBatchDropdownOpen(false);
                }}
                style={styles.modalCloseButton}
              >
                <ScalableText style={styles.modalCloseText} fontFamily="Medium">
                  ✕
                </ScalableText>
              </TouchableOpacity>
            </Flex>

            {/* Course / Current batch rows */}
            <View style={styles.modalInfoRow}>
              <ScalableText style={styles.modalInfoLabel} fontFamily="Medium">
                Course
              </ScalableText>
              <ScalableText style={styles.modalInfoSeparator} fontFamily="Medium">
                :
              </ScalableText>
              <ScalableText style={styles.modalInfoValue} fontFamily="Regular">
                {course?.courseName || "-"}
              </ScalableText>
            </View>

            <View style={styles.modalInfoRow}>
              <ScalableText style={styles.modalInfoLabel} fontFamily="Medium">
                Current batch
              </ScalableText>
              <ScalableText style={styles.modalInfoSeparator} fontFamily="Medium">
                :
              </ScalableText>
              <ScalableText style={styles.modalInfoValue} fontFamily="Regular">
                {currentBatchDetails?.batchName || "-"}
              </ScalableText>
            </View>

            {/* Select batch heading */}
            <ScalableText
              style={styles.modalSectionTitle}
              fontFamily="SemiBold"
            >
              Select batch to assign
            </ScalableText>

            {/* Dropdown row with label + pseudo-input + plus button */}
            <View style={styles.modalBatchRow}>
              <View style={{ flex: 1 }}>
                <ScalableText
                  style={styles.modalBatchLabel}
                  fontFamily="Medium"
                >
                  Batch *
                </ScalableText>
                <TouchableOpacity
                  style={styles.modalBatchInput}
                  activeOpacity={0.8}
                  onPress={() => {
                    // Toggle dropdown visibility
                    setIsBatchDropdownOpen((prev) => !prev);
                  }}
                >
                  <ScalableText
                    style={
                      selectedBatchOption
                        ? styles.modalBatchInputText
                        : styles.modalBatchInputPlaceholder
                    }
                    fontFamily="Regular"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedBatchOption?.label || "Select batch"}
                  </ScalableText>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.modalPlusButton}
                // Optional: Hook up to CreateBatch screen later if needed
                onPress={() => {
                  Alert.alert(
                    "Info",
                    "Create Batch flow is available in Batch module."
                  );
                }}
              >
                <ScalableText
                  style={styles.modalPlusText}
                  fontFamily="SemiBold"
                >
                  +
                </ScalableText>
              </TouchableOpacity>
            </View>

            {/* Options dropdown below input (only when open) */}
            {isBatchDropdownOpen && (
              <View style={styles.batchList}>
                {selectableBatchOptions.map(
                  (batch: { label: string; value: string; batchId: string }) => (
                    <TouchableOpacity
                      key={batch.batchId}
                      style={[
                        styles.batchOption,
                        selectedBatchOption?.batchId === batch.batchId &&
                          styles.batchOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedBatchOption(batch);
                        setIsBatchDropdownOpen(false);
                      }}
                    >
                      <ScalableText
                        style={styles.batchOptionText}
                        fontFamily="Regular"
                      >
                        {batch.label}
                      </ScalableText>
                    </TouchableOpacity>
                  )
                )}
                {selectableBatchOptions.length === 0 && (
                  <ScalableText
                    style={styles.emptyBatchText}
                    fontFamily="Regular"
                  >
                    No other batches available for this course.
                  </ScalableText>
                )}
              </View>
            )}

            {/* Footer buttons */}
            <Flex flexDirection="row" justify="space-between" mt={20}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setIsReassignModalVisible(false);
                  setSelectedBatchOption(null);
                  setIsBatchDropdownOpen(false);
                }}
              >
                <ScalableText
                  style={styles.modalCancelText}
                  fontFamily="Medium"
                >
                  CANCEL
                </ScalableText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleConfirmReassign}
                disabled={isUpdatingBatch}
              >
                <ScalableText
                  style={styles.modalSubmitText}
                  fontFamily="Medium"
                >
                  {isUpdatingBatch ? "SAVING..." : "SAVE"}
                </ScalableText>
              </TouchableOpacity>
            </Flex>
          </View>
        </View>
      </Modal>
    </Row>
  );
};

export default memo(CourseDetailRow);

const styles = StyleSheet.create({
  statusChip: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    minHeight: 28,
  },
  statusChipText: {
    fontSize: 11,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  dataRow: {
    borderBottomWidth: 1,
    borderColor: "#D1D1D1",
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  dataText: {
    color: "#1B1A1A",
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
    lineHeight: 16,
  },
  courseNameText: {
    color: "#1B1A1A",
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
    lineHeight: 14,
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
    marginLeft: 8,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 8,
    textAlign: 'center',
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  reassignButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
  },
  reassignIconButton: {

    borderRadius: 16,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "left",
    color: "#212121",
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  modalLabelWithSpacing: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 16,
  },
  modalValue: {
    fontSize: 13,
    color: "#333",
    textAlign: "right",
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#777",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: "#666",
  },
  modalInfoSeparator: {
    fontSize: 13,
    color: "#666",
    marginHorizontal: 4,
  },
  modalInfoValue: {
    fontSize: 13,
    color: "#111",
    flexShrink: 1,
    textAlign: "right",
  },
  modalSectionTitle: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 8,
    color: "#111",
  },
  modalBatchRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  modalBatchLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: "#555",
  },
  modalBatchInput: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center",
  },
  modalBatchInputText: {
    fontSize: 13,
    color: "#111",
  },
  modalBatchInputPlaceholder: {
    fontSize: 13,
    color: "#999",
  },
  modalPlusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginBottom: 4,
  },
  modalPlusText: {
    fontSize: 18,
    color: "#fff",
  },
  batchList: {
    marginTop: 4,
    maxHeight: 220,
  },
  batchOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },
  batchOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EAF3FF",
  },
  batchOptionText: {
    fontSize: 13,
    color: "#333",
  },
  emptyBatchText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 13,
    color: "#555",
  },
  modalSubmitText: {
    fontSize: 13,
    color: "#fff",
  },
});
