import { MAIL_SERVICE_PREFIX } from "../../constants";

const TEXT_MESSAGE_INTEGRATION_PREFIX = `/textMessageIntegration-fnp-prod/`;

export const emailServiceUrl = {
  INVOKE_MAIL: MAIL_SERVICE_PREFIX + "manual/paths/invoke",
  NOTIFY_UPCOMING_FEE_NOTIFICATION:
    MAIL_SERVICE_PREFIX + "studentUpcomingFeeNotification",
  SEND_REMINDER: TEXT_MESSAGE_INTEGRATION_PREFIX + "commonSmsAndWhatsappMessageSend",
};
