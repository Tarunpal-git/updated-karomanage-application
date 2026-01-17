import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";
import { store } from "../../../../app/store";
import { ORGANIZATION_PREFIX } from "../../../../constants";
 
/* ================= API FUNCTION ================= */
 
const createOrganization = async (data: any) => {
  console.log("🏢 === CREATE ORGANIZATION API CALL ===");
  console.log("API URL:", apiUrls.organization.CREATE_ORGANIZATION);
  console.log("Form Data:", JSON.stringify(data, null, 2));
 
  // Get auth user from store
  const authUser = store.getState().auth.authUser;
 
  console.log("Auth User:", authUser);
  console.log("Customer ID:", authUser?.customerId);
  console.log("User Name:", authUser?.customerName);
 
  // Build payload according to API structure
  // Screenshot shows two 'user' objects, but JavaScript doesn't allow duplicate keys
  // So we merge both into one 'user' object with all fields
  const payload: any = {
    user: {
      // From first user object (top level)
      userCustomerId: authUser?.customerId || "",
      userCustomerName: authUser?.customerName || "",
      // From second user object (with role details)
      roleId: "",
      roleName: "admin",
      userCustomerEmail: data.organizationEmail || "",
      userEmployeeId: "",
    },
    courses: [],
    customerId: authUser?.customerId || "",
    organizationAddress: data.organizationAddress || "",
    organizationCity: data.organizationCity || "",
    organizationCountry: data.organizationCountry || "",
    organizationDetails: data.organizationDetails || "",
    organizationEmail: data.organizationEmail || "",
    organizationId: data.organizationId || "", // Generated client-side
    organizationIntegrations: [],
    organizationLogo: data.organizationLogo || "",
    organizationName: data.organizationName || "",
    organizationPhoneNumber: data.organizationPhoneNumber || "",
    organizationPinCode: data.organizationPinCode || "",
    organizationPlan: {
      planName: data.organizationPlan?.planName || "demo plan",
    },
    organizationState: data.organizationState || "",
    organizationWebsiteUrl: data.organizationWebsiteUrl || "",
    // Add GST data if provided
    ...(data.gstRuleData && { gstRuleData: data.gstRuleData }),
  };
 
  console.log("Final Payload:", JSON.stringify(payload, null, 2));
  console.log("Payload Size:", JSON.stringify(payload).length, "bytes");
 
  const response = await request({
    url: apiUrls.organization.CREATE_ORGANIZATION,
    method: "POST",
    data: payload,
  });
 
  console.log("🏢 CREATE ORGANIZATION RESPONSE:", JSON.stringify(response, null, 2));
  console.log("Status Code:", response?.statusCode);
  console.log("Message:", response?.message);
  console.log("Organization ID:", response?.data?.organizationId);
  console.log("🏢 === END CREATE ORGANIZATION API CALL ===");
 
  return response;
};
 
/* ================= MUTATION HOOK ================= */
 
export const useCreateOrganizationMutation = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      console.log("🔄 Invalidating organization list queries...");
     
      // Invalidate organization list query
      queryClient.invalidateQueries({
        queryKey: [
          ORGANIZATION_PREFIX,
          apiUrls.organization.FETCH_ORGANIZATION_LISTS,
        ],
      });
     
      // Invalidate customer details query (also contains organization list)
      queryClient.invalidateQueries({
        queryKey: [apiUrls.organization.GET_CUSTOMER_DETAILS],
      });
     
      console.log("✅ Organization list queries invalidated - list will refresh automatically");
    },
  });
};
 
 
 