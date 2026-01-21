// import { StyleSheet, TouchableOpacity } from "react-native";
// import React, { useMemo, useState } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import { useNavigation } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";

// import Flex from "../../../@ui/flex/Flex";
// import Avatar from "../../../@ui/avatar/Avatar";
// import SearchBar from "../../../@ui/search-bar/SearchBar";

// import { useTeachersListQuery } from "../../../apis/hooks/teachers/query/useTeachersList.query";
// import { filteredTeachersList } from "./utils/filteredTeachersList";

// const TeacherList = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const { data, isLoading, refetch } = useTeachersListQuery();
//   const [filter, setFilter] = useState({ search: "" });
// console.log("Teacher List Data:", data);

//   const teachers: TTeacherData[] = useMemo(() => {
//     if (!isLoading && data.statuscode === 200) {
//       return filteredTeachersList(data.data, filter);
//     } else {
//       return [];
//     }
//   }, [isLoading, data, filter]);

//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Teacher List"
//         handleBackClick={() => navigation.goBack()}
//       />
//       <Flex my={10} mx={30}>
//         <SearchBar
//           onChange={(text) =>
//             setFilter((state) => ({ ...state, search: text }))
//           }
//           value={filter.search}
//         />
//       </Flex>
//       <ThemeScrollView
//         paddingHorizontal={25}
//         loading={isLoading}
//         reloadData={refetch}
//       >
//         <Flex
//           flexDirection="column"
//           align="flex-start"
//           mt={20}
//           styles={{ flexWrap: "wrap" }}
//         >
//           {teachers.map((teacher, index) => (
//             <TouchableOpacity
//               style={{
//                 ...styles.batchRow,
//                 borderBottomWidth: teachers.length === index + 1 ? 0 : 1,
//               }}
//               key={teacher.id}
//               onPress={() =>
//                 navigation.navigate("TeacherDetails", {
//                   teacherId: teacher.teacherId,
//                 })
//               }
//             >
//               <Avatar
//                 textStyle={{ fontSize: 14 }}
//                 content={`${teacher?.teacherFirstName} ${
//                   teacher?.teacherLastName ?? ""
//                 }`}
//                 size={30}
//                 characters={1}
//               />
//               <ScalableText style={styles.batchName} fontFamily="Medium">
//                 {teacher?.teacherFirstName} {teacher?.teacherLastName}
//               </ScalableText>
//             </TouchableOpacity>
//           ))}
//         </Flex>
//       </ThemeScrollView>
//     </SafeView>
//   );
// };

// export default TeacherList;

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 18,
//     color: COLORS.primary,
//   },
//   batchRow: {
//     flexDirection: "row",

//     alignItems: "center",
//     backgroundColor: COLORS.white,

//     paddingVertical: 10,
//     paddingBottom: 19,
//     borderRadius: 8,
//     marginBottom: 10,
//     width: "100%",
//     borderBottomWidth: 1,
//     borderColor: "#BEBEBE",
//   },
//   batchName: {
//     fontSize: 14,
//     textTransform: "capitalize",
//     marginLeft: 22,
//   },
// });
// import { StyleSheet, TouchableOpacity } from "react-native";
// import React, { useMemo, useState, useCallback } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";

// import Flex from "../../../@ui/flex/Flex";
// import Avatar from "../../../@ui/avatar/Avatar";
// import SearchBar from "../../../@ui/search-bar/SearchBar";

// import { useTeachersListQuery } from "../../../apis/hooks/teachers/query/useTeachersList.query";
// import { filteredTeachersList } from "./utils/filteredTeachersList";

// const TeacherList = () => {
//   const navigation = useNavigation<TScreenNavigator>();

//   const { data, isLoading, refetch } = useTeachersListQuery();
//   const [filter, setFilter] = useState({ search: "" });

//   // 🔥 IMPORTANT: screen focus par fresh API call
//   useFocusEffect(
//     useCallback(() => {
//       refetch();
//     }, [refetch])
//   );

//   console.log("👩‍🏫 Teacher List API Response:", data);

//   const teachers: TTeacherData[] = useMemo(() => {
//     if (!isLoading && data?.statuscode === 200) {
//       return filteredTeachersList(data.data ?? [], filter);
//     }
//     return [];
//   }, [isLoading, data, filter]);

//   console.log("✅ FINAL TEACHERS ARRAY:", teachers);

//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Teacher List"
//         handleBackClick={() => navigation.goBack()}
//       />

//       <Flex my={10} mx={30}>
//         <SearchBar
//           onChange={(text) =>
//             setFilter((state) => ({ ...state, search: text }))
//           }
//           value={filter.search}
//         />
//       </Flex>

//       <ThemeScrollView
//         paddingHorizontal={25}
//         loading={isLoading}
//         reloadData={refetch}
//       >
//         <Flex
//           flexDirection="column"
//           align="flex-start"
//           mt={20}
//           styles={{ flexWrap: "wrap" }}
//         >
//           {teachers.map((teacher, index) => (
//             <TouchableOpacity
//               key={teacher.id}
//               style={{
//                 ...styles.batchRow,
//                 borderBottomWidth: teachers.length === index + 1 ? 0 : 1,
//               }}
//               onPress={() =>
//                 navigation.navigate("TeacherDetails", {
//                   teacherId: teacher.teacherId,
//                 })
//               }
//             >
//               <Avatar
//                 textStyle={{ fontSize: 14 }}
//                 content={`${teacher.teacherFirstName} ${
//                   teacher.teacherLastName ?? ""
//                 }`}
//                 size={30}
//                 characters={1}
//               />

//               <ScalableText style={styles.batchName} fontFamily="Medium">
//                 {teacher.teacherFirstName} {teacher.teacherLastName}
//               </ScalableText>
//             </TouchableOpacity>
//           ))}
//         </Flex>
//       </ThemeScrollView>
//     </SafeView>
//   );
// };

// export default TeacherList;

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 18,
//     color: COLORS.primary,
//   },
//   batchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLORS.white,
//     paddingVertical: 10,
//     paddingBottom: 19,
//     borderRadius: 8,
//     marginBottom: 10,
//     width: "100%",
//     borderBottomWidth: 1,
//     borderColor: "#BEBEBE",
//   },
//   batchName: {
//     fontSize: 14,
//     textTransform: "capitalize",
//     marginLeft: 22,
//   },
// });

import { StyleSheet, TouchableOpacity } from "react-native";
import React, { useMemo, useState, useCallback } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../colors";

import Flex from "../../../@ui/flex/Flex";
import Avatar from "../../../@ui/avatar/Avatar";
import SearchBar from "../../../@ui/search-bar/SearchBar";

import { useTeachersListQuery } from "../../../apis/hooks/teachers/query/useTeachersList.query";
import { filteredTeachersList } from "./utils/filteredTeachersList";

const TeacherList = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const { data, isLoading, refetch } = useTeachersListQuery();
  const [filter, setFilter] = useState({ search: "" });

  // 🔁 Screen focus par fresh API call
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  console.log("👩‍🏫 Teacher List API Response:", data);

  const teachers: TTeacherData[] = useMemo(() => {
    if (!isLoading && data?.statuscode === 200 && Array.isArray(data.data)) {

      // 🔥 STEP 1: Latest teacher FIRST (sorting)
      const sortedData = [...data.data].sort(
        (a, b) => (b.dateCreated || 0) - (a.dateCreated || 0)
      );

      // 🔍 STEP 2: Apply search filter
      const finalList = filteredTeachersList(sortedData, filter);

      console.log("✅ FINAL SORTED TEACHERS ARRAY:", finalList);
      return finalList;
    }
    return [];
  }, [isLoading, data, filter]);

  return (
    <SafeView>
      <AppHeader
        showDrawer={false}
        title="Teacher List"
        handleBackClick={() => navigation.goBack()}
      />

      {/* 🔍 Search */}
      <Flex my={10} mx={30}>
        <SearchBar
          value={filter.search}
          onChange={(text) =>
            setFilter((state) => ({ ...state, search: text }))
          }
        />
      </Flex>

      {/* 📜 List */}
      <ThemeScrollView
        paddingHorizontal={25}
        loading={isLoading}
        reloadData={refetch}
      >
        <Flex flexDirection="column" mt={20}>
          {teachers.map((teacher, index) => (
            <TouchableOpacity
              key={teacher.id}
              style={{
                ...styles.batchRow,
                borderBottomWidth:
                  teachers.length === index + 1 ? 0 : 1,
              }}
              onPress={() =>
                navigation.navigate("TeacherDetails", {
                  teacherId: teacher.teacherId,
                })
              }
            >
              <Avatar
                size={30}
                characters={1}
                textStyle={{ fontSize: 14 }}
                content={`${teacher.teacherFirstName} ${
                  teacher.teacherLastName ?? ""
                }`}
              />

              <ScalableText style={styles.batchName} fontFamily="Medium">
                {teacher.teacherFirstName} {teacher.teacherLastName}
              </ScalableText>
            </TouchableOpacity>
          ))}
        </Flex>
      </ThemeScrollView>
    </SafeView>
  );
};

export default TeacherList;

const styles = StyleSheet.create({
  batchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingBottom: 19,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#BEBEBE",
  },
  batchName: {
    fontSize: 14,
    textTransform: "capitalize",
    marginLeft: 22,
  },
});
