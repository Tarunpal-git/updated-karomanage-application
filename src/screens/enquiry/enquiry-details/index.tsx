import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  TScreenNavigator,
  TScreenNavigatorParams,
} from "../../../types/navigator/screen-navigator";
import { RootState } from "../../../app/store";
import Flex from "../../../@ui/flex/Flex";
import Tabs from "../../../@ui/tabs/Tabs";
import { useGetLeadFollowUpQuery } from "../../../apis/hooks/lead-management/query/useGetLeadFollowUp.query";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import EnquiryDetailsTab from "./tabs/EnquiryDetailsTab";
// import CallHistoryTab from "./tabs/CallHistoryTab";
import AnnouncementHistory from "../../students/student-details/sections/announcement-history/AnnouncementHistory";
import { mapLeadFollowUpToEnquiry } from "./utils/mapLeadFollowUpToEnquiry";

const EnquiryDetails = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const [tab, setTab] = useState("enquiryDetails");

  const { id, leadId } =
    useRoute<RouteProp<TScreenNavigatorParams, "EnquiryDetails">>().params;

  // 🔹 Auth data (required for getLeadFollowUp API)
  const selectedOrganization = useSelector(
    (state: RootState) => state.auth.selectedOrganization
  );
  const customerId = selectedOrganization?.customerId || "";
  const organizationId = selectedOrganization?.organizationId || "";

  // 🔹 Lead Source Type for enquiry
  const leadSourceType = "enquiry";

  // 🔹 Fetch follow-ups using getLeadFollowUp API only
  const {
    data: followUpData,
    isLoading: isLoadingFollowUps,
    refetch: refetchFollowUps,
  } = useGetLeadFollowUpQuery({
    leadId: leadId || id, // Use leadId if available, otherwise use enquiry id
    customerId: customerId || "",
    organizationId: organizationId || "",
    leadSourceType,
  });

  console.log("[EnquiryDetails] API Params:", {
    leadId: leadId || id,
    enquiryId: id,
    customerId,
    organizationId,
    leadSourceType,
  });
  console.log("[EnquiryDetails] Follow-up API Response:", followUpData);

  // 🔹 Create enquiry details from follow-ups API response
  const enquiryDetails: TEnquiryData | undefined = useMemo(() => {
    console.log("[EnquiryDetails] ========== FOLLOW-UP DATA DEBUG ==========");
    console.log("[EnquiryDetails] Follow-up Data (Raw):", followUpData);
    console.log("[EnquiryDetails] Follow-up Data (Stringified):", JSON.stringify(followUpData, null, 2));
    console.log("[EnquiryDetails] Is Loading Follow-ups:", isLoadingFollowUps);
    console.log("[EnquiryDetails] Follow-up Data Type:", typeof followUpData);
    console.log("[EnquiryDetails] Follow-up Data Keys:", followUpData ? Object.keys(followUpData) : "no data");
    console.log("[EnquiryDetails] Follow-up Data.data:", followUpData?.data);
    console.log("[EnquiryDetails] Follow-up Data.data is Array:", Array.isArray(followUpData?.data));
    console.log("[EnquiryDetails] Follow-up Data.data length:", Array.isArray(followUpData?.data) ? followUpData.data.length : "not array");

    // Map follow-ups from getLeadFollowUp API to enquiry format
    // Always create enquiry object even if follow-ups are empty
    if (!isLoadingFollowUps && followUpData) {
      // Create minimum enquiry object with follow-ups (even if empty)
      const mapped = mapLeadFollowUpToEnquiry(followUpData, undefined, id);
      console.log("[EnquiryDetails] Mapped Enquiry Details:", mapped);
      console.log("[EnquiryDetails] Mapped Follow-ups Count:", mapped?.followUp?.length);
      console.log("[EnquiryDetails] Mapped Follow-ups Array:", JSON.stringify(mapped?.followUp, null, 2));
      console.log("[EnquiryDetails] ========== END DEBUG ==========");
      return mapped;
    }

    // If still loading, return undefined to show loading state
    if (isLoadingFollowUps) {
      console.log("[EnquiryDetails] Still loading follow-ups");
      return undefined;
    }

    // If no data but not loading, create empty enquiry object
    console.log("[EnquiryDetails] No follow-up data, creating empty enquiry");
    const emptyEnquiry: TEnquiryData = {
      id: id || "",
      visited: false,
      followUp: [],
      studentName: "",
      enquiryCourse: "",
      status: "active",
      mobileNumber: "",
      email: "",
      parentName: "",
      parentContact: "",
      college: "",
      collegeDepartment: "",
      semester: "",
      collegeCourse: "",
      courseDescription: "",
      firstName: "",
      lastName: "",
      announcements: [],
    };
    return emptyEnquiry;
  }, [isLoadingFollowUps, followUpData, id]);

  // 🔹 Loading state
  const isLoading = isLoadingFollowUps;

  // 🔹 Refetch function
  const refetch = () => {
    refetchFollowUps();
  };

  return (
    <SafeView>
      <AppHeader
        title="Enquiry"
        showDrawer={false}
        handleBackClick={() => navigation.goBack()}
      />
      <Flex my={10} mx={25}>
        <Tabs
          tabs={[
            { label: "Enquiry Details", value: "enquiryDetails", flex: 1 },
            {
              label: "Announcement\nHistory",
              value: "announcementHistory",
              flex: 2,
            },
            { label: "Call\nHistory", value: "callHistory", flex: 1 },
          ]}
          onChange={(e) => setTab(e)}
          value={tab}
        />
      </Flex>

      <ThemeScrollView
        loading={isLoading}
        reloadData={refetch}
        paddingHorizontal={0}
      >
        {tab === "enquiryDetails" && enquiryDetails && (
          <Flex>
            <EnquiryDetailsTab 
              refetch={refetch} 
              details={enquiryDetails} 
              leadId={leadId || enquiryDetails?.leadId}
            />
          </Flex>
        )}
        {tab === "announcementHistory" && (
          <AnnouncementHistory
            announcements={enquiryDetails?.announcements ?? []}
          />
        )}
        {/* {tab === "callHistory" && (
          <Flex>
            <CallHistoryTab enquiryDetails={enquiryDetails} />
          </Flex>
        )} */}
      </ThemeScrollView>
    </SafeView>
  );
};

export default EnquiryDetails;
