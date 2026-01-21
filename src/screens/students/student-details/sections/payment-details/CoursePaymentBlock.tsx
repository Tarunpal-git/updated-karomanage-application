import { StyleSheet, TouchableOpacity, Alert, View, TouchableWithoutFeedback, Modal, TextInput, Dimensions } from "react-native";
import React, { FC, memo, useState, useRef } from "react";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import Flex from "../../../../../@ui/flex/Flex";
import ScalableText from "../../../../../@ui/scalable-text/ScalableText";

import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../../../../../colors";
import { useCourseDetailsQuery } from "../../../../../apis/hooks/course/query/useCourseDetails.query";
import { THomeStackNavigator } from "../../../../../navigators/tab-navigator/sub-stack-navigator/HomeStackNavigator";
import { hasUpdatePermission } from "../../../../../utils/fetchPermissionsTitle";
import { RootState } from "../../../../../app/store";
import { request } from "../../../../../services/axios.service";
import { apiUrls } from "../../../../../apis/urls";

interface ICoursePaymentBlock {
  course: TCourse;
  studentRollNo: string;
  isDefaulter?: boolean;
}

const CoursePaymentBlock: FC<ICoursePaymentBlock> = ({ course, studentRollNo, isDefaulter }) => {
  const navigation = useNavigation<THomeStackNavigator>();
  const queryClient = useQueryClient();
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const selectedOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);
  const { data } = useCourseDetailsQuery({
    courseId: course.courseId,
  });
  const { paymentDetails } = course;
  const [showMenu, setShowMenu] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundDate, setRefundDate] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [refundDatePickerOpen, setRefundDatePickerOpen] = useState(false);
  const [refundDateObj, setRefundDateObj] = useState<Date>(new Date());
  const [isSavingRefund, setIsSavingRefund] = useState(false);
  const menuButtonRef = useRef<View>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Calculate the received payment as totalReceivedPayment - refundAmount
  const calculatedReceivedPayment =
  (paymentDetails?.totalReceivedPayment || 0) - (paymentDetails?.refundAmount || 0);

  // Derived disabled flags for menu actions
  const isUpdateDisabled = !!isDefaulter;

  // Refund button should be enabled WHEN:
  // - There is some received payment left for this course (after previous refunds)
  // - AND student is not defaulter
  const hasReceivedPayment = calculatedReceivedPayment > 0;
  const isRefundDisabled = !hasReceivedPayment || !!isDefaulter;

  const formatDateDisplay = (dateVal?: Date) => {
    if (!dateVal) return "";
    try {
      return dateVal.toLocaleDateString("en-GB");
    } catch {
      return "";
    }
  };

  const formatDateForApi = (dateVal?: Date) => {
    if (!dateVal) return "";
    const parsedDate = new Date(dateVal);
    if (isNaN(parsedDate.getTime())) return "";
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 CoursePaymentBlock Debug:', {
      courseId: course.courseId,
      totalReceivedPayment: paymentDetails?.totalReceivedPayment,
      refundAmount: paymentDetails?.refundAmount,
      calculatedReceivedPayment,
      hasReceivedPayment,
      isDefaulter,
      isRefundDisabled,
    });
  }, [calculatedReceivedPayment, hasReceivedPayment, isDefaulter, isRefundDisabled]);

  // Calculate GST based on payment status and installments with dynamic GST type
  const calculateGST = () => {
    // Check if there are installment details
    if (paymentDetails?.installmentDetails && paymentDetails.installmentDetails.length > 0) {
      const installments = paymentDetails.installmentDetails;
      
      // Check if any installment is paid
      const paidInstallments = installments.filter((installment: any) => installment.paymentStatus === 'paid');
      const totalInstallments = installments.length;
      
      if (paidInstallments.length === 0) {
        // No installments paid - show noGST
        return { 
          cgstAmount: 0, 
          sgstAmount: 0, 
          totalGSTAmount: 0,
          gstType: 'noGST',
          gstInclusionType: 'noGST'
        };
      } else if (paidInstallments.length === totalInstallments) {
        // All installments paid - check GST type from installment data
        const firstInstallment = installments[0];
        const gstInclusionType = (firstInstallment as any)?.inclusionType || 'noGST';
        
        if (gstInclusionType === 'noGST') {
          return { 
            cgstAmount: 0, 
            sgstAmount: 0, 
            totalGSTAmount: 0,
            gstType: 'noGST',
            gstInclusionType: 'noGST'
          };
        } else {
          // Calculate GST based on inclusion type
          const totalGST = installments.reduce((sum: number, installment: any) => {
            const installmentAmount = installment.receivedPayment || installment.duePayment || 0;
            // Calculate GST on installment amount (assuming 18% total GST - adjust as needed)
            return sum + (installmentAmount * 0.18);
          }, 0);
          return { 
            cgstAmount: totalGST / 2, // Assuming equal CGST and SGST
            sgstAmount: totalGST / 2,
            totalGSTAmount: totalGST,
            gstType: 'withGST',
            gstInclusionType: gstInclusionType
          };
        }
      } else {
        // Only some installments paid - check GST type from paid installments
        const paidInstallments = installments.filter((installment: any) => installment.paymentStatus === 'paid');
        const firstPaidInstallment = paidInstallments[0];
        const gstInclusionType = (firstPaidInstallment as any)?.inclusionType || 'noGST';
        
        if (gstInclusionType === 'noGST') {
          return { 
            cgstAmount: 0, 
            sgstAmount: 0, 
            totalGSTAmount: 0,
            gstType: 'noGST',
            gstInclusionType: 'noGST'
          };
        } else {
          // Calculate GST for paid installments only
          const paidGST = paidInstallments.reduce((sum: number, installment: any) => {
            const installmentAmount = installment.receivedPayment || installment.duePayment || 0;
            // Calculate GST on paid installment amount
            return sum + (installmentAmount * 0.18);
          }, 0);
          return {
            cgstAmount: paidGST / 2,
            sgstAmount: paidGST / 2,
            totalGSTAmount: paidGST,
            gstType: 'withGST',
            gstInclusionType: gstInclusionType
          };
        }
      }
    }
    
    // Fallback: Check if course payment status is paid (for single payment scenarios)
    if (paymentDetails?.coursePaymentStatus === 'paid') {
      // Check if there's GST data in the payment details
      const gstInclusionType = (paymentDetails as any)?.inclusionType || 'noGST';
      
      if (gstInclusionType === 'noGST') {
        return { 
          cgstAmount: 0, 
          sgstAmount: 0,
          totalGSTAmount: 0,
          gstType: 'noGST',
          gstInclusionType: 'noGST'
        };
      } else {
        const totalAmount = paymentDetails?.totalReceivedPayment || 0;
        const totalGST = totalAmount * 0.18; // 18% GST
        return {
          cgstAmount: totalGST / 2,
          sgstAmount: totalGST / 2,
          totalGSTAmount: totalGST,
          gstType: 'withGST',
          gstInclusionType: gstInclusionType
        };
      }
    }
    
    // No payment made - show noGST
    return {
      cgstAmount: 0,
      sgstAmount: 0,
      totalGSTAmount: 0,
      gstType: 'noGST',
      gstInclusionType: 'noGST'
    };
  };

  const gstData = calculateGST();

  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measureInWindow((x, y, width, height) => {
        // Validate that all values are valid numbers
        if (typeof x === 'number' && typeof y === 'number' && typeof width === 'number' && typeof height === 'number' &&
            !isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height) &&
            x >= 0 && y >= 0 && width > 0 && height > 0) {
          // Calculate position: dropdown should align right edge with button right edge
          // x + width = right edge of button
          // Screen width - button right edge = right position from screen edge
          const screenWidth = Dimensions.get('window').width;
          const dropdownWidth = 120;
          const buttonRightEdge = x + width;
          const rightPosition = screenWidth - buttonRightEdge;
          
          // Position above button: y - dropdown height (approx 90px for 2 items) - 5px gap
          const dropdownHeight = 90; // Approximate height for 2 menu items
          const topPosition = y - dropdownHeight - 5;
          
          setMenuPosition({
            x: rightPosition, // Right position from screen edge
            y: topPosition > 0 ? topPosition : y + height + 2, // Above button, or below if not enough space
          });
          setShowMenu(true);
        } else {
          // Fallback: use default position if measurement fails
          setMenuPosition({
            x: 10,
            y: 100, // Default position
          });
          setShowMenu(true);
        }
      });
    } else {
      // Fallback: use default position if ref is not available
      setMenuPosition({
        x: 10,
        y: 100,
      });
      setShowMenu(!showMenu);
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleUpdate = () => {
    setShowMenu(false);
    // Navigate to UpdatePayment screen
    navigation.navigate("UpdatePayment",{
      course,
      studentRollNo,
    });
  };

  const handleRefund = () => {
    console.log('🔵 Refund button pressed!');
    console.log('🔵 totalReceivedPayment:', paymentDetails?.totalReceivedPayment);
    console.log('🔵 isRefundDisabled:', isRefundDisabled);
    console.log('🔵 isDefaulter:', isDefaulter);
    setShowMenu(false);
    // Open modal like web behavior
    setShowRefundModal(true);
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setRefundAmount("");
    setRefundDate("");
    setRefundDateObj(new Date());
    setRefundDatePickerOpen(false);
    setRefundNote("");
  };

  const handleSaveRefund = async () => {
    if (!refundAmount || !refundDateObj) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (!authUser || !selectedOrganization) {
      Alert.alert("Error", "User or organization details are missing");
      return;
    }

    const refundAmountNumber = Number(refundAmount);
    if (Number.isNaN(refundAmountNumber) || refundAmountNumber <= 0) {
      Alert.alert("Error", "Please enter a valid refund amount");
      return;
    }

    if (refundAmountNumber > calculatedReceivedPayment) {
      Alert.alert("Error", "Refund amount cannot exceed received payment");
      return;
    }

    const formattedRefundDate = formatDateForApi(refundDateObj);
    if (!formattedRefundDate) {
      Alert.alert("Error", "Please select a valid refund date");
      return;
    }

    const payload = {
      user: {
        userCustomerId: authUser.customerId,
        userCustomerName: `${authUser.customerName || ""}`.trim(),
        userCustomerEmail: authUser.customerEmail,
        roleName: selectedOrganization?.role?.roleName || authUser.userType,
        roleId: selectedOrganization?.role?.roleId || authUser.employeeId,
        userEmployeeId: authUser.employeeId || "",
      },
      customerId: selectedOrganization?.customerId,
      organizationId: selectedOrganization?.organizationId,
      rollNo: studentRollNo,
      courseId: course.courseId,
      updatedPaymentStatus: "refund",
      updatedDate: formattedRefundDate,
      refund: {
        refundAmount: refundAmountNumber,
        refundDate: formattedRefundDate,
        refundNote: refundNote || "",
      },
    };

    try {
      setIsSavingRefund(true);
      const response = await request({
        method: "POST",
        url: "/student-fnp-prod/updateStudentPaymentStatus",
        data: payload,
      });

      if (response?.statusCode === 200) {
        Alert.alert("Success", "Refund updated successfully", [
          {
            text: "OK",
            onPress: () => {
              handleCloseRefundModal();
              queryClient.invalidateQueries({
                queryKey: [apiUrls.student.FETCH_STUDENT_DETAILS, studentRollNo],
              });
              queryClient.invalidateQueries({
                queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId: course.courseId }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Error", response?.message || "Failed to update refund");
      }
    } catch (error) {
      console.error("Error updating refund:", error);
      Alert.alert("Error", "Failed to update refund. Please try again.");
    } finally {
      setIsSavingRefund(false);
    }
  };

  return (
    <>
    <Flex flexDirection="column" styles={styles.cardContainer}>
        <View style={styles.cardHeaderWrapper}>
          <Flex flexDirection="row" justify="space-between" align="center" styles={styles.cardHeader} w={"100%"}>
            <ScalableText style={styles.cardTitle} fontFamily="Bold">
              {data?.data?.courseName}
            </ScalableText>
            {/* Show menu for all status to maintain consistent card size */}
            <View style={styles.menuContainer}>
            {hasUpdatePermission("Student") ? (
              <>
                <View ref={menuButtonRef}>
                  <TouchableOpacity 
                    onPress={handleMenuPress} 
                    style={styles.menuButton}
                  >
                    <ScalableText style={styles.menuIcon} fontFamily="Bold">⋯</ScalableText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.menuButton}>
                {/* Empty placeholder to maintain card size */}
              </View>
            )}
          </View>
          </Flex>
        </View>
      <Flex my={10} mx={10}>
        <Grid>
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  Status
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={{
                  ...styles.sectionContentDataText,
                  textTransform: "capitalize",
                  color:
                    (paymentDetails?.coursePaymentStatus || "").toLowerCase() === "due" ||
                    (paymentDetails?.coursePaymentStatus || "").toLowerCase() === "refund"
                      ? COLORS.textError
                      : COLORS.textSuccess,
                }}
                fontFamily="Regular"
              >
                {paymentDetails?.coursePaymentStatus}
              </ScalableText>
            </Col>
          </Row>
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  Due
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={styles.sectionContentDataText}
                fontFamily="Regular"
              >
                RS.{paymentDetails?.totalDuePayment?.toLocaleString() || "0"}
              </ScalableText>
            </Col>
          </Row>
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  Refund
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={styles.sectionContentDataText}
                fontFamily="Regular"
              >
                RS.{paymentDetails?.refundAmount?.toLocaleString() || "0"}
              </ScalableText>
            </Col>
          </Row>
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  Received
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={styles.sectionContentDataText}
                fontFamily="Regular"
              >
                RS.{calculatedReceivedPayment?.toLocaleString() || "0"}
              </ScalableText>
            </Col>
          </Row>
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  Discount
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={styles.sectionContentDataText}
                fontFamily="Regular"
              >
                RS.{paymentDetails?.discountedPaymentAmount?.toLocaleString() || "0"}
              </ScalableText>
            </Col>
          </Row>
          {/* GST Details - Always show with dynamic data */}
          <Row style={styles.sectionContentRow}>
            <Col size={2}>
              <Flex justify="space-between">
                <ScalableText
                  style={styles.sectionContentTitle}
                  fontFamily="Regular"
                >
                  GST
                </ScalableText>
                <ScalableText fontFamily="Regular">-</ScalableText>
              </Flex>
            </Col>
            <Col size={2}>
              <ScalableText
                style={styles.sectionContentDataText}
                fontFamily="Regular"
              >
                {gstData.gstType === 'noGST' ? 'No GST' : `RS.${gstData.totalGSTAmount?.toLocaleString() || "0"}`}
              </ScalableText>
            </Col>
          </Row>
        </Grid>
      </Flex>
    </Flex>

    {/* Dropdown Menu Modal */}
    <Modal
      visible={showMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseMenu}
    >
      <TouchableWithoutFeedback onPress={handleCloseMenu}>
        <View style={styles.dropdownModalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View 
              style={[
                styles.dropdownMenuModal,
                { 
                  top: (typeof menuPosition.y === 'number' && !isNaN(menuPosition.y) && menuPosition.y >= 0) ? menuPosition.y : 100,
                  right: (typeof menuPosition.x === 'number' && !isNaN(menuPosition.x) && menuPosition.x >= 0) ? menuPosition.x : 10,
                  left: undefined,
                }
              ]}
            >
              <View style={styles.dropdownMenuContent}>
                {/* Update - disable when student is defaulter */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    isUpdateDisabled && styles.menuItemDisabled,
                  ]}
                  onPress={() => {
                    handleUpdate();
                  }}
                  disabled={isUpdateDisabled}
                  activeOpacity={0.7}
                >
                  <ScalableText
                    style={isUpdateDisabled ? styles.menuItemTextDisabled : styles.menuItemText}
                    fontFamily="Medium"
                  >
                    Update
                  </ScalableText>
                </TouchableOpacity>
                {/* Always show refund button but disable if no payment received or student is defaulter */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    styles.menuItemLast,
                    isRefundDisabled && styles.menuItemDisabled
                  ]}
                  onPress={() => {
                    console.log('🔵 Refund TouchableOpacity onPress called!');
                    console.log('🔵 isRefundDisabled:', isRefundDisabled);
                    console.log('🔵 calculatedReceivedPayment:', calculatedReceivedPayment);
                    if (!isRefundDisabled) {
                      handleRefund();
                    }
                  }}
                  disabled={isRefundDisabled}
                  activeOpacity={0.7}
                >
                  <ScalableText
                    style={isRefundDisabled ? styles.menuItemTextDisabled : styles.menuItemText}
                    fontFamily="Medium"
                  >
                    Refund
                  </ScalableText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Refund Payment Modal */}
    <Modal
      visible={showRefundModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseRefundModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <Flex flexDirection="row" justify="space-between" align="center" styles={styles.modalHeader}>
            <ScalableText style={styles.modalTitle} fontFamily="Bold">
              Refund Payment
            </ScalableText>
            <TouchableOpacity onPress={handleCloseRefundModal} style={styles.closeButton}>
              <ScalableText style={styles.closeButtonText} fontFamily="Bold">✕</ScalableText>
            </TouchableOpacity>
          </Flex>

          {/* Payment Summary */}
          <Flex flexDirection="row" justify="space-between" styles={styles.paymentSummary}>
            <ScalableText style={styles.summaryLabel} fontFamily="Medium">
              Received Payment :
            </ScalableText>
            <ScalableText style={styles.summaryAmount} fontFamily="Medium">
              ₹ {calculatedReceivedPayment?.toLocaleString() || "0"}
            </ScalableText>
          </Flex>
          <Flex flexDirection="row" justify="space-between" styles={styles.paymentSummary}>
            <ScalableText style={styles.summaryLabel} fontFamily="Medium">
              Refund Payment :
            </ScalableText>
            <ScalableText style={styles.summaryAmount} fontFamily="Medium">
              ₹ {paymentDetails?.refundAmount?.toLocaleString() || "0"}
            </ScalableText>
          </Flex>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <ScalableText style={styles.formTitle} fontFamily="Medium">
              Enter Amount To Refund
            </ScalableText>

            <View style={styles.inputContainer}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Amount *
              </ScalableText>
              <TextInput
                style={styles.textInput}
                value={refundAmount}
                onChangeText={setRefundAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Refund date *
              </ScalableText>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => setRefundDatePickerOpen(true)}
                activeOpacity={0.8}
              >
                <ScalableText style={{ fontSize: 14, color: COLORS.black }} fontFamily="Regular">
                  {refundDate || formatDateDisplay(refundDateObj) || "Select date (DD/MM/YYYY)"}
                </ScalableText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <ScalableText style={styles.inputLabel} fontFamily="Medium">
                Note
              </ScalableText>
              <TextInput
                style={styles.textInput}
                value={refundNote}
                onChangeText={setRefundNote}
                placeholder="Enter note"
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isSavingRefund && styles.saveButtonDisabled]}
              onPress={handleSaveRefund}
              disabled={isSavingRefund}
              activeOpacity={0.8}
            >
              <ScalableText style={styles.saveButtonText} fontFamily="Medium">
                SAVE
              </ScalableText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Refund Date Picker */}
    <DatePicker
      modal
      open={refundDatePickerOpen}
      mode="date"
      date={refundDateObj || new Date()}
      onConfirm={(date) => {
        setRefundDatePickerOpen(false);
        setRefundDateObj(date);
        setRefundDate(formatDateDisplay(date));
      }}
      onCancel={() => setRefundDatePickerOpen(false)}
    />
    </>
  );
};

export default memo(CoursePaymentBlock);

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: "center",
    elevation: 4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 167,
    overflow: 'visible',
  },
  cardHeaderWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    padding: 15,
    overflow: 'visible',
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.primary,
    paddingBottom: 4,
    textTransform: "capitalize",
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  sectionContentRow: {
    marginVertical: 5,
  },
  sectionContentTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionContentDataText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 15,
  },
  menuButton: {
    padding: 8,
    borderRadius: 4,
  },
  menuIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    position: 'relative',
    zIndex: 1000,
    elevation: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 120,
    zIndex: 1001,
    overflow: 'visible',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenuModal: {
    position: 'absolute',
    backgroundColor: 'transparent',
    marginTop: '80%',
    marginRight: '3%',
  },
  dropdownMenuContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 120,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 44,
    justifyContent: 'center',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.black,
  },
  menuItemTextDisabled: {
    color: COLORS.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.primary,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  paymentSummary: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryAmount: {
    fontSize: 14,
    color: COLORS.primary,
  },
  formContainer: {
    marginTop: 15,
  },
  formTitle: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
});
