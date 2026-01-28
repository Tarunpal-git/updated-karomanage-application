import { useMutation } from "@tanstack/react-query";
import { request } from "../../../../services/axios.service";
import { apiUrls } from "../../../urls";

type TStudentFeeSlipPayload = {
  action: "studentFeeSlip";
  studentFeeSlip: {
    studentFeeSlipCustomerId: string;
    studentFeeSlipOrganiationId: string;
    studentFeeSlipOrganizationName: string;
    studentFeeSlipOrganizationLogo: string;
    studentFeeSlipEnrollmentNo: string;
    studentFeeSlipRollNo: string;
    studentFeeSlipStudentEmail: string;
    studentFeeSlipOrganizationEmail: string;
    studentFeeSlipOrganizationAddress: string;
    studentFeeSlipOrganizationPhoneNumber: string;
    studentFeeSlipReceiptNo: number;
    studentFeeSlipStudentName: string;
    studentFeeSlipCourseName: string;
    studentFeeSlipCourseId: string;
    studentFeeSlipInstallmentId: string;
    studentFeeSlipPaymentMode: string;
    studentFeeSlipTransactionId: string;
    studentFeeSlipPaymentRecieverId: string;
    studentFeeSlipAmountInWords: string;
    studentFeeSlipPurpose: string;
    studentFeeSlipDate: string;
    studentFeeSlipGSTIN: string;
    studentFeeSlipStudentPhoneNumber: string;
    studentFeeSlipWebsiteUrl: string;
    studentFeeSlipStudentAddress: string;
    studentFeeSlipSGSTPercentage: number;
    studentFeeSlipCGSTPercentage: number;
    studentFeeSlipSGSTAmount: number;
    studentFeeSlipCGSTAmount: number;
    studentFeeSlipGrandTotal: number;
    studentFeeSlipCourseFee: number;
    previousFeeSlipReceivedAmount: number;
    totalRemainingDueAmount: number;
    studentFeeSlipDiscountAmount: number;
    studentFeeSlipAmountAfterDiscount: number;
    studentFeeSlipPaidAmount: number;
    receivedPaymentCGSTAmount: number;
    receivedPaymentSGSTAmount: number;
    studentFeeSlipTutionFee: number;
    studentFeeSlipDueAmount: number;
    previousDiscountAmount: number;
    inclusionType: string;
  };
};

const sendStudentFeeSlipInvoice = async (data: TStudentFeeSlipPayload) => {
  const response = await request({
    url: apiUrls.emailServiceUrl.INVOKE_MAIL,
    method: "POST",
    data: data,
  });
  return response;
};

export const useSendStudentFeeSlipInvoiceMutation = () => {
  return useMutation({ mutationFn: sendStudentFeeSlipInvoice });
};
