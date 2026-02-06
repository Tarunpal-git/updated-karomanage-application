import { useQuery } from "@tanstack/react-query";

import axios from "axios";

import { apiUrls } from "../../../urls";
import AppConfig from "../../../../utils/config";
import { store } from "../../../../app/store";

const get = async (
  organization:
    | Pick<
        TOrganizationName,
        "customerId" | "organizationId" | "lastUpdatedDate"
      >
    | undefined
) => {
  const response = await axios({
    url: `${AppConfig.REACT_APP_API_BASE_QUERY}/${apiUrls.leadManagement.GET_ALL_LEADS_BY_FILTER}`,
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": AppConfig.REACT_APP_SUBSCRIPTION_KEY,
    },
    params: {
      organizationId: organization?.organizationId,
      customerId: organization?.customerId,
      leadSourceType: "enquiry",
      startDate: undefined,
      endDate: undefined,
    },
  });

  return response.data;
};

export const useEnquiryListsQuery = () => {
  const organization = store.getState().auth.selectedOrganization;

  return useQuery({
    queryKey: [apiUrls.leadManagement.GET_ALL_LEADS_BY_FILTER, organization],
    queryFn: () => get(organization),
  });
};