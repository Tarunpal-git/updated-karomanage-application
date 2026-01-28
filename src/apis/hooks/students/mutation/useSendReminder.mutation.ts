import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

type TReminderPayload = {
  customerId: string;
  organizationId: string;
  user: {
    userCustomerId: string;
    userCustomerName: string;
    userCustomerEmail: string;
    roleName: string;
    roleId: string;
    userEmployeeId: string;
  };
  action: {
    actionOn: string[];
    singleNumber: string;
    templateName: string;
    templateId: string;
    bodyParams: Array<{
      type: string;
      text: string | number;
    }>;
    textBodyParams: Array<{
      value: string;
    }>;
    smsTemplateId?: string;
    smsNumber?: string;
  };
  walletId: string;
};

const sendReminder = async (data: TReminderPayload) => {
  const response = await request({
    url: apiUrls.emailServiceUrl.SEND_REMINDER,
    method: "POST",
    data: data,
  });
  return response;
};

export const useSendReminderMutation = () => {
  return useMutation({ mutationFn: sendReminder });
};
