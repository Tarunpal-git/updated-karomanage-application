import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { ORGANIZATION_PREFIX } from "../../../../constants";
 
interface AcceptInvitationParams {
  parentCustomerId: string;
  organizationId: string;
  customerId: string;
  userId: string;
}
 
const get = async (params: AcceptInvitationParams) => {
  const response = await request({
    url: apiUrls.organization.ACCEPT_INVITATION,
    method: "GET",
    params: {
      parentCustomerId: params.parentCustomerId,
      organizationId: params.organizationId,
      customerId: params.customerId,
      userId: params.userId,
    },
  });
  return response;
};
 
export const useAcceptInvitationQuery = (params: AcceptInvitationParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: [
      ORGANIZATION_PREFIX,
      apiUrls.organization.ACCEPT_INVITATION,
      params,
    ],
    queryFn: () => get(params),
    enabled: enabled && !!params.parentCustomerId && !!params.organizationId && !!params.customerId && !!params.userId,
  });
};
 
 
 