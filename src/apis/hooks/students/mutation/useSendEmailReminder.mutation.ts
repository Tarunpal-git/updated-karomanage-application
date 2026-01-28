import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

type TEmailReminderPayload = {
  studentName: string;
  courseName: string;
  studentEmail: string;
  installmentsArray: Array<{
    overDueDate: string;
    overDueAmount: number;
    index: string;
    courseId: string;
  }>;
  organizationName: string;
  organizationEmail: string;
  organizationLogo: string;
  organizationPhoneNumber: string;
  customerId: string;
  studentId: string;
  accountId: string;
  organizationId: string;
};

const sendEmailReminder = async (data: TEmailReminderPayload) => {
  const response = await request({
    url: apiUrls.emailServiceUrl.NOTIFY_UPCOMING_FEE_NOTIFICATION,
    method: "POST",
    data: data,
  });
  return response;
};

export const useSendEmailReminderMutation = () => {
  return useMutation({ mutationFn: sendEmailReminder });
};
