import { Modal, StyleSheet, View } from "react-native";
import React, { FC, memo, useMemo, useEffect } from "react";
import { COLORS } from "../../../../colors";
import { responsiveSize } from "../../../../utils/responsiveSize";
import Flex from "../../../../@ui/flex/Flex";
import Button from "../../../../@ui/button/Button";
import SelectInput from "../../../../@ui/select-input/SelectInput";
import { useForm } from "react-hook-form";
import { forms } from "../../../../forms";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEnquiryDetailsQuery } from "../../../../apis/hooks/enquiry/query/useEnquiryDetails.query";
import { useUpdateLeadsMutation } from "../../../../apis/hooks/lead-management/mutation/useUpdateLeads.mutation";
import { useGetAllLeadsByFilterQuery } from "../../../../apis/hooks/lead-management/query/useGetAllLeadsByFilter.query";
import { CONSTANT } from "../../../../constants";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import { Alert } from "react-native";
import { store } from "../../../../app/store";
import { useNavigation } from "@react-navigation/native";
import { TScreenNavigator } from "../../../../types/navigator/screen-navigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface IUpdateEnquiryStatusModal {
  isVisible: boolean;
  handleClose: () => void;
  refetch: () => void;
  id: string;
  leadId?: string; // Optional leadId from row data
}

const UpdateEnquiryStatusModal: FC<IUpdateEnquiryStatusModal> = ({
  handleClose,
  isVisible,
  refetch,
  id,
  leadId,
}) => {
  const navigation = useNavigation<TScreenNavigator>();
  const { data: enquiryDetailsData, isLoading: isLoadingEnquiry } = useEnquiryDetailsQuery(id);
  const { mutateAsync, isPending } = useUpdateLeadsMutation();
  
  // Get organizationId and customerId from store
  const organizationId = store.getState().auth.selectedOrganization?.organizationId || "";
  const customerId = store.getState().auth.selectedOrganization?.customerId || "";

  // Get full lead data from getAllLeadsByFilter
  const { data: leadsData } = useGetAllLeadsByFilterQuery({
    organizationId,
    customerId,
    leadSourceType: "enquiry",
    startDate: undefined,
    endDate: undefined,
  });

  // Find the specific lead from the leads list
  const fullLeadData = useMemo(() => {
    if (leadsData?.data && Array.isArray(leadsData.data)) {
      return leadsData.data.find((lead: any) => 
        lead.id === id || lead.leadId === leadId || lead.leadId === id
      );
    }
    return null;
  }, [leadsData, id, leadId]);

  const enquiryDetails: TEnquiryData = useMemo(() => {
    if (!isLoadingEnquiry && enquiryDetailsData?.dataArray) {
      return enquiryDetailsData.dataArray;
    } else {
      return undefined;
    }
  }, [isLoadingEnquiry, enquiryDetailsData]);

  // Normalize status value to match CONSTANT.ENQUIRY_STATUS values
  const normalizeStatus = (status: string): string => {
    if (!status) return "active";
    const statusLower = status.toLowerCase();
    // Map API status values to CONSTANT values
    if (statusLower === "inactive" || statusLower === "inactive ") {
      return "inActive"; // CONSTANT uses "inActive"
    }
    if (statusLower === "active") {
      return "active";
    }
    if (statusLower === "delete") {
      return "delete";
    }
    if (statusLower === "student") {
      return "student";
    }
    // Default to active if status doesn't match
    return "active";
  };

  // Set initial status from lead data
  const currentStatus = useMemo(() => {
    let status = "active";
    if (fullLeadData) {
      status = (fullLeadData as any)?.status || "active";
    } else if (enquiryDetails) {
      status = enquiryDetails.status || "active";
    }
    const normalizedStatus = normalizeStatus(status);
    console.log("[UpdateEnquiryStatusModal] Current status:", status, "Normalized:", normalizedStatus);
    return normalizedStatus;
  }, [fullLeadData, enquiryDetails]);

  const handler = useForm({
    defaultValues: {
      ...forms.updateEnquiryStatus.values,
      status: currentStatus,
    },
    resolver: yupResolver(forms.updateEnquiryStatus.validation),
    mode: "all",
    reValidateMode: "onSubmit",
  });

  // Reset form with current status when modal opens
  useEffect(() => {
    if (isVisible && currentStatus) {
      console.log("[UpdateEnquiryStatusModal] Resetting form with status:", currentStatus);
      handler.reset({
        ...forms.updateEnquiryStatus.values,
        status: currentStatus,
      });
    }
  }, [isVisible, currentStatus, handler]);

  // Denormalize status for API (convert "inActive" back to "inactive")
  const denormalizeStatus = (status: string): string => {
    if (status === "inActive") {
      return "inactive"; // API expects lowercase "inactive"
    }
    return status; // Keep other statuses as is
  };

  const updateStatus = async (
    values: typeof forms.updateEnquiryStatus.values
  ) => {
    if (!fullLeadData && !enquiryDetails) {
      Alert.alert("Error", "Lead data not found");
      return;
    }

    try {
      // Use fullLeadData from getAllLeadsByFilter if available, otherwise fallback to enquiryDetails
      const leadData = fullLeadData || enquiryDetails;
      
      // Denormalize status for API
      const apiStatus = denormalizeStatus(values.status);
      
      // Prepare payload for updateLeads API
      // Preserve all existing fields and update only the status
      const payload = {
        ...leadData, // Spread all existing fields to preserve everything
        id: leadData?.id || (leadData as any)?.id || id,
        leadId: (leadData as any)?.leadId || leadId || id,
        leadSourceType: (leadData as any)?.leadSourceType || "enquiry",
        leadName: (leadData as any)?.leadName || (leadData as any)?.studentName || "",
        leadMobileNumber: (leadData as any)?.leadMobileNumber || (leadData as any)?.mobileNumber || "",
        leadEmail: (leadData as any)?.leadEmail || (leadData as any)?.email || "",
        status: apiStatus, // Updated status (denormalized for API)
        visited: (leadData as any)?.visited ?? false,
        enquiryCourse: (leadData as any)?.enquiryCourse || "",
        courseDescription: (leadData as any)?.courseDescription || "",
        lastModifiedDate: Date.now(),
        followUp: (leadData as any)?.followUp || [],
        // Preserve assigneLeadManagers if exists
        assigneLeadManagers: (leadData as any)?.assigneLeadManagers || {},
      };

      console.log("[UpdateEnquiryStatusModal] UpdateLeads Payload:", JSON.stringify(payload, null, 2));

      const res = await mutateAsync(payload);
      console.log("[UpdateEnquiryStatusModal] UpdateLeads Response:", res);

      // Check for success
      if (res?.status === 200 || res?.statusCode === 200 || res?.data) {
        // If status is "student", navigate to StudentAdmission with prefilled data
        if (values.status === "student") {
          // Split lead name into first name and last name
          const leadName = (leadData as any)?.leadName || (leadData as any)?.studentName || "";
          const nameParts = leadName.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";
          
          // Get email and contact
          const email = (leadData as any)?.leadEmail || (leadData as any)?.email || "";
          const contact = (leadData as any)?.leadMobileNumber || (leadData as any)?.mobileNumber || "";
          
          // Store lead data in AsyncStorage to be picked up by StudentAdmission
          try {
            await AsyncStorage.setItem("leadToStudentData", JSON.stringify({
              studentFirstName: firstName,
              studentLastName: lastName,
              studentEmail: email,
              studentContact: contact,
              enquiryCourse: (leadData as any)?.enquiryCourse || "",
              courseDescription: (leadData as any)?.courseDescription || "",
            }));
            
            handleClose();
            refetch();
            // Navigate to StudentAdmission
            navigation.navigate("StudentAdmission" as any);
          } catch (storageError) {
            console.error("[UpdateEnquiryStatusModal] Error storing lead data:", storageError);
            Alert.alert("Success", "Status updated successfully", [
              {
                text: "OK",
                onPress: () => {
                  handleClose();
                  refetch();
                },
              },
            ]);
          }
        } else {
          Alert.alert("Success", "Status updated successfully", [
            {
              text: "OK",
              onPress: () => {
                handleClose();
                refetch();
              },
            },
          ]);
        }
      } else {
        Alert.alert("Error", "Failed to update status. Please try again.");
      }
    } catch (error: any) {
      console.error("[UpdateEnquiryStatusModal] Error updating status:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update status. Please try again."
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      visible={isVisible}
      onDismiss={handleClose}
    >
      <View style={styles.centeredView}>
        <Flex styles={styles.modalView} flexDirection="column">
          <Flex my={20}>
            <ScalableText fontFamily="Medium">
              Change the status of this lead
            </ScalableText>
          </Flex>
          <Flex my={15} flexDirection="column">
            <SelectInput
              value={handler.watch("status")}
              label="Current Status"
              options={CONSTANT.ENQUIRY_STATUS}
              onChange={(e) => handler.setValue("status", e)}
              dropdownButtonStyle={{
                paddingHorizontal: 20,
                width: 180,
                height: 46,
              }}
            />

            {handler.formState.errors?.status && (
              <ScalableText
                fontFamily="Regular"
                style={{
                  color: COLORS.error,
                  fontSize: 10,
                }}
              >
                {typeof handler.formState.errors.status?.message === 'string' 
                  ? handler.formState.errors.status.message 
                  : "Status is required"}
              </ScalableText>
            )}
          </Flex>

          <Flex mt={20}>
            <Button
              btnStyles={{
                ...styles.modalBtn,
                borderWidth: 1,
                borderColor: COLORS.primary,
                backgroundColor: COLORS.white,
              }}
              btnTxtStyles={{ ...styles.modalBtnText, color: COLORS.primary }}
              title="Cancel"
              onPress={handleClose}
            />
            <Button
              btnStyles={styles.modalBtn}
              btnTxtStyles={styles.modalBtnText}
              title="Update"
              disabled={isPending}
              loading={isPending}
              onPress={handler.handleSubmit(updateStatus)}
            />
          </Flex>
        </Flex>
      </View>
    </Modal>
  );
};

export default memo(UpdateEnquiryStatusModal);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "relative",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,

    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 322,
    padding: 40,
    paddingVertical: 19,
  },
  textStyle: {
    color: "black",
    textAlign: "center",
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: responsiveSize(6),
    width: 89,
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    height: 34,
    marginHorizontal: 3,
  },
  modalBtnText: {
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: "Poppins-Regular",
  },

  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  textArea: {
    height: 80,
    verticalAlign: "top",
  },
});
