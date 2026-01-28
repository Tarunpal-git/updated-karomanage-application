import { ReactNode } from "react";

type TLeadFollowUpResponse = {
  msg?: string;
  code?: number;
  statusCode?: number;
  data: Array<{
    createDate: string;
    followUpDate: string;
    description: string;
    message: string;
    followUpId: string;
    lastModifiedDate: number;
    flag?: string;
  }>;
  [key: string]: any;
};

/**
 * Maps getLeadFollowUp API response to TEnquiryData format
 * Merges follow-ups from API with existing enquiry details
 * If no existing enquiry, creates minimum enquiry object with follow-ups
 */
export const mapLeadFollowUpToEnquiry = (
  followUpResponse: TLeadFollowUpResponse,
  existingEnquiry: TEnquiryData | undefined,
  enquiryId?: string
): TEnquiryData | undefined => {
  console.log("[mapLeadFollowUpToEnquiry] Follow-up Response:", followUpResponse);
  console.log("[mapLeadFollowUpToEnquiry] Existing Enquiry:", existingEnquiry);

  if (!followUpResponse) {
    console.log("[mapLeadFollowUpToEnquiry] No follow-up response, returning existing enquiry");
    return existingEnquiry;
  }

  // Extract data array - check multiple possible structures
  let followUpArray: any[] = [];
  
  // Check if data is directly an array (most common case)
  if (Array.isArray(followUpResponse.data)) {
    followUpArray = followUpResponse.data;
    console.log("[mapLeadFollowUpToEnquiry] ✅ Data is array, length:", followUpArray.length);
  }
  // Check if data is nested in data.data
  else if (followUpResponse.data && typeof followUpResponse.data === 'object' && Array.isArray((followUpResponse.data as any).data)) {
    followUpArray = (followUpResponse.data as any).data;
    console.log("[mapLeadFollowUpToEnquiry] ✅ Data nested in data.data, length:", followUpArray.length);
  }
  // Check if response itself is an array (unlikely but possible)
  else if (Array.isArray(followUpResponse)) {
    followUpArray = followUpResponse;
    console.log("[mapLeadFollowUpToEnquiry] ✅ Response is array, length:", followUpArray.length);
  }
  else {
    console.log("[mapLeadFollowUpToEnquiry] ❌ Could not extract follow-up array");
    console.log("[mapLeadFollowUpToEnquiry] Response structure:", {
      hasData: !!followUpResponse.data,
      dataIsArray: Array.isArray(followUpResponse.data),
      dataType: typeof followUpResponse.data,
      responseKeys: Object.keys(followUpResponse),
      dataValue: followUpResponse.data,
    });
  }

  console.log("[mapLeadFollowUpToEnquiry] Follow-up Array:", JSON.stringify(followUpArray, null, 2));
  console.log("[mapLeadFollowUpToEnquiry] Follow-up Array Length:", followUpArray.length);

  // Map followUp array from API response (even if empty array)
  // Note: API stores flag value in 'description' field, but UI displays it as 'flag'
  const mappedFollowUp: TFollowUp[] = followUpArray.map((followUp) => ({
    createDate: followUp.createDate || "",
    followUpDate: followUp.followUpDate || "",
    description: followUp.description || "",
    message: followUp.message || "",
    flag: (followUp.description || followUp.flag || "") as ReactNode, // Map description to flag for display
    followUpId: followUp.followUpId || "",
    lastModifiedDate: followUp.lastModifiedDate,
  }));

  console.log("[mapLeadFollowUpToEnquiry] Mapped Follow-ups:", mappedFollowUp);
  console.log("[mapLeadFollowUpToEnquiry] Mapped Follow-ups Count:", mappedFollowUp.length);

  // Merge with existing enquiry data, replacing followUp array (even if empty)
  if (existingEnquiry) {
    const merged = {
      ...existingEnquiry,
      followUp: mappedFollowUp,
    };
    console.log("[mapLeadFollowUpToEnquiry] Merged Enquiry with Follow-ups:", merged);
    console.log("[mapLeadFollowUpToEnquiry] Merged Follow-ups Count:", merged.followUp.length);
    return merged;
  }

  // If no existing enquiry, create minimum enquiry object with follow-ups
  // This is needed when getSingleStudentDetail API is not available
  const minimumEnquiry: TEnquiryData = {
    id: enquiryId || "", // Set from route params
    visited: false,
    followUp: mappedFollowUp,
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

  console.log("[mapLeadFollowUpToEnquiry] Created minimum enquiry with Follow-ups:", minimumEnquiry);
  console.log("[mapLeadFollowUpToEnquiry] Follow-ups Count:", minimumEnquiry.followUp.length);
  return minimumEnquiry;
};
