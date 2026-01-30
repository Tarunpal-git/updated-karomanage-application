import { StyleSheet, View, Alert, TouchableOpacity, Modal, Image, Platform } from "react-native";
import React, { useMemo, useState } from "react";
import CustomAlertModel from "../../../@ui/alert/CustomAlertModel";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import {
  TScreenNavigator,
  TScreenNavigatorParams,
} from "../../../types/navigator/screen-navigator";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import ActionIcon from "../../../@ui/action-icon/ActionIcon";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../images";
import { COLORS } from "../../../colors";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import Flex from "../../../@ui/flex/Flex";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { useStudentDetailsQuery } from "../../../apis/hooks/students/query/useStudentDetails.query";
import { useDeleteStudentMutation } from "../../../apis/hooks/students/mutation/useDeleteStudent.mutation";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { Col, Grid, Row } from "react-native-easy-grid";
import Avatar from "../../../@ui/avatar/Avatar";
import { isEmptyString } from "../../../utils/isEmptyString";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hasUpdatePermission, hasDeletePermission } from "../../../utils/fetchPermissionsTitle";

const StudentProfile = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const {
    params: { rollNo },
  } = useRoute<RouteProp<TScreenNavigatorParams, "StudentProfile">>();
  const { data, isLoading, refetch } = useStudentDetailsQuery(rollNo);
  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudentMutation();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [alertData, setAlertData] = useState({
    message: '',
    okTitle: '',
    cancelTitle: '',
    okCallBack: () => {},
    cancelCallback: () => {},
    icon: undefined as any
  });
  
  // Get auth user and organization details from Redux
  const { authUser } = useSelector((state: RootState) => state.auth);
  const { selectedOrganization } = useSelector((state: RootState) => state.auth);
  const { organization } = useSelector((state: RootState) => state.organization);
  
  const studentDetails: TStudentList = useMemo(() => {
    if (!isLoading && data?.data) {
      return data.data;
    } else {
      return undefined;
    }
  }, [isLoading, data]);

  // Reset image error when student details change and debug image data
  React.useEffect(() => {
    setImageLoadError(false);
    if (studentDetails?.studentImage) {
      console.log('🖼️ Student Image Debug:');
      console.log('🖼️ Original URI length:', studentDetails.studentImage.length);
      console.log('🖼️ Original URI first 100 chars:', studentDetails.studentImage.substring(0, 100));
      console.log('🖼️ Formatted URI:', formatImageUri(studentDetails.studentImage));
      console.log('🖼️ Has data: prefix:', studentDetails.studentImage.startsWith('data:'));
      console.log('🖼️ Has http: prefix:', studentDetails.studentImage.startsWith('http'));
    }
  }, [studentDetails?.studentImage]);

  // Helper function to capitalize first letter of each word
  const capitalizeName = (firstName: string, lastName: string): string => {
    const capitalizeWord = (word: string) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };
    const capitalizedFirstName = capitalizeWord(firstName || '');
    const capitalizedLastName = capitalizeWord(lastName || '');
    return `${capitalizedFirstName} ${capitalizedLastName}`.trim();
  };

  // Helper function to format image URI for web compatibility
  const formatImageUri = (imageUri: string | undefined): string | undefined => {
    if (!imageUri || imageUri.trim() === '') return undefined;
    
    try {
      // Trim whitespace
      let trimmedUri = imageUri.trim();
      
      // If it's already a data URI, validate and return
      if (trimmedUri.startsWith('data:image/')) {
        // Validate the data URI format
        if (trimmedUri.includes('base64,')) {
          const base64Part = trimmedUri.split('base64,')[1];
          if (base64Part && base64Part.length > 0) {
            // Clean the base64 part
            const cleanBase64 = base64Part.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
            // Reconstruct with cleaned base64
            const mimeMatch = trimmedUri.match(/data:image\/([^;]+)/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'jpeg';
            return `data:image/${mimeType};base64,${cleanBase64}`;
          }
        }
        return trimmedUri;
      }
      
      // If it's a URL (http/https), return as is
      if (trimmedUri.startsWith('http://') || trimmedUri.startsWith('https://')) {
        return trimmedUri;
      }
      
      // Remove any existing data: prefix if malformed
      let cleanUri = trimmedUri;
      if (cleanUri.includes('base64,')) {
        const parts = cleanUri.split('base64,');
        if (parts.length > 1) {
          cleanUri = parts[parts.length - 1];
        }
      }
      
      // Remove any whitespace, newlines, or special characters that might break base64
      cleanUri = cleanUri.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
      
      // If it's a base64 string without prefix, add the prefix for web
      // Check if it looks like base64 (only contains base64 characters)
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (base64Regex.test(cleanUri) && cleanUri.length > 50) {
        // Try to detect image type from the base64 string
        // PNG starts with iVBORw0KGgo
        // JPEG starts with /9j/
        let imageType = 'jpeg'; // default
        if (cleanUri.startsWith('iVBORw0KGgo')) {
          imageType = 'png';
        } else if (cleanUri.startsWith('/9j/')) {
          imageType = 'jpeg';
        } else if (cleanUri.startsWith('R0lGODlh') || cleanUri.startsWith('R0lGODdh')) {
          imageType = 'gif';
        }
        
        return `data:image/${imageType};base64,${cleanUri}`;
      }
      
      // If it doesn't match base64 pattern, return as is (might be a URL or other format)
      return trimmedUri;
    } catch (error) {
      console.error('Error formatting image URI:', error);
      return undefined;
    }
  };

  // Helper function to format date
  const formatDate = (dateValue: string | number | null | undefined): string => {
    if (!dateValue) return '-';
    
    try {
      let date: Date;
      
      // Handle timestamp (number)
      if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      // Handle date string
      else if (typeof dateValue === 'string') {
        // Handle DD-MM-YYYY or DD/MM/YYYY format
        if (dateValue.includes('-') || dateValue.includes('/')) {
          const parts = dateValue.split(/[-/]/);
          if (parts.length === 3) {
            const [day, month, year] = parts;
            
            // Handle 2-digit year (YY format) - assume 20XX for years < 50, 19XX otherwise
            let fullYear = parseInt(year);
            if (year.length === 2) {
              fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
            }
            
            date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
          } else {
            date = new Date(dateValue);
          }
        } else {
          date = new Date(dateValue);
        }
      } else {
        return '-';
      }
      
      if (isNaN(date.getTime())) return '-';
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.log('Error formatting date:', error);
      return '-';
    }
  };

  const handleEdit = () => {
    if (studentDetails) {
      navigation.navigate('EditStudent', { studentData: studentDetails });
    }
  };

  const handleDelete = async (action: 'delete' | 'defaulter') => {
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
        rollNo: studentDetails.rollNo,
        organizationId: selectedOrganization?.organizationId || '',
        studentStatus: action === 'defaulter' ? 'defaulter' : 'delete'
      };

      console.log('🗑️ === DELETE STUDENT CALL ===');
      console.log('Action:', action);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await deleteStudent(payload);
      
      console.log('🗑️ Delete response:', response);
      
      // Normalize status code from different possible shapes
      const respStatusCode = response?.statusCode ?? response?.status;
      const isSuccess =
        respStatusCode === 200 ||
        respStatusCode === 201 ||
        respStatusCode === 204 ||
        response?.success === true;

      if (isSuccess) {
        console.log('✅ Student processed successfully');
        
        // Navigate to student list screen
        navigation.navigate('StudentList');
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            'Success', 
            action === 'defaulter' 
              ? 'Student marked as defaulter successfully!' 
              : 'Student deleted successfully!'
          );
        }, 100);
      } else {
        console.log('❌ API returned non-success status:', response);
        // Even if API doesn't return success, navigate to student list
        navigation.navigate('StudentList');
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Check if it's a network error or API error
      const errorMessage = (error as any)?.message || '';
      const errorCode = (error as any)?.code || '';
      
      if (errorMessage.includes('Network') || errorCode === 'NETWORK_ERROR') {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        // For other errors, still navigate to student list but show error
        navigation.navigate('StudentList');
        setTimeout(() => {
          Alert.alert('Error', 'Failed to process student. Please try again.');
        }, 100);
      }
    }
  };

  const showDeleteDialog = () => {
    setAlertData({
      message: 'Deleting the student will result in the loss of payment. If you want to keep the payment and remove the student, please update the status to "Defaulter".',
      okTitle: 'Delete',
      cancelTitle: 'Defaulter',
      okCallBack: () => {
        setShowCustomAlert(false);
        handleDelete('delete');
      },
      cancelCallback: () => {
        setShowCustomAlert(false);
        // Navigate to edit student form for defaulter
        navigation.navigate('EditStudent', { 
          studentData: studentDetails
        });
      },
      icon: 'close'
    });
    setShowCustomAlert(true);
  };

  return (
    <SafeView bg={COLORS.primary}>
      <AppHeader
        title="Student Details"
        handleBackClick={() => navigation.goBack()}
        leftSection={
          <ActionIcon>
            <View style={{ width: 30, height: 30 }} />
          </ActionIcon>
        }
        showDrawer={false}
        arrow="backArrowWhiteIcon"
      />

      <View style={styles.screenRoot}>
        <Flex flexDirection="column" styles={styles.profileAvatar}>
          {(() => {
            const imageUri = studentDetails?.studentImage;
            const formattedUri = imageUri ? formatImageUri(imageUri) : undefined;
            const shouldShowImage = imageUri && formattedUri && !imageLoadError;
            
            if (!shouldShowImage) {
              return (
                <Avatar
                  size={77}
                  textStyle={{ fontSize: 35 }}
                  content={capitalizeName(studentDetails?.studentFirstName || '', studentDetails?.studentLastName || '')}
                />
              );
            }

            // Use React Native Image component (works on both web and mobile)
            return (
              <Image
                source={{ uri: formattedUri }}
                style={styles.studentImage}
                onError={(error: any) => {
                  console.error('❌ Image load error:', error);
                  console.error('❌ Platform:', Platform.OS);
                  console.error('❌ Original Image URI length:', imageUri?.length);
                  console.error('❌ Original Image URI preview:', imageUri?.substring(0, 100));
                  console.error('❌ Formatted URI preview:', formattedUri?.substring(0, 100));
                  console.error('❌ Formatted URI length:', formattedUri?.length);
                  setImageLoadError(true);
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully on', Platform.OS);
                  setImageLoadError(false);
                }}
                resizeMode="cover"
                // Add key prop to force re-render if URI changes
                key={formattedUri?.substring(0, 50)}
              />
            );
          })()}
          <Flex flexDirection="row" align="center" justify="center" mt={10}>
            <ScalableText style={styles.userNameText} fontFamily="SemiBold">
              {capitalizeName(studentDetails?.studentFirstName || '', studentDetails?.studentLastName || '')}
            </ScalableText>
            <Flex flexDirection="row" ml={10}>
              {hasUpdatePermission("Student") && (
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                  <Icon name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {hasDeletePermission("Student") && (
                <TouchableOpacity onPress={showDeleteDialog} style={styles.actionButton}>
                  <Icon name="delete" size={20} color={COLORS.textError} />
                </TouchableOpacity>
              )}
            </Flex>
          </Flex>
        </Flex>

        <ThemeScrollView
          loading={isLoading}
          reloadData={refetch}
          style={{ borderTopLeftRadius: 46, borderTopRightRadius: 46 }}
        >
          <Flex mt={140}>
            <Grid>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Name
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {isEmptyString(
                      capitalizeName(studentDetails?.studentFirstName || '', studentDetails?.studentLastName || '')
                    )}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Enrollment
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {isEmptyString(studentDetails.studentEnrollmentNumber)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Email
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {isEmptyString(studentDetails.studentEmail)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Contact
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {isEmptyString(studentDetails.studentContact)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Date of Birth
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {formatDate(studentDetails?.studentDateOfBirth)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Date of Admission
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {formatDate(studentDetails?.dateCreated)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Address
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={styles.sectionContentDataText}
                    fontFamily="Medium"
                  >
                    {isEmptyString(studentDetails.studentAddress)}
                  </ScalableText>
                </Col>
              </Row>
              <Row style={styles.sectionContentRow}>
                <Col size={0.6}>
                  <Flex justify="space-between">
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      Status
                    </ScalableText>
                    <ScalableText
                      style={styles.sectionContentTitle}
                      fontFamily="Bold"
                    >
                      :
                    </ScalableText>
                  </Flex>
                </Col>
                <Col>
                  <ScalableText
                    style={{
                      ...styles.sectionContentDataText,
                      textTransform: "capitalize",
                      color:
                        studentDetails.studentStatus === "active"
                          ? COLORS.textSuccess
                          : COLORS.textError,
                    }}
                    fontFamily="Medium"
                  >
                    {isEmptyString(studentDetails.studentStatus)}
                  </ScalableText>
                </Col>
              </Row>
            </Grid>
          </Flex>
        </ThemeScrollView>
      </View>
      
      {/* Custom Delete Alert Modal */}
      <Modal
        visible={showCustomAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCustomAlert(false)}
            >
              <Icon name="close" size={20} color={COLORS.muted} />
            </TouchableOpacity>
            
            {/* Alert Content */}
            <View style={styles.alertContent}>
              <ScalableText style={styles.alertMessage} fontFamily="Medium">
                {alertData.message}
              </ScalableText>
              
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={[styles.alertButton, styles.defaulterButton]}
                  onPress={alertData.cancelCallback}
                >
                  <ScalableText style={styles.defaulterButtonText} fontFamily="Medium">
                    {alertData.cancelTitle}
                  </ScalableText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.alertButton, styles.deleteButton]}
                  onPress={alertData.okCallBack}
                >
                  <ScalableText style={styles.deleteButtonText} fontFamily="Medium">
                    {alertData.okTitle}
                  </ScalableText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeView>
  );
};

export default StudentProfile;

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 46,
    borderTopRightRadius: 46,
    marginTop: 50,
    position: "relative",
    zIndex: 5,
  },
  userNameText: {
    fontSize: 18,
    color: "#1B1A1A",
    marginTop: 20,
  },
  profileAvatar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -25,
    zIndex: 5,
  },
  studentImage: {
    width: 77,
    height: 77,
    borderRadius: 77 / 2,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionContentRow: {
    marginVertical: 10,
  },
  sectionContentTitle: {
    fontSize: 14,
    color: COLORS.primary,
  },
  sectionContentDataText: {
    textAlign: "left",
    marginLeft: 22,
    color: "#6F6F6F",
    fontSize: 14,
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '85%',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  alertContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  defaulterButton: {
    backgroundColor: COLORS.primary,
  },
  defaulterButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});
