// import { useQuery } from "@tanstack/react-query";
// import { request } from "../../../../services/axios.service";
// import { LEAD_MANAGEMENT_PREFIX } from "../../../../constants";

// const getAllLeadsByFilter = async (formTemplateId: string) => {
//   const response = await request({
//     url: LEAD_MANAGEMENT_PREFIX + "getAllLeadsByFilter",
//     method: "GET",
//     params: {
//       formTemplateId: formTemplateId,
//     },
//   });
//   return response;
// };

// export const useGetAllLeadsByFilterQuery = (formTemplateId: string) => {
//   return useQuery({
//     queryKey: ["getAllLeadsByFilter", formTemplateId],
//     queryFn: () => getAllLeadsByFilter(formTemplateId),
//   });
// };

import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { LEAD_MANAGEMENT_PREFIX } from "../../../../constants";

type LeadFilterPayload = {
  organizationId: string;
  customerId: string;
  leadSourceType: string;
  startDate?: string;
  endDate?: string;
};

const getAllLeadsByFilter = async (payload: LeadFilterPayload) => {
  const response = await request({
    url: LEAD_MANAGEMENT_PREFIX + "getAllLeadsByFilter",
    method: "GET",
    params: {
      organizationId: payload.organizationId,
      customerId: payload.customerId,
      leadSourceType: payload.leadSourceType,
      startDate: payload.startDate || "",
      endDate: payload.endDate || "",
    },
  });

  return response;
};

export const useGetAllLeadsByFilterQuery = (payload: LeadFilterPayload) => {
  return useQuery({
    queryKey: ["getAllLeadsByFilter", payload],
    queryFn: () => getAllLeadsByFilter(payload),
    enabled: !!payload.organizationId && !!payload.customerId,
  });
};
