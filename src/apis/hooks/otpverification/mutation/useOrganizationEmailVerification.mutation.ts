import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import {manualUrls} from "../../../urls";


/* ================= API FUNCTION ================= */

const organizationEmailVerification = async (data: {
  organizationName: string;
  organizationEmail: string;
  encryptedOtp: string;
  iv: string;
}) => {

  const payload = {
    action: "organizationEmailVerification",
    organizationEmailVerification: {
      organizationEmailVerificationOrganizationName: data.organizationName,
      organizationEmailVerificationValidationCode: {
        encryptedOtp: data.encryptedOtp,
        iv: data.iv,
      },
      organizationEmailVerificationOrganizationEmail: data.organizationEmail,
    },
  };

  return request({
    url: manualUrls.INVOKE_PATH,
    method: "POST",
    data: payload,
  });
};

/* ================= MUTATION HOOK ================= */

export const useOrganizationEmailVerificationMutation = () =>
  useMutation({
    mutationFn: organizationEmailVerification,
  });