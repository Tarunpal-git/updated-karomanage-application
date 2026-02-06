import { useQuery } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

const get = async () => {
  const response = await request({
    url: apiUrls.batch.FETCH_BATCHES_LIST_NEW,
    method: "GET",
    // New endpoint: /batch-fnp-prod/listBatches?customerId=...&organizationId=...
    // customerId and organizationId are automatically added by axios interceptor
  });
  return response;
};

export const useBatchListsQuery = () => {
  return useQuery({
    queryKey: [apiUrls.batch.FETCH_BATCHES_LIST_NEW],
    queryFn: get,
  });
};
