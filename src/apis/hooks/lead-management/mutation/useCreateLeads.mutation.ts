import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { useAppSelector } from "../../../../app/hooks";

type TCreateLeadsPayload = {
  customerID: string;
  organizationId: string;
  enquiryCourse: string;
  status: string;
  user: {
    userCustomerId: string;
    userCustomerName: string;
    userCustomerEmail: string;
    roleName: string;
    roleId: string;
    userEmployeeId: string;
  };
  customerId: string;
  leadName: string;
  followUp: Array<{
    createDate: string;
    followUpDate: string;
    description: string;
    message: string;
  }>;
  leadMobileNumber: string;
  leadSourceType: string;
  leadEmail?: string;
  courseDescription: string;
};

const createLeads = async (data: TCreateLeadsPayload) => {
  const response = await request({
    url: apiUrls.leadManagement.CREATE_LEADS,
    method: "POST",
    data: data,
  });
  return response;
};

export const useCreateLeadsMutation = () => {
  const { authUser, selectedOrganization } = useAppSelector(
    (state) => state.auth
  );

  return useMutation({
    mutationFn: async (formData: {
      studentName: string;
      mobileNumber: string;
      email?: string;
      enquiryCourse: string;
      courseDescription: string;
    }) => {
      // Format current date as DD/MM/YYYY
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const payload: TCreateLeadsPayload = {
        customerID: selectedOrganization?.customerId ?? "",
        organizationId: selectedOrganization?.organizationId ?? "",
        enquiryCourse: formData.enquiryCourse,
        status: "active",
        user: {
          userCustomerId: authUser?.customerId ?? "",
          userCustomerName: authUser?.customerName ?? "",
          userCustomerEmail: authUser?.customerEmail ?? "",
          roleName: (selectedOrganization as any)?.role?.roleName ?? "",
          roleId: (selectedOrganization as any)?.role?.roleId ?? "",
          userEmployeeId: authUser?.employeeId ?? "",
        },
        customerId: selectedOrganization?.customerId ?? "",
        leadName: formData.studentName,
        followUp: [
          {
            createDate: formattedDate,
            followUpDate: formattedDate,
            description: "",
            message: "created",
          },
        ],
        leadMobileNumber: formData.mobileNumber,
        leadSourceType: "enquiry",
        leadEmail: formData.email,
        courseDescription: formData.courseDescription,
      };

      return createLeads(payload);
    },
  });
};
