import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { store } from "../../../../app/store";

type TStudentsListFilters = {
  studentStatus?: string;
  paymentStatus?: string;
  paymentMode?: string;
  paymentDateStart?: string;
  paymentDateEnd?: string;
  admissionDateStart?: string;
  admissionDateEnd?: string;
  courseName?: string; // Internal name, contains courseId value
  batchName?: string; // Internal name, contains batchId value
  courseId?: string; // API parameter name
  batchId?: string; // API parameter name
};

const get = async (filters: TStudentsListFilters = {}) => {
  const state = store.getState();
  const authUser = state.auth.authUser;
  const selectedOrganization = state.auth.selectedOrganization as any;

  const userType = authUser?.userType; // e.g. "admin" | "subUser"
  const roleName = selectedOrganization?.role?.roleName; // e.g. "admin"

  const params: Record<string, unknown> = {
    // These will be merged with customerId & organizationId from axios interceptor
    userType,
    roleName,
  };

  // Match web URL behaviour: &studentStatus=active
  if (filters.studentStatus) {
    params.studentStatus = filters.studentStatus;
  }

  if (filters.paymentStatus) {
    params.paymentStatus = filters.paymentStatus;
  }

  if (filters.paymentMode) {
    params.paymentMode = filters.paymentMode;
  }

  if (filters.paymentDateStart) {
    params.paymentReceiveDateFrom = filters.paymentDateStart;
  }

  if (filters.paymentDateEnd) {
    params.paymentReceiveDateTo = filters.paymentDateEnd;
  }

  if (filters.admissionDateStart) {
    params.admissionDateFrom = filters.admissionDateStart;
  }

  if (filters.admissionDateEnd) {
    params.admissionDateTo = filters.admissionDateEnd;
  }

  // Support both courseName (legacy) and courseId (new)
  if (filters.courseId) {
    params.courseId = filters.courseId;
  } else if (filters.courseName) {
    params.courseId = filters.courseName; // courseName contains courseId value
  }

  // Support both batchName (legacy) and batchId (new)
  if (filters.batchId) {
    params.batchId = filters.batchId;
  } else if (filters.batchName) {
    params.batchId = filters.batchName; // batchName contains batchId value
  }

  const response = await request({
    url: apiUrls.student.FETCH_ALL_STUDENTS,
    method: "GET",
    params,
  });
  return response;
};

export const useStudentsListQuery = (filters: TStudentsListFilters = {}) => {
  return useQuery({
    queryKey: [apiUrls.student.FETCH_ALL_STUDENTS, filters],
    queryFn: () => get(filters),
  });
};
