import AppConfig from "../utils/config";

export const CONSTANT = {
  // FLAGS are now dynamic and fetched from API
  // Use useDynamicFlags hook instead of this hardcoded array
  FLAGS: [
    { label: "Select Flag", value: "" },
    { label: "Interested", value: "Interested" },
    { label: "Not Interested", value: "Not Interested" },
    { label: "Call later", value: "Call later" },
    { label: "Call not picked", value: "Call not picked" },
    { label: "Attend Demo", value: "Attend Demo" },
  ],

  ENQUIRY_STATUS: [
    { label: "Current Status", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inActive" },
    { label: "Delete", value: "delete" },
    { label: "Student", value: "student" },
  ],

  MONTHS: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export const ORGANIZATION_PREFIX = `/organizationDetails${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const DASHBOARD_PREFIX = `/dashboard-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const ENQUIRY_PREFIX = `/EnquiryDetails${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const USER_MANAGEMENT_PREFIX = `/userManagement-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const STUDENT_PREFIX = `/student-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const BATCH_PREFIX = `/batch-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const ATTENDANCE_PREFIX = `/attendance-management-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const EMPLOYEES_PREFIX = `/employeeAdmission${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const REPORTS_PREFIX = `/reports-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const MAIL_SERVICE_PREFIX = `/email-services-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const TEACHER_PREFIX = `/teacher-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const COLLEGE_PREFIX = `/college-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const CUSTOMER_REGISTRATION_PREFIX = `/customer-registration${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const EXPENSES_PREFIX = `/inventories-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const TIME_TABLE_PREFIX = `/timeTable-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
export const CLASSROOM_PREFIX = `/classroom-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;
 

export const NOTIFICATION_HUB_PREFIX = `/notification-hub-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;

export const ORGANIZATION_INTEGRATIONS_PREFIX = `/organizationIntegrations-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;

export const AGENT_MANAGEMENT_PREFIX = `/agent-management-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;

export const LEAD_MANAGEMENT_PREFIX = `/leadManagement-fnp${
  AppConfig.REACT_APP_MODE === "prod" ? "-prod" : ""
}/`;

export const TESTING_STUDENT_DATA = [
  {
    studentEnrollment: "T-1",
    studentName: "Tushar Kaushal",
    mobileNumber: "0987654321",
    email: "tushar12@gmail.com",
    studentStatus: "Active",
    paymentStatus: "Paid",
  },
  {
    studentEnrollment: "T-2",
    studentName: "Tushar Kaushal",
    mobileNumber: "0987654321",
    email: "tushar12@gmail.com",
    studentStatus: "Active",
    paymentStatus: "Paid",
  },
  {
    studentEnrollment: "T-8",
    studentName: "Tushar Kaushal",
    mobileNumber: "0987654321",
    email: "tushar12@gmail.com",
    studentStatus: "Active",
    paymentStatus: "Paid",
  },
  {
    studentEnrollment: "T-8",
    studentName: "Tushar Kaushal",
    mobileNumber: "0987654321",
    email: "tushar12@gmail.com",
    studentStatus: "Active",
    paymentStatus: "Paid",
  },
];
