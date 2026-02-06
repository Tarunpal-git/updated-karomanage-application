// import * as yup from "yup";

// export const updateBatchFormValidation = yup.object().shape({
//   batchId: yup.string().required("Batch ID is required"),
//   batchName: yup.string()
//     .required("Batch name is required")
//     .max(250, "Batch name cannot exceed 250 characters"),
//   batchDescription: yup.string()
//     .max(500, "Batch description cannot exceed 500 characters")
//     .optional(),
//   courseId: yup.string().optional(),
//   batchStartDate: yup.string().required("Batch start date is required"),
//   batchEndDate: yup.string().required("Batch end date is required"),
//   setBatchTime: yup.string().required("Please select if you want to set batch time"),
//   batchClassStartTime: yup.string().when("setBatchTime", {
//     is: (val: string) => val === "Yes",
//     then: (schema) => schema.required("Start time is required"),
//     otherwise: (schema) => schema.optional(),
//   }),
//   batchClassEndTime: yup.string().when("setBatchTime", {
//     is: (val: string) => val === "Yes",
//     then: (schema) => schema.required("End time is required"),
//     otherwise: (schema) => schema.optional(),
//   }),
//   batchStatus: yup.string().required("Status is required"),
// }); 
import * as yup from "yup";

export const updateBatchFormValidation = yup.object().shape({
  batchId: yup.string().required("Batch ID is required"),
  batchName: yup.string()
    .required("Batch name is required")
    .max(250, "Batch name cannot exceed 250 characters"),
  batchDescription: yup.string()
    .max(500, "Batch description cannot exceed 500 characters")
    .optional(),
  courseId: yup.string().optional(),
  batchStartDate: yup.string().required("Batch start date is required"),
  batchEndDate: yup.string()
    .required("Batch end date is required")
    .test(
      "end-date-after-start-date",
      "Batch end date cannot be before the batch start date",
      function (value) {
        const { batchStartDate } = this.parent;
        if (!value || !batchStartDate) {
          return true; // Let required validation handle empty values
        }
        // Compare dates (format: YYYY-MM-DD)
        return new Date(value) >= new Date(batchStartDate);
      }
    ),
  setBatchTime: yup.string().required("Please select if you want to set batch time"),
  batchClassStartTime: yup.string().when("setBatchTime", {
    is: (val: string) => val === "Yes",
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.optional(),
  }),
  batchClassEndTime: yup.string().when("setBatchTime", {
    is: (val: string) => val === "Yes",
    then: (schema) => schema
      .required("End time is required")
      .test(
        "end-time-after-start-time",
        "Batch class end time cannot be before or equal to batch class start time",
        function (value) {
          const { batchClassStartTime } = this.parent;
          if (!value || !batchClassStartTime) {
            return true; // Let required validation handle empty values
          }
          
          // Helper function to convert time string (e.g., "06:00 AM") to minutes
          const timeToMinutes = (timeStr: string): number => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let totalMinutes = hours * 60 + minutes;
            if (period === 'PM' && hours !== 12) {
              totalMinutes += 12 * 60;
            }
            if (period === 'AM' && hours === 12) {
              totalMinutes -= 12 * 60;
            }
            return totalMinutes;
          };
          
          const startMinutes = timeToMinutes(batchClassStartTime);
          const endMinutes = timeToMinutes(value);
          
          return endMinutes > startMinutes;
        }
      ),
    otherwise: (schema) => schema.optional(),
  }),
  batchStatus: yup.string().required("Status is required"),
}); 