import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import AppConfig from "../../../../utils/config";

/* ================= API FUNCTION ================= */

const organizationPhoneOtpVerification = async (data: {
  flag: string;
  organizationPhoneNumber: string;
}) => {
  const payload = {
    flag: data.flag,
    organizationPhoneNumber: data.organizationPhoneNumber,
  };

  // Use axios directly with full URL since this is an external API
  const response = await axios.post(
    "https://karomanage-prod-apim.azure-api.net/EnquiryDetails-prod/otpVerificationEnquiry",
    payload,
    {
      headers: {
        [`${AppConfig.REACT_APP_SUBSCRIPTION_HEADER}`]: `${AppConfig.REACT_APP_SUBSCRIPTION_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* ================= MUTATION HOOK ================= */

export const useOrganizationPhoneOtpVerificationMutation = () =>
  useMutation({
    mutationFn: organizationPhoneOtpVerification,
  });

