import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

/* ================= API FUNCTION ================= */

const validateOrgEmailPhone = async (data: {
  customerId: string;
  organizationPhoneNumber: string;
  organizationEmail: string;
  flag: string;
}) => {
  return request({
    url: apiUrls.organization.VALIDATE_ORG_EMAIL_PHONE,
    method: "GET",
    params: {
      customerId: data.customerId,
      organizationPhoneNumber: data.organizationPhoneNumber,
      organizationEmail: data.organizationEmail,
      flag: data.flag,
    },
  });
};

/* ================= MUTATION HOOK ================= */

export const useValidateOrgEmailPhoneMutation = () =>
  useMutation({
    mutationFn: validateOrgEmailPhone,
  });

