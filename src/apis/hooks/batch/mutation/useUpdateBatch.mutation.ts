import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { store } from "../../../../app/store";
import moment from "moment";

const updateBatch = async (data: any) => {
  const user = store.getState().auth.authUser;
  const selectedOrganization = store.getState().auth.selectedOrganization;
  
  // Process subjects array - can be mix of strings (subjectId) and objects {subjectId, startTime, endTime, teacherId}
  const processedSubjects = (data.subjects || []).map((subject: any) => {
    if (typeof subject === "string") {
      // If it's a string, keep it as string (just subjectId)
      return subject;
    } else if (subject.subjectId) {
      // If it's an object, ensure proper structure
      return {
        subjectId: subject.subjectId,
        startTime: subject.startTime || null,
        endTime: subject.endTime || null,
        teacherId: subject.teacherId || "",
      };
    }
    // Fallback: if it's an object without subjectId, try to extract id
    return subject.id || subject;
  });
  
  // Get batch details from data if provided (for complete batch object structure)
  const batchDetails = data.batchDetails || {};
  
  // Build batch object matching web format
  const batchObject: any = {
    customerId: selectedOrganization?.customerId || batchDetails.customerId || "",
    organizationId: selectedOrganization?.organizationId || batchDetails.organizationId || "",
    courses: batchDetails.courses || data.courses || [],
    students: batchDetails.students || data.students || [],
    teacher: batchDetails.teacher || data.teacher || [],
    batchName: data.batchName || batchDetails.batchName || "",
    batchDescription: batchDetails.batchDescription || data.batchDescription || "",
    batchClassStartTime: data.setBatchTime === "Yes" ? (data.batchClassStartTime || "") : "",
    batchClassEndTime: data.setBatchTime === "Yes" ? (data.batchClassEndTime || "") : "",
    batchStartDate: data.batchStartDate ? moment(data.batchStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : (batchDetails.batchStartDate || ""),
    batchEndDate: data.batchEndDate ? moment(data.batchEndDate, "YYYY-MM-DD").format("DD/MM/YYYY") : (batchDetails.batchEndDate || ""),
    batchId: data.batchId || batchDetails.batchId || "",
    dateCreated: batchDetails.dateCreated || 0,
    lastUpdatedDate: batchDetails.lastUpdatedDate || Date.now(),
    batchStatus: data.batchStatus || batchDetails.batchStatus || "active",
    subjects: processedSubjects, // Include subjects in batch object
  };
  
  // Add id if present in batchDetails
  if (batchDetails.id) {
    batchObject.id = batchDetails.id;
  }
  
  const payload = {
    user: {
      userCustomerId: user?.customerId,
      userCustomerName: user?.customerName,
      userCustomerEmail: user?.customerEmail,
      roleName: user?.userType || "admin",
      roleId: "",
      userEmployeeId: user?.employeeId || "",
    },
    customerId: selectedOrganization?.customerId,
    organizationId: selectedOrganization?.organizationId,
    batchId: data.batchId,
    batch: batchObject, // Complete batch object matching web format
    subjects: processedSubjects, // Also at root level
  };
  
  console.log('=== UPDATE BATCH PAYLOAD ===');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('=== END UPDATE BATCH PAYLOAD ===');
  
  return request({
    url: apiUrls.batch.UPDATE_BATCH,
    method: "POST",
    data: payload,
  });
};

export const useUpdateBatchMutation = () => useMutation({ mutationFn: updateBatch });

