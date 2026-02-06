// import * as yup from "yup";
// import regEx from "../../constants/regEx";

// export const generateEnquiryFormValidation = yup.object().shape({
//   studentName: yup.string().required("Student name field is required"),
//   mobileNumber: yup
//     .string()
//     .required("Mobile number field is required")
//     .matches(regEx.mobile, "Enter a valid mobile number"),

//   courseDescription: yup.string().required("Description field is required"),
//   enquiryCourse: yup.string().required("Course field is required"),
// });


import * as yup from "yup";
import regEx from "../../constants/regEx";

export const generateEnquiryFormValidation = yup.object().shape({
  firstName: yup.string().required("First name field is required"),
  studentName: yup.string().required("Student name field is required"),
  mobileNumber: yup
    .string()
    .required("Mobile number field is required")
    .matches(regEx.mobile, "Enter a valid mobile number"),

  courseDescription: yup.string().required("Description field is required"),
  enquiryCourse: yup.string().required("Course field is required"),
});
