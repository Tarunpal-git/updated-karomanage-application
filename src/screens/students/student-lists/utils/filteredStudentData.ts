export const filteredStudentData = (
  data: TStudentList[],
  filters: {
    search: string;
    studentStatus: string;
    paymentStatus: string;
    courseName: string;
    batchName: string;
  }
) => {
  const { search } = filters;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((student) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      student.studentFirstName?.toLowerCase().includes(searchLower) ||
      student.studentLastName?.toLowerCase().includes(searchLower) ||
      student.studentEmail?.toLowerCase().includes(searchLower) ||
      student.studentContact?.includes(search) ||
      student.studentEnrollmentNumber?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });
};
