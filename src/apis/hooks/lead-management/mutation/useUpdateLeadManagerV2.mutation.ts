import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { store } from "../../../../app/store";

type TLeadManagerV2Payload = {
  leadId: string[];
  id: string[];
  flag: "enquiry" | "singleForm" | "bulkForm";
  leadManager: {
    managerName: string;
    employeeId: string;
    designation: string;
  };
};

const updateLeadManagerV2 = async (data: TLeadManagerV2Payload) => {
  const organization = store.getState().auth.selectedOrganization;
  const authUser = store.getState().auth.authUser;

  // Build user object
  const userCustomerName = authUser?.customerName
    ? (authUser?.lastName ? `${authUser.customerName} ${authUser.lastName}` : authUser.customerName)
    : "";

  const payload = {
    customerId: organization?.customerId ?? "",
    organizationId: organization?.organizationId ?? "",
    leadId: data.leadId,
    id: data.id,
    flag: data.flag,
    leadManager: data.leadManager,
    user: {
      userCustomerId: authUser?.customerId || "",
      userCustomerName: userCustomerName,
      userCustomerEmail: authUser?.customerEmail || "",
      roleName: (organization as any)?.role?.roleName || "",
      roleId: (organization as any)?.role?.roleId || "",
      userEmployeeId: authUser?.employeeId || "",
    },
  };

  const response = await request({
    url: apiUrls.leadManagement.UPDATE_LEAD_MANAGER_V2,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useUpdateLeadManagerV2Mutation = () => {
  return useMutation({ mutationFn: updateLeadManagerV2 });
};
