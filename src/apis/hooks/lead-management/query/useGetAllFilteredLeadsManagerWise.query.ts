import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { LEAD_MANAGEMENT_PREFIX } from "../../../../constants";

interface GetAllFilteredLeadsManagerWiseParams {
  customerId?: string;
  organizationId?: string;
}

const getAllFilteredLeadsManagerWise = async (params?: GetAllFilteredLeadsManagerWiseParams) => {
  const response = await request({
    url: LEAD_MANAGEMENT_PREFIX + "getAllFilteredLeadsManagerWise",
    method: "GET",
    params: {
      ...(params?.customerId && { customerId: params.customerId }),
      ...(params?.organizationId && { organizationId: params.organizationId }),
    },
    // Note: customerId and organizationId are also automatically added by axios interceptor from store
  });
  return response;
};

export const useGetAllFilteredLeadsManagerWiseQuery = (params?: GetAllFilteredLeadsManagerWiseParams) => {
  return useQuery({
    queryKey: ["getAllFilteredLeadsManagerWise", params?.customerId, params?.organizationId],
    queryFn: () => getAllFilteredLeadsManagerWise(params),
  });
};
