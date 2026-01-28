import { Linking, ScrollView, StyleSheet, View } from "react-native";
import React, { FC, memo, useState } from "react";
import Flex from "../../../../@ui/flex/Flex";
import ActionIcon from "../../../../@ui/action-icon/ActionIcon";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../images";
import { Col, Grid, Row } from "react-native-easy-grid";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import { SCREEN_WIDTH } from "../../../../constants/Screen";
import FollowUpRow from "./FollowUpRow";
import CheckBox from "../../../../@ui/check-box/CheckBox";
import moment from "moment";
import { useForm } from "react-hook-form";
import { forms } from "../../../../forms";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../../../@ui/input/Input";
import SelectInput from "../../../../@ui/select-input/SelectInput";
import { CONSTANT } from "../../../../constants";
import Button from "../../../../@ui/button/Button";
import { COLORS } from "../../../../colors";

import EditFollowUpModal from "./EditFollowUpModal";
import { useUpdateLeadsMutation } from "../../../../apis/hooks/lead-management/mutation/useUpdateLeads.mutation";
import DateInput from "../../../../@ui/date-input/DateInput";
import { Log } from "victory-native";
import { useDynamicFlags } from "../../../../utils/hooks/useDynamicFlags";
import { useNavigation } from "@react-navigation/native";
import { TScreenNavigator } from "../../../../types/navigator/screen-navigator";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { useEnquiryListsQuery } from "../../../../apis/hooks/enquiry/query/useEnquiryLists.query";


interface IEnquiryDetailsTab {
  details: TEnquiryData;
  refetch: () => void;
  leadId?: string;
}

  const EnquiryDetailsTab: FC<IEnquiryDetailsTab> = ({ details, refetch, leadId }) => {
  console.log("[EnquiryDetailsTab] Details received:", JSON.stringify(details, null, 2));
  console.log("[EnquiryDetailsTab] Follow-ups:", details?.followUp);
  console.log("[EnquiryDetailsTab] Follow-ups length:", details?.followUp?.length);
  console.log("[EnquiryDetailsTab] Follow-ups is array:", Array.isArray(details?.followUp));
  console.log("[EnquiryDetailsTab] Follow-ups first item:", details?.followUp?.[0]);
  
  const navigation = useNavigation<TScreenNavigator>();
  const selectedOrganization = useSelector(
    (state: RootState) => state.auth.selectedOrganization
  );
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([]);
  const [editEnquiry, setEditEnquiry] = useState(false);

  const handleSelect = (followUpId: string) => {
    setSelectedFollowUps((prevSelected) => [...prevSelected, followUpId]);
  };

  const handleDeselect = (followUpId: string) => {
    setSelectedFollowUps((prevSelected) =>
      prevSelected.filter((id) => id !== followUpId)
    );
  };

  const handleCheckboxChange = (followUpId: string, isChecked: boolean) => {
    if (isChecked) {
      handleSelect(followUpId);
    } else {
      handleDeselect(followUpId);
    }
  };

  const { mutateAsync, isPending } = useUpdateLeadsMutation();
  const { data: leadsData } = useEnquiryListsQuery(); // Fetch full leads data
  
  const handler = useForm({
    defaultValues: forms.followUp.values,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver<any>(forms.followUp.validation),
    mode: "all", 
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (values: typeof forms.followUp.values) => {
    console.log("[EnquiryDetailsTab] Submitting values:", values);
    console.log("[EnquiryDetailsTab] Flag value:", values.flag);
    
    // Find the full lead data from leads list
    const currentLeadId = leadId || details?.leadId || details?.id;
    const fullLeadData = leadsData?.data?.find(
      (lead: any) => lead.leadId === currentLeadId || lead.id === currentLeadId || lead.id === details?.id
    );
    
    console.log("[EnquiryDetailsTab] Full Lead Data:", fullLeadData);
    console.log("[EnquiryDetailsTab] Current Lead ID:", currentLeadId);
    
    if (!fullLeadData) {
      customAlert.show({ message: "Lead data not found. Please refresh and try again." });
      return;
    }
    
    // Create new follow-up entry (without followUpId for new entries)
    const newFollowUp = {
      createDate: moment().format("DD/MM/YYYY"),
      followUpDate: moment(values.followUpDate).format("DD/MM/YYYY"),
      description: values.flag || "",
      message: values.message || "",
    };
    
    // Get existing follow-ups from full lead data or details
    const existingFollowUpsFromLead = fullLeadData?.followUp || [];
    const existingFollowUpsFromDetails = details?.followUp || [];
    
    // Use follow-ups from full lead data if available, otherwise use from details
    const existingFollowUps = (existingFollowUpsFromLead.length > 0 
      ? existingFollowUpsFromLead 
      : existingFollowUpsFromDetails
    ).map((followUp: any) => ({
      createDate: followUp.createDate || "",
      followUpDate: followUp.followUpDate || "",
      description: followUp.description || (typeof followUp.flag === 'string' ? followUp.flag : ""),
      message: followUp.message || "",
      followUpId: followUp.followUpId, // Keep followUpId for existing entries
      lastModifiedDate: followUp.lastModifiedDate,
    }));
    
    // Prepare payload for updateLeads API using FULL lead data
    // Spread all fields from fullLeadData to preserve all lead information
    // Note: customerId, organizationId, and user will be added automatically by useUpdateLeadsMutation
    const payload = {
      ...fullLeadData, // Spread all existing fields to preserve everything
      leadId: fullLeadData.leadId || currentLeadId,
      leadSourceType: fullLeadData.leadSourceType || "enquiry",
      leadName: fullLeadData.leadName || details?.studentName || "",
      leadMobileNumber: fullLeadData.leadMobileNumber || details?.mobileNumber || "",
      leadEmail: fullLeadData.leadEmail || details?.email || "",
      status: fullLeadData.status || details?.status || "active",
      visited: fullLeadData.visited ?? details?.visited ?? false,
      enquiryCourse: fullLeadData.enquiryCourse || details?.enquiryCourse || "",
      courseDescription: fullLeadData.courseDescription || details?.courseDescription || "",
      id: fullLeadData.id || details?.id || "",
      lastModifiedDate: Date.now(), // Update last modified date
      followUp: [...existingFollowUps, newFollowUp], // Update follow-ups array
    };
    
    console.log("[EnquiryDetailsTab] UpdateLeads Payload:", JSON.stringify(payload, null, 2));
    
    try {
      const res = await mutateAsync(payload);
      console.log("[EnquiryDetailsTab] UpdateLeads Response:", res);
      
      // Check for success (API returns status: 200 or statusCode: 200)
      if (res?.status === 200 || res?.statusCode === 200 || res?.data) {
        // Navigate back to EnquiryLists after successful creation
        navigation.navigate("EnquiryLists");
      } else {
        customAlert.show({ message: "Follow-up not created. Please try again." });
      }
    } catch (error) {
      console.error("[EnquiryDetailsTab] Error creating follow-up:", error);
      customAlert.show({ message: "Failed to create follow-up. Please try again." });
    }
  };

  const handleRemoveFollowUps = async () => {
    const updatedDetails: TEnquiryData = JSON.parse(JSON.stringify(details));
    const filteredFollowUps = updatedDetails.followUp.filter(
      (item) => !selectedFollowUps.includes(item.followUpId ?? "")
    );
    const res = await mutateAsync({
      details: { ...updatedDetails, followUp: filteredFollowUps },
    });
    if (res.statusCode === 200) {
      refetch();
      setSelectedFollowUps([]);
    } else {
      customAlert.show({ message: "data not updated" });
    }
  };

  const { flags, isLoading, error } = useDynamicFlags({
    flag: "enquiry",
  });
  console.log("[EnquiryDetailsTab] Dynamic Flags:", flags);
  console.log("[EnquiryDetailsTab] Error:", error);

  return (
    <View style={styles.rootContainer}>
      <Flex justify="flex-end" mx={15} my={10}>
        <ActionIcon
          mx={10}
          onPress={() => 
          {

            console.log('details?.mobileNumber',details?.mobileNumber);

            
            Linking.openURL(`tel:${details?.mobileNumber}`)}}
        >

          <AutoHeightImage width={20} source={IMAGES.phoneIcon} />
        </ActionIcon>
        <ActionIcon
          mx={7}
          disabled={selectedFollowUps.length === 0}
          onPress={() => setEditEnquiry(true)}
        >
          <AutoHeightImage
            width={24}
            source={
              selectedFollowUps.length === 1
                ? IMAGES.editActiveIcon
                : IMAGES.editIcon
            }
          />
        </ActionIcon>
        <ActionIcon
          mx={7}
          disabled={selectedFollowUps.length === 0}
          onPress={() =>
            customAlert.show({
              message: "Are you sure you want to delete .",
              cancelTitle: "No",
              okTitle: "Yes",
              okCallBack: handleRemoveFollowUps,
            })
          }
        >
          <AutoHeightImage
            width={24}
            source={
              selectedFollowUps.length > 0
                ? IMAGES.deleteActiveIcon
                : IMAGES.deleteIcon
            }
          />
        </ActionIcon>
      </Flex>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Grid style={{ minWidth: SCREEN_WIDTH * 1.2 }}>
          <Row style={styles.headerRow}>
            <Col style={styles.formColumn}>
              <ScalableText style={styles.headerTitle} fontFamily="Bold">
                Created
              </ScalableText>
            </Col>
            <Col style={styles.formColumn}>
              <ScalableText style={styles.headerTitle} fontFamily="Bold">
                Follow up
              </ScalableText>
            </Col>
            <Col style={styles.formColumn}>
              <ScalableText style={styles.headerTitle} fontFamily="Bold">
                Flag
              </ScalableText>
            </Col>
            <Col style={styles.formColumn}>
              <ScalableText style={styles.headerTitle} fontFamily="Bold">
                Message
              </ScalableText>
            </Col>
            <Col style={styles.formColumn}>
              <ScalableText style={styles.headerTitle} fontFamily="Bold">
                Actions
              </ScalableText>
            </Col>
          </Row>
          {(() => {
            console.log("[EnquiryDetailsTab] Rendering follow-ups check:", {
              hasDetails: !!details,
              hasFollowUp: !!details?.followUp,
              followUpLength: details?.followUp?.length,
              followUpIsArray: Array.isArray(details?.followUp),
              followUpArray: details?.followUp,
            });
            
            if (details?.followUp && Array.isArray(details.followUp) && details.followUp.length > 0) {
              console.log("[EnquiryDetailsTab] Rendering follow-ups, count:", details.followUp.length);
              return details.followUp.map((query, index) => {
                console.log(`[EnquiryDetailsTab] Rendering follow-up ${index}:`, query);
                return (
                  <FollowUpRow
                    query={query}
                    key={query.followUpId || `followup-${index}`}
                    handleCheckBoxClick={handleCheckboxChange}
                    selected={selectedFollowUps.includes(query.followUpId ?? "")}
                  />
                );
              });
            } else {
              console.log("[EnquiryDetailsTab] No follow-ups to render");
              return (
                <Row style={styles.dataRow}>
                  <Col style={styles.formColumn}>
                    <ScalableText style={styles.dataText} fontFamily="Regular">
                      No follow-ups found
                    </ScalableText>
                  </Col>
                </Row>
              );
            }
          })()}

          <Row style={styles.dataRow}>
            <Col style={{ ...styles.formColumn, justifyContent: "center" }}>
              <Flex>
                <View style={{ opacity: 0 }}>
                  <CheckBox />
                </View>
                <ScalableText style={styles.dataText} fontFamily="Regular">
                  {moment().format("DD/MM/YYYY")}
                </ScalableText>
              </Flex>
            </Col>
            <Col style={styles.formColumn}>
              <DateInput
                inputTextStyles={{ 
                  marginTop: 0,
                  fontSize: 11,
                  textAlign: "center",
                  color: "#717171",
                }}
                inputRoot={{
                  width: 100,
                  alignItems: "center",
                  marginVertical: 15,
                  height: 41,
                  borderRadius: 8,
                  elevation: 0,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
                errorStyle={{ fontSize: 8, marginTop: 0 }}
                handler={handler}
                label="Follow up date*"
                name="followUpDate"
              />
            </Col>
            <Col style={styles.formColumn}>
              <SelectInput
                value={handler.watch("flag")}
                label="Select Flag"
                options={flags}
                onChange={(e) => handler.setValue("flag", e)}
                dropdownButtonStyle={{ 
                  width: 90, 
                  paddingHorizontal: 14,
                  height: 41,
                  borderRadius: 8,
                  marginVertical: 15,
                  elevation: 0,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              />
            </Col>
            <Col style={styles.formColumn}>
              <Input
                inputRoot={{
                  width: 90,
                  marginVertical: 15,
                  paddingHorizontal: 14,
                  height: 41,
                  borderRadius: 8,
                  elevation: 0,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
                inputStyles={{
                  width: "100%",
                  padding: 0,
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 0,
                  color: "#717171",
                }}
                handler={handler}
                label="Message"
                name="message"
              />
            </Col>
            <Col style={styles.formColumn}>
              <Flex justify="center" align="center" style={{ height: "100%" }}>
                <Button
                  onPress={handler.handleSubmit(onSubmit)}
                  btnStyles={{
                    ...styles.submitBtn,
                    backgroundColor: handler.formState.isValid
                      ? COLORS.primary
                      : COLORS.white,
                    borderRadius: 8,
                    elevation: 0,
                    marginVertical: 15,
                    width: 90,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                  btnTxtStyles={{
                    ...styles.submitBtnText,
                    color: handler.formState.isValid ? COLORS.white : "#717171",
                    fontSize: 11,
                  }}
                  title="Add"
                  disabled={isPending}
                  loading={isPending}
                />
              </Flex>
            </Col>
          </Row>
        </Grid>
      </ScrollView>
      {editEnquiry && (
        <EditFollowUpModal
          handleClose={() => setEditEnquiry(false)}
          isVisible={editEnquiry}
          refetch={refetch}
          selectedQueries={selectedFollowUps}
          details={details}
          resetSelected={() => setSelectedFollowUps([])}
        />
      )}
    </View>
  );
};

export default memo(EnquiryDetailsTab);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  formColumn: {
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    // padding: 10,
    flex: 1,
  },
  headerRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 0.8,
    height: 65,
  },
  dataRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 0.8,
    height: 70,
  },
  headerTitle: {
    fontSize: 14,
  },
  dataText: {
    fontSize: 12,
    textAlign: "center",
  },
  submitBtn: {
    height: 41,
  },
  submitBtnText: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    textAlign: "center",
  },
});
