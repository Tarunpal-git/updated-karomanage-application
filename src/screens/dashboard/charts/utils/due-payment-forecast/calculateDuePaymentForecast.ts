export const calculateDuePaymentForecast = (
  data: TPaymentForecast[] | null | undefined
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  let totalDueAmount = 0;

  data.forEach((student) => {
    student.paymentForecast?.forEach((forecast) => {
      const { duePayment } = forecast.Details || {};
      if (typeof duePayment === "number") {
        totalDueAmount += duePayment;
      }
    });
  });

  return totalDueAmount;
};
