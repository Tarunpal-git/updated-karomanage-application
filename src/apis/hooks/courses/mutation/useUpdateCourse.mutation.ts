// import { useMutation } from "@tanstack/react-query";
// import { request } from "../../../../services/axios.service";
// import { apiUrls } from "../../../urls";
// import { store } from "../../../../app/store";

// const updateCourse = async (data: any) => {
//   const user = store.getState().auth.authUser;
//   const selectedOrganization = store.getState().auth.selectedOrganization;
  
//   // Process subjects to match web portal structure
//   const processedSubjects = (data.subjects || []).map((subject: any, index: number) => {
//     const subjectObj: any = {
//       subjectName: subject.subjectName,
//     };
    
//     // Only add subjectId if it exists and is NOT a temp ID
//     if (subject.subjectId && !subject.subjectId.startsWith('temp_') && !subject.subjectId.startsWith('temp-')) {
//       subjectObj.subjectId = subject.subjectId;
//       subjectObj.dateCreated = subject.dateCreated;
//     }
//     // Agar subjectId nahi hai, to backend ko proper ID generate karne denge
    
//     // Only add description if it's not empty
//     if (subject.subjectDescription && subject.subjectDescription.trim() !== '') {
//       subjectObj.subjectDescription = subject.subjectDescription;
//     }
    
//     return subjectObj;
//   });
//   const payload = {
//     user: {
//       userCustomerId: user?.customerId,
//       userCustomerName: user?.customerName,
//       userCustomerEmail: user?.customerEmail,
//       roleName: user?.userType || "admin",
//       roleId: "",
//       userEmployeeId: user?.employeeId || "",
//     },
//     customerId: selectedOrganization?.customerId,
//     organizationId: selectedOrganization?.organizationId,
//     courseId: data.courseId,
//     course: {
//       courseName: data.courseName,
//       courseDescription: data.courseDescription,
//       courseFee: Number(data.courseFee),
//       courseFeeDescription: data.courseFeeDescription,
//       maxPaymentInstallment: Number(data.maxPaymentInstallment),
//       courseDuration: Number(data.courseDurationYear) * 12 + Number(data.courseDurationMonth),
//       mode: data.mode || "offline",
//       courseStatus: data.courseStatus || "active",
//     },
//     subjects: processedSubjects, // Send subjects at root level like web portal
//   };
  
//   console.log('=== UPDATE COURSE PAYLOAD ===');
//   console.log('Payload:', JSON.stringify(payload, null, 2));
//   console.log('=== END UPDATE COURSE PAYLOAD ===');
  
//   return request({
//     url: apiUrls.course.UPDATE_COURSE,
//     method: "POST",
//     data: payload,
//   });
// };

// export const useUpdateCourseMutation = () => useMutation({ mutationFn: updateCourse }); 

import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { store } from "../../../../app/store";

const updateCourse = async (data: any) => {
  const user = store.getState().auth.authUser;
  const selectedOrganization = store.getState().auth.selectedOrganization;
  
  // Process subjects to match web portal structure
  // IMPORTANT: Existing subjects must include subjectId and dateCreated
  // New subjects should only have subjectName (let backend generate ID)
  const processedSubjects = (data.subjects || []).map((subject: any, index: number) => {
    // Ensure subjectName is always a valid string
    const subjectName = subject.subjectName?.trim() || "";
    if (!subjectName) {
      console.warn(`⚠️ Subject at index ${index} has empty or undefined subjectName`);
    }
    
    // Check if this is an existing subject (has real subjectId) or new subject
    const hasRealSubjectId = subject.subjectId && 
      !subject.subjectId.startsWith('temp_') && 
      !subject.subjectId.startsWith('temp-');
    
    if (hasRealSubjectId) {
      // EXISTING SUBJECT: Include subjectId and dateCreated (as per web payload)
      const subjectObj: any = {
        subjectId: subject.subjectId,
        subjectName: subjectName,
        dateCreated: subject.dateCreated || Date.now(),
      };
      
      // Only add description if it's not empty
      if (subject.subjectDescription && subject.subjectDescription.trim() !== '') {
        subjectObj.subjectDescription = subject.subjectDescription;
      }
      
      return subjectObj;
    } else {
      // NEW SUBJECT: Send with temporary ID (like web portal does)
      // Backend will replace temporary ID with real ID
      // Format: temp_{timestamp}_{randomNumber}
      const subjectObj: any = {
        subjectName: subjectName,
      };
      
      // Include temporary ID if provided (helps backend track the subject)
      // Web portal sends temporary IDs, so backend accepts them
      if (subject.subjectId && (subject.subjectId.startsWith('temp_') || subject.subjectId.startsWith('temp-'))) {
        subjectObj.subjectId = subject.subjectId;
        // Also include dateCreated if provided (temporary timestamp)
        if (subject.dateCreated) {
          subjectObj.dateCreated = subject.dateCreated;
        }
      }
      
      // Only add description if it's not empty
      if (subject.subjectDescription && subject.subjectDescription.trim() !== '') {
        subjectObj.subjectDescription = subject.subjectDescription;
      }
      
      return subjectObj;
    }
  });
  
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
    courseId: data.courseId,
    course: {
      courseName: data.courseName,
      courseDescription: data.courseDescription,
      courseFee: Number(data.courseFee),
      courseFeeDescription: data.courseFeeDescription,
      maxPaymentInstallment: Number(data.maxPaymentInstallment),
      courseDuration: Number(data.courseDurationYear) * 12 + Number(data.courseDurationMonth),
      mode: data.mode || "offline",
      courseStatus: data.courseStatus || "active",
    },
    subjects: processedSubjects, // Send subjects at root level like web portal
  };
  
  console.log('=== UPDATE COURSE PAYLOAD ===');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('=== END UPDATE COURSE PAYLOAD ===');
  
  return request({
    url: apiUrls.course.UPDATE_COURSE,
    method: "POST",
    data: payload,
  });
};

export const useUpdateCourseMutation = () => useMutation({ mutationFn: updateCourse }); 