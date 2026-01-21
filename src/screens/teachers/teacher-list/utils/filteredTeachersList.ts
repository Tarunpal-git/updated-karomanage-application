// export const filteredTeachersList = (
//   data: TTeacherData[],
//   filters: {
//     search: string;
//   }
// ) => {
//   const { search } = filters;

//   return data.filter((teacher) => {
//     const matchesSearch =
//       !search ||
//       `${teacher.teacherFirstName} ${teacher.teacherLastName ?? ""}`
//         .toLowerCase()
//         .includes(search.toLowerCase());

//     return matchesSearch;
//   });
// };
export const filteredTeachersList = (
  data: TTeacherData[],
  filters: {
    search: string;
  }
) => {
  const { search } = filters;

  return data.filter((teacher) => {
    // ✅ status check (MAIN FIX)
    const isActive =
      teacher.teacherStatus?.toLowerCase() === "active";

    const matchesSearch =
      !search ||
      `${teacher.teacherFirstName ?? ""} ${teacher.teacherLastName ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    // ✅ dono condition pass honi chahiye
    return isActive && matchesSearch;
  });
};
