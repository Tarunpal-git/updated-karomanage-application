// import React, { useState, useMemo, useEffect } from "react";
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Switch,
//   Alert,
//   TextInput,
// } from "react-native";
// import { useUpdateCourseMutation } from "../../../../apis/hooks/courses/mutation/useUpdateCourse.mutation";
// import { useUpdateBatchMutation } from "../../../../apis/hooks/batch/mutation/useUpdateBatch.mutation";
// import moment from "moment";
// import { Picker } from "@react-native-picker/picker";
// import { useTeachersListQuery } from "../../../../apis/hooks/teachers/query/useTeachersList.query";
// import { useGetClassroomListQuery } from "../../../../apis/hooks/teachers/query/useGetClassroomList.query";
// import { useCourseDetailsQuery } from "../../../../apis/hooks/course/query/useCourseDetails.query";
// import { useCreateTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useCreateTimeTable.mutation";
// import { useUpdateTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useUpdateTimeTable.mutation";
// import { useDeleteTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useDeleteTimeTable.mutation";
// import { useQueryClient } from "@tanstack/react-query";
// import { apiUrls } from "../../../../apis/urls";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../../app/store";
// import { COLORS } from "../../../../colors";
// import { TTimetableCell } from "./TimetableGrid";
// import { useNavigation } from "@react-navigation/native";
// import { TScreenNavigator } from "../../../../types/navigator/screen-navigator";

// type SlotFormModalProps = {
//   visible: boolean;
//   selectedCell: TTimetableCell | null;
//   editingSlot?: any | null; // Slot data when editing
//   onClose: () => void;
//   onNavigateToClassrooms?: () => void;
//   selectedBatch?: string;
//   selectedBatchId?: string;
//   batchData?: any;
//   onSuccess?: () => void; // Callback after successful creation
//   weekStart?: Date; // Week start date for refetch
//   selectedOrganization?: any; // Organization for refetch params
//   timeTableData?: any; // Timetable data for conflict validation
// };

// const PURPLE = "#6B57F2";
// const DAY_KEYS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

// // Convert time string to minutes
// const timeToMinutes = (time: string): number => {
//   const [h, m] = time.split(":").map(Number);
//   return h * 60 + m;
// };

// // Convert minutes to time string
// const minutesToTime = (minutes: number): string => {
//   const h = Math.floor(minutes / 60).toString().padStart(2, "0");
//   const m = (minutes % 60).toString().padStart(2, "0");
//   return `${h}:${m}`;
// };

// // Generate start times: operating hours ke andar 15 min intervals
// const generateStartTimes = (opening: string, closing: string) => {
//   const startMin = timeToMinutes(opening);
//   const endMin = timeToMinutes(closing);
//   const times: string[] = [];

//   for (let minutes = startMin; minutes <= endMin; minutes += 15) {
//     times.push(minutesToTime(minutes));
//   }
//   return times;
// };

// // Generate end times = start + 15 min increments, lekin closing time se zyada nahi
// const generateEndTimes = (start: string, closing: string) => {
//   const startMin = timeToMinutes(start);
//   const closingMin = timeToMinutes(closing);
//   const endTimes: string[] = [];

//   for (let minutes = startMin + 15; minutes <= closingMin; minutes += 15) {
//     endTimes.push(minutesToTime(minutes));
//   }
//   return endTimes;
// };

// // Check if two time slots overlap
// const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
//   const start1Min = timeToMinutes(start1);
//   const end1Min = timeToMinutes(end1);
//   const start2Min = timeToMinutes(start2);
//   const end2Min = timeToMinutes(end2);
  
//   // Two slots overlap if: start1 < end2 AND end1 > start2
//   return start1Min < end2Min && end1Min > start2Min;
// };

// const SlotFormModal = ({
//   visible,
//   selectedCell,
//   editingSlot,
//   onClose,
//   onNavigateToClassrooms,
//   selectedBatch = "Batch",
//   selectedBatchId = "",
//   batchData,
//   onSuccess,
//   weekStart,
//   selectedOrganization: propSelectedOrganization,
//   timeTableData,
// }: SlotFormModalProps) => {
//   console.log("📋 === SLOT FORM MODAL RENDERED ===");
//   console.log("📋 visible:", visible);
//   console.log("📋 editingSlot prop:", editingSlot);
//   console.log("📋 selectedCell:", selectedCell);
  
//   const navigation = useNavigation<TScreenNavigator>();
  
//   // ⭐ TEACHER LIST API
//   const { data: teacherData } = useTeachersListQuery();

//   // ⭐ CLASSROOM LIST API
//   const { data: classroomData } = useGetClassroomListQuery();

//   // ⭐ Selected batch info + courseId
//   const selectedBatchInfo = useMemo(() => {
//     if (batchData?.statusCode === 200 && Array.isArray(batchData.data) && selectedBatchId) {
//       return batchData.data.find((b: any) => b.batchId === selectedBatchId) || null;
//     }
//     return null;
//   }, [batchData, selectedBatchId]);

//   const courseId = selectedBatchInfo?.courses?.[0]?.courseId || "";

//   // ⭐ COURSE DETAIL API (subjects ke liye)
//   const { data: courseDetailData } = useCourseDetailsQuery({
//     courseId: courseId || "",
//   });

//   const [selectedTeacher, setSelectedTeacher] = useState("");
//   const [selectedRoom, setSelectedRoom] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [customSubjects, setCustomSubjects] = useState<{ value: string; label: string }[]>([]);
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [repeat, setRepeat] = useState(true);

//   // ⭐ Cascading dropdown states
//   const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
//   const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
//   const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
//   const [startTimeDropdownOpen, setStartTimeDropdownOpen] = useState(false);
//   const [endTimeDropdownOpen, setEndTimeDropdownOpen] = useState(false);

//   // ⭐ TEACHER OPTIONS for Picker
//   const teacherOptions = useMemo(() => {
//     if (teacherData?.statuscode === 200 && Array.isArray(teacherData.data)) {
//       return teacherData.data.map((t: any) => ({
//         value: t.teacherId,
//         label: `${t.teacherFirstName} ${t.teacherLastName || ""}`.trim(),
//       }));
//     }
//     return [];
//   }, [teacherData]);

//   // ⭐ CLASSROOM OPTIONS for Picker
//   const classroomOptions = useMemo(() => {
//     if (classroomData?.statusCode === 200 && classroomData.data?.classRooms) {
//       return classroomData.data.classRooms.map((room: any) => ({
//         value: room.classRoomId,
//         label: room.classRoomName,
//       }));
//     }
//     return [];
//   }, [classroomData]);

//   // ⭐ SUBJECT OPTIONS from Course Detail API
//   const subjectOptions = useMemo(() => {
//     if (courseDetailData?.data?.subjects && Array.isArray(courseDetailData.data.subjects)) {
//       return courseDetailData.data.subjects.map((s: any) => ({
//         value: s.subjectId,
//         label: s.subjectName,
//       }));
//     }
//     return [];
//   }, [courseDetailData]);

//   const courseName = courseDetailData?.data?.courseName || selectedBatchInfo?.courses?.[0]?.courseName || "Course";
//   const batchName = selectedBatchInfo?.batchName || selectedBatch || "Batch";

//   const combinedSubjectOptions = useMemo(
//     () => [...subjectOptions, ...customSubjects],
//     [subjectOptions, customSubjects]
//   );

//   // ⭐ OPERATING HOURS
//   const DEFAULT_HOURS = { openingTime: "09:00", closingTime: "18:00" };
//   const operatingHours = useMemo(() => {
//     const opening =
//       classroomData?.data?.openingTime ??
//       classroomData?.data?.operatingHours?.openingTime ??
//       DEFAULT_HOURS.openingTime;
//     const closing =
//       classroomData?.data?.closingTime ??
//       classroomData?.data?.operatingHours?.closingTime ??
//       DEFAULT_HOURS.closingTime;
//     return { openingTime: opening, closingTime: closing };
//   }, [classroomData]);

//   // ⭐ START TIMES (operating hours ke andar 15 min intervals)
//   const startTimes = useMemo(
//     () => generateStartTimes(operatingHours.openingTime, operatingHours.closingTime),
//     [operatingHours]
//   );

//   // ⭐ END TIMES (start time se 15 min increments, closing time se zyada nahi)
//   const endTimes = useMemo(() => {
//     if (!startTime) return [];
//     return generateEndTimes(startTime, operatingHours.closingTime);
//   }, [startTime, operatingHours.closingTime]);

//   // ⭐ Reset endTime when startTime changes (but not in edit mode when initializing)
//   useEffect(() => {
//     if (startTime && !editingSlot) {
//       setEndTime("");
//     }
//   }, [startTime, editingSlot]);

//   // ⭐ Cascading dropdown logic (dropdowns always close, but next opens only in normal mode)
//   useEffect(() => {
//     if (selectedSubject) {
//       setSubjectDropdownOpen(false);
//       if (!editingSlot) {
//         setTeacherDropdownOpen(true);
//       }
//     }
//   }, [selectedSubject, editingSlot]);

//   useEffect(() => {
//     if (selectedTeacher) {
//       setTeacherDropdownOpen(false);
//       if (!editingSlot) {
//         setRoomDropdownOpen(true);
//       }
//     }
//   }, [selectedTeacher, editingSlot]);

//   useEffect(() => {
//     if (selectedRoom) {
//       setRoomDropdownOpen(false);
//       if (!editingSlot) {
//         setStartTimeDropdownOpen(true);
//       }
//     }
//   }, [selectedRoom, editingSlot]);

//   useEffect(() => {
//     if (startTime) {
//       setStartTimeDropdownOpen(false);
//       if (!editingSlot) {
//         setEndTimeDropdownOpen(true);
//       }
//     }
//   }, [startTime, editingSlot]);

//   useEffect(() => {
//     if (endTime) {
//       setEndTimeDropdownOpen(false);
//     }
//   }, [endTime]);

//   const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2]); // M T W default

//   // ⭐ Check if in edit mode (declare early so it can be used in useEffect)
//   const isEditMode = !!editingSlot;

//   // ⭐ Prefill form when editingSlot exists
//   useEffect(() => {
//     console.log("📝 === SLOT FORM MODAL EFFECT ===");
//     console.log("📝 visible:", visible);
//     console.log("📝 editingSlot:", editingSlot ? JSON.stringify(editingSlot, null, 2) : "null");
//     console.log("📝 isEditMode:", isEditMode);
    
//     if (editingSlot && visible) {
//       console.log("📝 Prefilling form with editingSlot");
//       console.log("📝 Subject ID:", editingSlot.subjectId);
//       console.log("📝 Teacher ID:", editingSlot.teacherId);
//       console.log("📝 Room ID:", editingSlot.classRoomId);
//       console.log("📝 Start Time:", editingSlot.startTime);
//       console.log("📝 End Time:", editingSlot.endTime);
//       console.log("📝 Day:", editingSlot.day);
      
//       // Set values immediately - Picker will update when options are available
//       setSelectedSubject(editingSlot.subjectId || "");
//       setSelectedTeacher(editingSlot.teacherId || "");
//       setSelectedRoom(editingSlot.classRoomId || "");
//       setStartTime(editingSlot.startTime || "");
//       setEndTime(editingSlot.endTime || "");
//       setRepeat(true); // Single day for edit mode
      
//       // Set active day based on editingSlot.day
//       if (editingSlot.day) {
//         const dayDate = editingSlot.day instanceof Date ? editingSlot.day : new Date(editingSlot.day);
//         const dayOfWeek = dayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
//         // Convert to our day index (0 = Monday)
//         const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//         console.log("📝 Day of week:", dayOfWeek, "Adjusted index:", adjustedIndex);
//         setActiveDays([adjustedIndex]);
//       }
      
//       console.log("✅ Form values set:", {
//         subject: editingSlot.subjectId,
//         teacher: editingSlot.teacherId,
//         room: editingSlot.classRoomId,
//         startTime: editingSlot.startTime,
//         endTime: editingSlot.endTime,
//       });
//     } else if (!editingSlot && visible) {
//       console.log("📝 Resetting form for new slot");
//       // Reset form when opening for new slot
//       setSelectedSubject("");
//       setSelectedTeacher("");
//       setSelectedRoom("");
//       setStartTime("");
//       setEndTime("");
//       setRepeat(true);
//       setActiveDays([]);
//     }
//   }, [editingSlot, visible, isEditMode]);

//   // ⭐ Log state values when they change (for debugging)
//   useEffect(() => {
//     if (visible && isEditMode) {
//       console.log("📊 Current form state:", {
//         selectedSubject,
//         selectedTeacher,
//         selectedRoom,
//         startTime,
//         endTime,
//         activeDays,
//         subjectOptionsCount: subjectOptions.length,
//         teacherOptionsCount: teacherOptions.length,
//         classroomOptionsCount: classroomOptions.length,
//       });
//     }
//   }, [visible, isEditMode, selectedSubject, selectedTeacher, selectedRoom, startTime, endTime, activeDays, subjectOptions.length, teacherOptions.length, classroomOptions.length]);

//   const toggleDay = (index: number) => {
//     // In edit mode, only one day can be selected at a time
//     if (isEditMode) {
//       // If clicking the same day, deselect it (optional - or keep it selected)
//       // If clicking a different day, replace the selection
//       setActiveDays([index]);
//     } else {
//       // Normal mode: allow multiple days selection
//       setActiveDays((prev) =>
//         prev.includes(index)
//           ? prev.filter((i) => i !== index)
//           : [...prev, index]
//       );
//     }
//   };

//   // Format selected days for display
//   const formatSelectedDays = () => {
//     if (activeDays.length === 0) return "";
    
//     const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
//     const selectedDayNames = activeDays
//       .sort((a, b) => a - b) // Sort by index to maintain order
//       .map((index) => dayNames[index]);
    
//     return `Occurs weekly on ${selectedDayNames.join(", ")}`;
//   };

//   const handleRoomPlusPress = () => {
//     onClose();
//     requestAnimationFrame(() => {
//       onNavigateToClassrooms?.();
//     });
//   };

//   // ⭐ REDUX: Organization data (use prop if provided, else from Redux)
//   const reduxOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);
//   const selectedOrganization = propSelectedOrganization || reduxOrganization;

//   // ⭐ MUTATION: Create, Update and Delete TimeTable
//   const createMutation = useCreateTimeTableMutation();
//   const updateMutation = useUpdateTimeTableMutation();
//   const deleteMutation = useDeleteTimeTableMutation();
//   const queryClient = useQueryClient();
//   const updateCourseMutation = useUpdateCourseMutation();
//   const updateBatchMutation = useUpdateBatchMutation();

//   // ⭐ HELPER: Handle success response (refetch and close modal)
//   const handleSuccessResponse = (response: any, isEdit: boolean) => {
//     console.log(`✅ TimeTable ${isEdit ? "updated" : "created"} successfully:`, response);
    
//     // Check for error responses (404, etc.)
//     if (response?.status === 404 || response?.data?.statusCode === 404) {
//       console.error("❌ 404 Error: Resource not found");
//       Alert.alert("Error", response?.data?.message || "API endpoint not found (404). Please check the backend service.");
//       return;
//     }
    
//     // Check if response is empty string (backend returns "" but saves data like web)
//     const isEmptyResponse = typeof response === "string" && response === "";
//     const hasNoData = !response?.data && !response?.statusCode;
    
//     if (isEmptyResponse) {
//       console.log("ℹ️ Backend returned empty string (like web), but data should be saved");
//     } else if (hasNoData && !isEmptyResponse) {
//       console.warn("⚠️ WARNING: Backend returned invalid response!");
//       Alert.alert(
//         "Warning",
//         "Slot operation may have failed. Please check if the slot appears in the timetable. If not, please try again or contact support.",
//         [{ text: "OK", style: "default" }]
//       );
//     }
    
//     // Invalidate ALL timetable queries (with any params) to refresh grid
//     queryClient.invalidateQueries({
//       predicate: (query) => {
//         return query.queryKey[0] === "timeTable";
//       },
//     });
    
//     // If weekStart is provided, refetch with exact params
//     if (weekStart && selectedOrganization && selectedBatchId) {
//       const startWeekDate = weekStart.toISOString().split('T')[0];
//       const endDate = new Date(weekStart);
//       endDate.setDate(weekStart.getDate() + 6);
//       const endWeekDate = endDate.toISOString().split('T')[0];
      
//       const refetchParams = {
//         customerId: selectedOrganization.customerId,
//         organizationId: selectedOrganization.organizationId,
//         batchId: selectedBatchId,
//         startWeekDate: startWeekDate,
//         endWeekDate: endWeekDate,
//       };
      
//       console.log("🔄 Refetching with params:", refetchParams);
      
//       setTimeout(() => {
//         console.log("🔄 Executing refetch now...");
//         queryClient.refetchQueries({
//           queryKey: ["timeTable", refetchParams],
//         }).then(() => {
//           console.log("✅ Refetch completed");
//         }).catch((err) => {
//           console.error("❌ Refetch error:", err);
//         });
//       }, 2000);
//     } else {
//       setTimeout(() => {
//         queryClient.refetchQueries({
//           predicate: (query) => {
//             return query.queryKey[0] === "timeTable";
//           },
//         });
//       }, 2000);
//     }
    
//     // Call onSuccess callback if provided
//     if (onSuccess) {
//       onSuccess();
//     }
//     // Close modal
//     onClose();
//     // Reset form
//     setSelectedSubject("");
//     setSelectedTeacher("");
//     setSelectedRoom("");
//     setStartTime("");
//     setEndTime("");
//     setActiveDays([]);
//   };

//   // ⭐ HELPER: Handle error response
//   const handleErrorResponse = (error: any, isEdit: boolean) => {
//     console.error(`❌ Error ${isEdit ? "updating" : "creating"} TimeTable:`, error);
//     console.error("❌ Error details:", JSON.stringify(error, null, 2));
//     console.error("❌ API URL that failed:", isEdit ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE);
    
//     const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEdit ? "update" : "create"} slot. Please try again.`;
//     const is404 = error?.response?.status === 404 || 
//                  error?.response?.data?.statusCode === 404 || 
//                  error?.message?.includes("404") || 
//                  error?.message?.includes("not found") ||
//                  error?.message?.includes("Not Found");
    
//     if (is404) {
//       Alert.alert(
//         "Error",
//         "API endpoint not found (404). Please check the backend service or contact support.",
//         [{ text: "OK", style: "default" }]
//       );
//     } else {
//       Alert.alert("Error", errorMessage, [{ text: "OK", style: "default" }]);
//     }
//   };

//   // ⭐ HANDLE ADD/UPDATE SLOT
//   const handleAddSlot = () => {
//     const action = isEditMode ? "UPDATE" : "ADD";
//     console.log(`🔵 === ${action} SLOT CLICKED ===`);
//     console.log("Form Values:", {
//       selectedSubject,
//       selectedTeacher,
//       selectedRoom,
//       startTime,
//       endTime,
//       selectedBatchId,
//       repeat,
//       activeDays,
//       selectedCell: selectedCell ? "exists" : "null",
//       editingSlot: editingSlot ? "exists" : "null",
//     });

//     // Validation
//     if (!selectedSubject) {
//       console.log("❌ Validation failed: Subject not selected");
//       Alert.alert("Error", "Please select a subject");
//       return;
//     }
//     if (!selectedTeacher) {
//       console.log("❌ Validation failed: Teacher not selected");
//       Alert.alert("Error", "Please select a teacher");
//       return;
//     }
//     if (!selectedRoom) {
//       console.log("❌ Validation failed: Room not selected");
//       Alert.alert("Error", "Please select a room");
//       return;
//     }
//     if (!startTime) {
//       console.log("❌ Validation failed: Start time not selected");
//       Alert.alert("Error", "Please select start time");
//       return;
//     }
//     if (!endTime) {
//       console.log("❌ Validation failed: End time not selected");
//       Alert.alert("Error", "Please select end time");
//       return;
//     }
//     if (!selectedBatchId) {
//       console.log("❌ Validation failed: Batch ID not found");
//       Alert.alert("Error", "Batch not selected");
//       return;
//     }
//     if (repeat && activeDays.length === 0) {
//       console.log("❌ Validation failed: No days selected");
//       Alert.alert("Error", "Please select at least one day");
//       return;
//     }
//     if (!repeat && !selectedCell) {
//       console.log("❌ Validation failed: No cell selected and repeat is off");
//       Alert.alert("Error", "Please select a cell or enable repeat");
//       return;
//     }

//     console.log("✅ All validations passed");

//     // ⭐ CONFLICT VALIDATION: Check for time conflicts with existing slots
//     const repeatDaysData = timeTableData?.data?.repeatDays || {};
//     const conflicts: string[] = [];
//     const dayNames: { [key: string]: string } = {
//       "M": "Monday",
//       "T": "Tuesday",
//       "W": "Wednesday",
//       "Th": "Thursday",
//       "F": "Friday",
//       "Sa": "Saturday",
//       "Su": "Sunday"
//     };

//     // Build daysToUse first to check conflicts
//     let daysToUse: string[] = [];
//     if (repeat) {
//       if (weekStart) {
//         daysToUse = activeDays.map((dayIndex) => {
//           const dayDate = new Date(weekStart);
//           dayDate.setDate(weekStart.getDate() + dayIndex);
//           const dayOfWeek = dayDate.getDay();
//           const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
//           return dayKeys[dayOfWeek];
//         });
//       } else {
//         daysToUse = activeDays.map((dayIndex) => DAY_KEYS[dayIndex]);
//       }
//     } else if (isEditMode && editingSlot?.day) {
//       const dayOfWeek = editingSlot.day.getDay();
//       const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
//       daysToUse = [dayKeys[dayOfWeek]];
//     } else if (selectedCell) {
//       const dayOfWeek = selectedCell.day.getDay();
//       const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
//       daysToUse = [dayKeys[dayOfWeek]];
//     }

//     // Check conflicts for each selected day
//     for (const dayKey of daysToUse) {
//       const daySlots = repeatDaysData[dayKey] || [];
//       const dayName = dayNames[dayKey] || dayKey;

//       for (const existingSlot of daySlots) {
//         // Skip the current slot if we're editing (to avoid self-conflict)
//         if (isEditMode && editingSlot && (existingSlot.id === editingSlot.id || existingSlot.slotId === editingSlot.id)) {
//           continue;
//         }

//         // Check if times overlap
//         if (isTimeOverlap(startTime, endTime, existingSlot.startTime, existingSlot.endTime)) {
//           // Check if same teacher
//           if (existingSlot.teacherId === selectedTeacher) {
//             conflicts.push(`${dayName}: Teacher already has a slot from ${existingSlot.startTime} to ${existingSlot.endTime}`);
//           }
//           // Check if same classroom
//           else if (existingSlot.classRoomId === selectedRoom) {
//             conflicts.push(`${dayName}: Classroom already booked from ${existingSlot.startTime} to ${existingSlot.endTime}`);
//           }
//         }
//       }
//     }

//     // If conflicts found, show error and return
//     if (conflicts.length > 0) {
//       const conflictMessage = `⛔ Time Conflict Detected:\n\n${conflicts.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
//       console.log("❌ Conflict detected:", conflictMessage);
//       Alert.alert("Time Conflict", conflictMessage);
//       return;
//     }

//     // Build slot object
//     const slotObject = {
//       subjectId: selectedSubject,
//       teacherId: selectedTeacher,
//       classRoomId: selectedRoom,
//       startTime: startTime,
//       endTime: endTime,
//     };

//     // Build repeatDays payload (daysToUse already calculated above in conflict validation)
//     // Final validation: ensure we have at least one day
//     if (daysToUse.length === 0) {
//       Alert.alert("Error", "Please select at least one day");
//       return;
//     }

//     // ⭐ CHECK IF DAY HAS CHANGED (for edit mode)
//     let dayChanged = false;
//     let originalDayKey = "";
    
//     if (isEditMode && editingSlot?.day) {
//       // Get original day key from editingSlot
//       const originalDayDate = editingSlot.day instanceof Date ? editingSlot.day : new Date(editingSlot.day);
//       const originalDayOfWeek = originalDayDate.getDay();
//       const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
//       originalDayKey = dayKeys[originalDayOfWeek];
      
//       // Check if new day is different from original day
//       // For single day edit, daysToUse should have only one day
//       if (daysToUse.length === 1 && daysToUse[0] !== originalDayKey) {
//         dayChanged = true;
//         console.log("🔄 Day changed detected!");
//         console.log("🔄 Original day:", originalDayKey);
//         console.log("🔄 New day:", daysToUse[0]);
//       }
//     }

//     let payload: any;

//     // For UPDATE: Use flat structure like web (simple object with repeatDays array)
//     if (isEditMode && editingSlot) {
//       // Clean the ID - remove any extra quotes or whitespace
//       let slotId = (editingSlot.id || editingSlot.slotId || "").toString();
//       // Remove quotes from start and end only (not from middle)
//       slotId = slotId.replace(/^["']+|["']+$/g, "").trim();
      
//       console.log("✏️ Edit mode - Slot ID:", slotId);
//       console.log("✏️ Original ID from editingSlot:", editingSlot.id);
      
//       if (!slotId) {
//         Alert.alert("Error", "Slot ID is missing. Cannot update slot.");
//         return;
//       }

//       // Convert day keys to day indices (like web: [0, 1, 2] for M, T, W)
//       // Web uses: 0=Monday, 1=Tuesday, etc.
//       const dayKeyToIndex: Record<string, number> = {
//         "M": 0,
//         "T": 1,
//         "W": 2,
//         "Th": 3,
//         "F": 4,
//         "Sa": 5,
//         "Su": 6,
//       };
//       const repeatDaysArray = daysToUse
//         .map(dayKey => dayKeyToIndex[dayKey])
//         .filter(idx => idx !== undefined);

//       // Build flat payload like web version
//       payload = {
//         customerId: selectedOrganization?.customerId,
//         organizationId: selectedOrganization?.organizationId,
//         batchId: selectedBatchId,
//         id: slotId,
//         subjectId: selectedSubject,
//         teacherId: selectedTeacher,
//         classRoomId: selectedRoom,
//         startTime: startTime,
//         endTime: endTime,
//         repeatDays: repeatDaysArray, // Array of day indices, not nested object
//         startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
//         endDate: weekStart ? (() => {
//           const end = new Date(weekStart);
//           end.setDate(weekStart.getDate() + 6);
//           return end.toISOString().split('T')[0];
//         })() : "",
//       };
      
//       console.log("✏️ Update payload (flat structure like web):", JSON.stringify(payload, null, 2));
//     } else {
//       // For CREATE: Use FLAT structure like web (not nested)
//       // Convert day keys to day indices (0=Monday, 1=Tuesday, etc.)
//       const dayKeyToIndex: Record<string, number> = {
//         "M": 0,
//         "T": 1,
//         "W": 2,
//         "Th": 3,
//         "F": 4,
//         "Sa": 5,
//         "Su": 6,
//       };
//       const repeatDaysArray = daysToUse
//         .map(dayKey => dayKeyToIndex[dayKey])
//         .filter(idx => idx !== undefined);

//       // Build flat payload like web version
//       payload = {
//         customerId: selectedOrganization?.customerId,
//         organizationId: selectedOrganization?.organizationId,
//         batchId: selectedBatchId,
//         subjectId: selectedSubject,
//         teacherId: selectedTeacher,
//         classRoomId: selectedRoom,
//         startTime: startTime,
//         endTime: endTime,
//         repeatDays: repeatDaysArray, // Array of day indices, not nested object
//         startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
//         endDate: weekStart ? (() => {
//           const end = new Date(weekStart);
//           end.setDate(weekStart.getDate() + 6);
//           return end.toISOString().split('T')[0];
//         })() : "",
//       };
      
//       console.log("📦 CREATE payload (flat structure like web):", JSON.stringify(payload, null, 2));
//     }

//     console.log(`📦 Final Payload (${isEditMode ? "UPDATE" : "CREATE"}):`, JSON.stringify(payload, null, 2));
//     console.log("📦 Organization:", {
//       customerId: selectedOrganization?.customerId,
//       organizationId: selectedOrganization?.organizationId,
//     });

//     // ⭐ HANDLE DAY CHANGE: If day changed, delete old slot first, then create new one
//     if (dayChanged && isEditMode && editingSlot) {
//       console.log("🔄 Day changed - Deleting old slot and creating new one...");
      
//       // Clean the ID
//       let slotId = (editingSlot.id || editingSlot.slotId || "").toString();
//       slotId = slotId.replace(/^["']+|["']+$/g, "").trim();
      
//       // Build delete payload
//       const deletePayload = {
//         customerId: selectedOrganization?.customerId,
//         organizationId: selectedOrganization?.organizationId,
//         batchId: selectedBatchId,
//         startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
//         endDate: weekStart ? (() => {
//           const end = new Date(weekStart);
//           end.setDate(weekStart.getDate() + 6);
//           return end.toISOString().split('T')[0];
//         })() : "",
//         id: slotId,
//         dayKey: originalDayKey,
//         startTime: editingSlot.startTime || startTime,
//         endTime: editingSlot.endTime || endTime,
//       };
      
//       console.log("🗑️ Delete payload (old day):", JSON.stringify(deletePayload, null, 2));
      
//       // First delete from old day
//       deleteMutation.mutate(deletePayload, {
//         onSuccess: (deleteResponse) => {
//           console.log("✅ Old slot deleted successfully:", deleteResponse);
          
//           // Now create new slot in new day
//           console.log("➕ Creating new slot in new day...");
//           createMutation.mutate(payload, {
//             onSuccess: (createResponse) => {
//               console.log("✅ New slot created successfully:", createResponse);
//               handleSuccessResponse(createResponse, false);
//             },
//             onError: (createError) => {
//               console.error("❌ Error creating new slot:", createError);
//               handleErrorResponse(createError, false);
//             },
//           });
//         },
//         onError: (deleteError: any) => {
//           console.error("❌ Error deleting old slot:", deleteError);
//           const errorMessage = deleteError?.response?.data?.message || deleteError?.message || "Failed to delete old slot. Please try again.";
//           Alert.alert("Error", errorMessage);
//         },
//       });
      
//       return; // Exit early, don't proceed with normal update
//     }

//     // Call API (normal update or create)
//     const mutation = isEditMode ? updateMutation : createMutation;
//     console.log(`🚀 Calling ${isEditMode ? "updateMutation" : "createMutation"}.mutate...`);
//     mutation.mutate(payload, {
//       onSuccess: (response) => {
//         console.log(`✅ TimeTable ${isEditMode ? "updated" : "created"} successfully:`, response);
//         console.log("📝 Response type:", typeof response);
//         console.log("📝 Response stringified:", JSON.stringify(response));
//         console.log("📝 Response data:", response?.data);
//         console.log("📝 Response statusCode:", response?.statusCode);
//         console.log("📝 Response message:", response?.message);
        
//         // Check for error responses (404, etc.) - If axios returns error as response
//         if (response?.status === 404 || response?.data?.statusCode === 404) {
//           console.error("❌ 404 Error: Resource not found (caught in onSuccess)");
//           // Throw error so it goes to onError handler for proper handling
//           throw new Error(response?.data?.message || "API endpoint not found (404). Please check the backend service.");
//         }
        
//         // Check if response is empty string (backend returns "" but saves data like web)
//         const isEmptyResponse = typeof response === "string" && response === "";
//         const hasNoData = !response?.data && !response?.statusCode;
        
//         if (isEmptyResponse) {
//           console.log("ℹ️ Backend returned empty string (like web), but data should be saved");
//           // Don't show warning - web me bhi same response aata hai and it works
//           // Proceed with refetch - data should be saved
//         } else if (hasNoData && !isEmptyResponse) {
//           console.warn("⚠️ WARNING: Backend returned invalid response!");
//           console.warn("⚠️ This might indicate the data was not saved properly.");
          
//           // Show warning to user only if response is not empty string
//           Alert.alert(
//             "Warning",
//             "Slot creation may have failed. Please check if the slot appears in the timetable. If not, please try again or contact support.",
//             [
//               {
//                 text: "OK",
//                 style: "default",
//               },
//             ]
//           );
//         }
        
//         // Invalidate ALL timetable queries (with any params) to refresh grid
//         queryClient.invalidateQueries({
//           predicate: (query) => {
//             return query.queryKey[0] === "timeTable";
//           },
//         });
        
//         // If weekStart is provided, refetch with exact params
//         if (weekStart && selectedOrganization && selectedBatchId) {
//           const startWeekDate = weekStart.toISOString().split('T')[0];
//           const endDate = new Date(weekStart);
//           endDate.setDate(weekStart.getDate() + 6);
//           const endWeekDate = endDate.toISOString().split('T')[0];
          
//           const refetchParams = {
//             customerId: selectedOrganization.customerId,
//             organizationId: selectedOrganization.organizationId,
//             batchId: selectedBatchId,
//             startWeekDate: startWeekDate,
//             endWeekDate: endWeekDate,
//           };
          
//           console.log("🔄 Refetching with params:", refetchParams);
          
//           // Longer delay to ensure backend has fully processed and committed
//           setTimeout(() => {
//             console.log("🔄 Executing refetch now...");
//             queryClient.refetchQueries({
//               queryKey: ["timeTable", refetchParams],
//             }).then(() => {
//               console.log("✅ Refetch completed");
//             }).catch((err) => {
//               console.error("❌ Refetch error:", err);
//             });
//           }, 2000); // Increased to 2 seconds
//         } else {
//           // Fallback: refetch all timeTable queries
//           setTimeout(() => {
//             queryClient.refetchQueries({
//               predicate: (query) => {
//                 return query.queryKey[0] === "timeTable";
//               },
//             });
//           }, 2000);
//         }
        
//         // Call onSuccess callback if provided
//         if (onSuccess) {
//           onSuccess();
//         }
//         // Close modal
//         onClose();
//         // Reset form
//         setSelectedSubject("");
//         setSelectedTeacher("");
//         setSelectedRoom("");
//         setStartTime("");
//         setEndTime("");
//         setActiveDays([]);
//       },
//       onError: (error: any) => {
//         console.error(`❌ Error ${isEditMode ? "updating" : "creating"} TimeTable:`, error);
//         console.error("❌ Error details:", JSON.stringify(error, null, 2));
//         console.error("❌ Error type:", typeof error);
//         console.error("❌ Error message:", error?.message);
//         console.error("❌ Error response:", error?.response);
//         console.error("❌ Error status:", error?.response?.status);
//         console.error("❌ Error statusCode:", error?.response?.data?.statusCode);
//         console.error("❌ Error response message:", error?.response?.data?.message);
//         console.error("❌ API URL that failed:", isEditMode ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE);
        
//         // Get error message from different possible locations
//         const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? "update" : "create"} slot. Please try again.`;
//         const is404 = error?.response?.status === 404 || 
//                      error?.response?.data?.statusCode === 404 || 
//                      error?.message?.includes("404") || 
//                      error?.message?.includes("not found") ||
//                      error?.message?.includes("Not Found");
        
//         // Check for 404 specifically
//         if (is404) {
//           const apiUrl = isEditMode ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE;
//           Alert.alert(
//             "404 - Resource Not Found",
//             `The API endpoint was not found. Please check:\n\n1. API URL: ${apiUrl}\n2. Payload structure\n3. Backend service status\n\nError: ${errorMessage}`
//           );
//         } else {
//           Alert.alert(
//             "Error",
//             errorMessage
//           );
//         }
//       },
//     });
//   };

//   return (
//     <>
//       <Modal visible={visible} transparent animationType="slide">
//         <View style={styles.backdrop}>
//           <View style={styles.modalContentWrapper}>
//             <ScrollView
//               style={styles.modalContainer}
//               contentContainerStyle={{ paddingBottom: 40 }}
//             >
//           {/* Title */}
//           <Text style={styles.title}>
//             {isEditMode ? "Update Slot" : `Add New Slot for ${selectedBatch}`}
            
//           </Text>

//           {/* SUBJECT */}
//           <Text style={styles.label}>Subject</Text>
//           <View style={styles.row}>
//             <TouchableOpacity 
//               style={styles.dropdownBox}
//               onPress={() => {
//                 setSubjectDropdownOpen(!subjectDropdownOpen);
//                 if (subjectDropdownOpen) {
//                   setTeacherDropdownOpen(false);
//                   setRoomDropdownOpen(false);
//                   setStartTimeDropdownOpen(false);
//                   setEndTimeDropdownOpen(false);
//                 }
//               }}
//             >
//               <View style={styles.dropdownContent}>
//                 <Text style={[styles.dropdownText, !selectedSubject && styles.dropdownPlaceholder]}>
//                   {selectedSubject 
//                     ? combinedSubjectOptions.find((s: { value: string; label: string }) => s.value === selectedSubject)?.label 
//                     : "Select subject"}
//                 </Text>
//                 <Text style={styles.dropdownArrow}>{subjectDropdownOpen ? "▲" : "▼"}</Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.plusBtn}
//               onPress={() => {
//                 if (courseId) {
//                   onClose(); // Close slot form modal first
//                   navigation.navigate("CourseDetails", { courseId, autoOpenEdit: true });
//                 } else {
//                   Alert.alert("Error", "Course ID not found. Please select a batch first.");
//                 }
//               }}
//             >
//               <Text style={styles.plusText}>+</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Subject Dropdown List */}
//           {subjectDropdownOpen && (
//             <View style={styles.cascadingDropdown}>
//               <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
//                 {combinedSubjectOptions.length > 0 ? (
//                   combinedSubjectOptions.map((subject: { value: string; label: string }) => {
//                     const isSelected = selectedSubject === subject.value;
//                     console.log("🔥 SUBJECT SOURCE:", combinedSubjectOptions);
//                     return (
//                       <TouchableOpacity
//                         key={subject.value}
//                         style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
//                         onPress={() => {
//                           setSelectedSubject(subject.value);
//                         }}
//                       >
//                         <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
//                           {subject.label}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })
//                 ) : (
//                   <View style={styles.cascadingDropdownItem}>
//                     <Text style={styles.cascadingDropdownItemText}>Data not found</Text>
//                   </View>
//                 )}
//               </ScrollView>
//             </View>
//           )}

//           {/* TEACHER */}
//           <Text style={styles.label}>Teacher</Text>
//           <View style={styles.row}>
//             <TouchableOpacity 
//               style={[styles.dropdownBox, !selectedSubject && styles.dropdownBoxDisabled]}
//               onPress={() => {
//                 if (selectedSubject) {
//                   setTeacherDropdownOpen(!teacherDropdownOpen);
//                   if (teacherDropdownOpen) {
//                     setRoomDropdownOpen(false);
//                     setStartTimeDropdownOpen(false);
//                     setEndTimeDropdownOpen(false);
//                   }
//                 }
//               }}
//               disabled={!selectedSubject}
//             >
//               <View style={styles.dropdownContent}>
//                 <Text style={[styles.dropdownText, (!selectedTeacher || !selectedSubject) && styles.dropdownPlaceholder]}>
//                   {selectedTeacher 
//                     ? teacherOptions.find((t: { value: string; label: string }) => t.value === selectedTeacher)?.label 
//                     : "Select teacher"}
//                 </Text>
//                 <Text style={[styles.dropdownArrow, !selectedSubject && { opacity: 0.5 }]}>
//                   {teacherDropdownOpen ? "▲" : "▼"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={styles.plusBtn}
//               onPress={() => {
//                 onClose(); // Close slot form modal first
//                 (navigation as any).navigate("AddEmployeeScreen");
//               }}
//             >
//               <Text style={styles.plusText}>+</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Teacher Dropdown List */}
//           {teacherDropdownOpen && selectedSubject && (
//             <View style={styles.cascadingDropdown}>
//               <Text style={styles.cascadingDropdownTitle}>Select teacher</Text>
//               <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
//                 {teacherOptions.length > 0 ? (
//                   teacherOptions.map((teacher: { value: string; label: string }) => {
//                     const isSelected = selectedTeacher === teacher.value;
//                     return (
//                       <TouchableOpacity
//                         key={teacher.value}
//                         style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
//                         onPress={() => {
//                           setSelectedTeacher(teacher.value);
//                         }}
//                       >
//                         <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
//                           {teacher.label}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })
//                 ) : (
//                   <View style={styles.cascadingDropdownItem}>
//                     <Text style={styles.cascadingDropdownItemText}>No teachers found</Text>
//                   </View>
//                 )}
//               </ScrollView>
//             </View>
//           )}

//           {/* ROOM */}
//           <Text style={styles.label}>Room</Text>
//           <View style={styles.row}>
//             <TouchableOpacity 
//               style={[styles.dropdownBox, !selectedTeacher && styles.dropdownBoxDisabled]}
//               onPress={() => {
//                 if (selectedTeacher) {
//                   setRoomDropdownOpen(!roomDropdownOpen);
//                   if (roomDropdownOpen) {
//                     setStartTimeDropdownOpen(false);
//                     setEndTimeDropdownOpen(false);
//                   }
//                 }
//               }}
//               disabled={!selectedTeacher}
//             >
//               <View style={styles.dropdownContent}>
//                 <Text style={[styles.dropdownText, (!selectedRoom || !selectedTeacher) && styles.dropdownPlaceholder]}>
//                   {selectedRoom 
//                     ? classroomOptions.find((r: { value: string; label: string }) => r.value === selectedRoom)?.label 
//                     : "Select room"}
//                 </Text>
//                 <Text style={[styles.dropdownArrow, !selectedTeacher && { opacity: 0.5 }]}>
//                   {roomDropdownOpen ? "▲" : "▼"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.plusBtn} onPress={handleRoomPlusPress}>
//               <Text style={styles.plusText}>+</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Room Dropdown List */}
//           {roomDropdownOpen && selectedTeacher && (
//             <View style={styles.cascadingDropdown}>
//               <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
//                 {classroomOptions.length > 0 ? (
//                   classroomOptions.map((room: { value: string; label: string }) => {
//                     const isSelected = selectedRoom === room.value;
//                     return (
//                       <TouchableOpacity
//                         key={room.value}
//                         style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
//                         onPress={() => {
//                           setSelectedRoom(room.value);
//                         }}
//                       >
//                         <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
//                           {room.label}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })
//                 ) : (
//                   <View style={styles.cascadingDropdownItem}>
//                     <Text style={styles.cascadingDropdownItemText}>Data not found</Text>
//                   </View>
//                 )}
//               </ScrollView>
//             </View>
//           )}

//           {/* START TIME */}
//           <Text style={styles.label}>Start Time</Text> 
//           <View style={styles.row}>       
//           <TouchableOpacity 
//             style={[styles.dropdownBox, !selectedRoom && styles.dropdownBoxDisabled]}
//             onPress={() => {
//               if (selectedRoom) {
//                 setStartTimeDropdownOpen(!startTimeDropdownOpen);
//                 if (startTimeDropdownOpen) {
//                   setEndTimeDropdownOpen(false);
//                 }
//               }
//             }}
//             disabled={!selectedRoom}
//           >
//             <View style={styles.dropdownContent}>
//               <Text style={[styles.dropdownText, (!startTime || !selectedRoom) && styles.dropdownPlaceholder]}>
//                 {startTime || "Select start time"}
//               </Text>
//               <Text style={[styles.dropdownArrow, !selectedRoom && { opacity: 0.5 }]}>
//                 {startTimeDropdownOpen ? "▲" : "▼"}
//               </Text>
//             </View>
//           </TouchableOpacity>
//           <View style={{ width: 38, height: 38 }} />
//           </View>
//           {/* Start Time Dropdown List */}
//           {startTimeDropdownOpen && selectedRoom && (
//             <View style={styles.cascadingDropdown}>
//               <Text style={styles.cascadingDropdownTitle}>Select start time</Text>
//               <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
//                 {startTimes.map((time: string) => {
//                   const isSelected = startTime === time;
//                   return (
//                     <TouchableOpacity
//                       key={time}
//                       style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
//                       onPress={() => {
//                         setStartTime(time);
//                       }}
//                     >
//                       <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
//                         {time}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             </View>
//           )}

//           {/* END TIME */}
//           <Text style={styles.label}>End Time</Text>
//           <View style={styles.row}>
//           <TouchableOpacity 
//             style={[styles.dropdownBox, !startTime && styles.dropdownBoxDisabled]}
//             onPress={() => {
//               if (startTime) {
//                 setEndTimeDropdownOpen(!endTimeDropdownOpen);
//               }
//             }}
//             disabled={!startTime}
//           >
//             <View style={styles.dropdownContent}>
//               <Text style={[styles.dropdownText, (!endTime || !startTime) && styles.dropdownPlaceholder]}>
//                 {endTime || "Select end time"}
//               </Text>
//               <Text style={[styles.dropdownArrow, !startTime && { opacity: 0.5 }]}>
//                 {endTimeDropdownOpen ? "▲" : "▼"}
//               </Text>
//             </View>
//           </TouchableOpacity>
//             {/* Invisible spacer to match Teacher field width */}
//           <View style={{ width: 38, height: 38 }} />
//           </View>

//           {/* End Time Dropdown List */}
//           {endTimeDropdownOpen && startTime && (
//             <View style={styles.cascadingDropdown}>
//               <Text style={styles.cascadingDropdownTitle}>Select end time</Text>
//               <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
//                 {endTimes.map((time: string) => {
//                   const isSelected = endTime === time;
//                   return (
//                     <TouchableOpacity
//                       key={time}
//                       style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
//                       onPress={() => {
//                         setEndTime(time);
//                       }}
//                     >
//                       <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
//                         {time}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             </View>
//           )}

//           {/* REPEAT TOGGLE */}
//           <View style={styles.repeatRow}>
//             <Text style={styles.repeatLabel}>Schedule Days</Text>
//             <Switch
//               value={repeat}
//               onValueChange={setRepeat}
//               thumbColor="#FFF"
//               trackColor={{ true: COLORS.primary, false: "#CCC" }}
//             />
//           </View>

//           {/* SELECT DAYS */}
//           {/* SELECT DAYS (Visible only when REPEAT = true) */}
// {repeat && (
//   <>
//     <Text style={styles.label}>Select Days</Text>

//     <View style={styles.daysRow}>
//       {DAY_KEYS.map((d, i) => {
//         const isActive = activeDays.includes(i);
//         return (
//           <TouchableOpacity
//             key={i}
//             style={[
//               styles.dayCircle,
//               isActive && { backgroundColor: PURPLE },
//             ]}
//             onPress={() => toggleDay(i)}
//           >
//             <Text
//               style={[
//                 styles.dayText,
//                 isActive && { color: "#FFF", fontWeight: "700" },
//               ]}
//             >
//               {d}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>

//     {activeDays.length > 0 && (
//       <View style={styles.daySummaryBox}>
//         <Text style={styles.daySummaryText}>{formatSelectedDays()}</Text>
//       </View>
//     )}
//   </>
// )}


//         </ScrollView>

//         {/* FOOTER BUTTONS */}
//         <View style={styles.footerRow}>
//           <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
//             <Text style={styles.cancelText}>Cancel</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.saveBtn, (isEditMode ? updateMutation : createMutation).isPending && styles.saveBtnDisabled]}
//             onPress={() => {
//               console.log("🟢 BUTTON CLICKED!");
//               handleAddSlot();
//             }}
//             disabled={(isEditMode ? updateMutation : createMutation).isPending}
//           >
//             <Text style={styles.saveBtnText}>
//               {(isEditMode ? updateMutation : createMutation).isPending 
//                 ? (isEditMode ? "Updating..." : "Adding...") 
//                 : (isEditMode ? "UPDATE SLOT" : "ADD SLOT +")}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//       </View>
//     </Modal>
//     </>
//   );
// };

// export default SlotFormModal;

// const styles = StyleSheet.create({
//   backdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",  // ✅ Center me show hoga
//     alignItems: "center",
//   },
//   modalContentWrapper: {
//     flex: 1,
//     width: "85%",
//     maxHeight: "50%",
//     backgroundColor: "#FFF",
//     borderRadius: 20,
//     overflow: "hidden",
//   },
//   modalContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 16,
//     color: "#000000",
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     color: "#000000",
//   },
//   dropdownBox: {
//     flex: 1,
    
//     height: 45,             
//     borderWidth: 1,
//     borderColor: "#9CA3AF",
//     borderRadius: 10,
//     overflow: "hidden",
//     justifyContent: "center"
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   plusBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     borderWidth: 2,
//     borderColor: "#0B4DA2",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   plusText: {
//     color: "#0B4DA2",
//     fontSize: 22,
//     fontWeight: "700",
//   },
//   repeatRow: {
//     marginTop: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   repeatLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#000000", 
//   },
//   daysRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 8,
//   },
//   dayCircle: {
//     width: 34,
//     height: 34,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: "#C9D4F1",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   dayText: {
//     color: "#444",
//     fontWeight: "600",
//   },
//   daySummaryBox: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   daySummaryText: {
//     fontSize: 14,
//     color: "#111827",
//     lineHeight: 20,
//   },
//   footerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFF",
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
//   cancelBtn: {
//     flex: 1,
//     marginRight: 10,
//     padding: 14,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     alignItems: "center",
//   },
//   cancelText: { fontSize: 15, fontWeight: "600", color: "#111" },
//   saveBtn: {
//     flex: 1,
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 8,
//     backgroundColor: COLORS.primary,
//     alignItems: "center",
//   },
//   saveBtnText: {
//     color: "#FFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   saveBtnDisabled: {
//     opacity: 0.6,
//   },
//   addSubjectBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16,
//   },
//   addSubjectCard: {
//     width: "100%",
//     maxWidth: 420,
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     padding: 20,
//   },
//   addSubjectHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   addSubjectTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   addSubjectClose: {
//     fontSize: 18,
//     color: "#6B7280",
//   },
//   addSubjectMeta: {
//     fontSize: 14,
//     color: "#4B5563",
//     marginBottom: 4,
//   },
//   addSubjectMetaLabel: {
//     fontWeight: "600",
//     color: "#111827",
//   },
//   selectDropdownBox: {
//     borderWidth: 1,
//     borderColor: "#C9D4F1",
//     borderRadius: 10,
//     overflow: "hidden",
//     marginTop: 16,
//   },
//   subjectList: {
//     maxHeight: 220,
//     marginTop: 12,
//   },
//   subjectOptionRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   subjectCheckbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   subjectCheckboxActive: {
//     borderColor: COLORS.primary,
//     backgroundColor: "rgba(107,87,242,0.15)",
//   },
//   subjectCheckboxTick: {
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   subjectOptionLabel: {
//     color: "#111827",
//     fontSize: 14,
//   },
//   createLinkRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 16,
//   },
//   createLinkIcon: {
//     color: COLORS.primary,
//     fontSize: 18,
//     marginRight: 6,
//   },
//   createLinkText: {
//     color: COLORS.primary,
//     fontWeight: "600",
//   },
//   addSubjectInputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginTop: 16,
//   },
//   addSubjectTextInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     fontSize: 15,
//     color: "#111827",
//   },
//   addSubjectAddBtn: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#16A34A",
//     backgroundColor: "rgba(34,197,94,0.1)",
//   },
//   addSubjectAddText: {
//     color: "#16A34A",
//     fontWeight: "700",
//   },
//   pendingList: {
//     marginTop: 16,
//   },
//   pendingItem: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//   },
//   pendingHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   pendingTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   pendingRemove: {
//     color: "#9CA3AF",
//     fontSize: 16,
//   },
//   pendingTimeRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 10,
//   },
//   pendingTimeInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     color: "#9CA3AF",
//   },
//   addSubjectEmpty: {
//     textAlign: "center",
//     color: "#9CA3AF",
//     marginVertical: 24,
//   },
//   addSubjectFooter: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//     marginTop: 12,
//   },
//   addSubjectCancel: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//   },
//   addSubjectCancelText: {
//     color: "#6B7280",
//     fontWeight: "600",
//   },
//   addSubjectSubmit: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: COLORS.primary,
//   },
//   addSubjectSubmitDisabled: {
//     backgroundColor: "#CBD5F5",
//   },
//   addSubjectSubmitText: {
//     color: "#FFF",
//     fontWeight: "700",
//   },
//   // Cascading dropdown styles
//   dropdownContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     height: "100%",
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: "#111827",
//     flex: 1,
//   },
//   dropdownPlaceholder: {
//     color: "#6B7280",
//   },
//   dropdownArrow: {
//     color: "#6B7280",
//     fontSize: 12,
//     marginLeft: 8,
//   },
//   dropdownBoxDisabled: {
//     opacity: 0.5,
//   },
//   cascadingDropdown: {
//     backgroundColor: "#FFF",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#9CA3AF",
//     marginTop: 8,
//     marginBottom: 8,
//     maxHeight: 250,
//     overflow: "hidden",
//     width: "85%",
//   },
//   cascadingDropdownTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#111827",
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   cascadingDropdownList: {
//     maxHeight: 200,
//   },
//   cascadingDropdownItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   cascadingDropdownItemSelected: {
//     backgroundColor: "rgba(107,87,242,0.05)",
//   },
//   cascadingDropdownItemText: {
//     fontSize: 14,
//     color: "#111827",
//     flex: 1,
//   },
//   cascadingDropdownItemTextSelected: {
//     color: COLORS.primary,
//     fontWeight: "600",
//   },
//   cascadingDropdownCheck: {
//     color: COLORS.primary,
//     fontSize: 16,
//     fontWeight: "700",
//     marginLeft: 8,
//   },
// });


import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TextInput,
} from "react-native";
import { useUpdateCourseMutation } from "../../../../apis/hooks/courses/mutation/useUpdateCourse.mutation";
import { useUpdateBatchMutation } from "../../../../apis/hooks/batch/mutation/useUpdateBatch.mutation";
import moment from "moment";
import { Picker } from "@react-native-picker/picker";
import { useTeachersListQuery } from "../../../../apis/hooks/teachers/query/useTeachersList.query";
import { useGetClassroomListQuery } from "../../../../apis/hooks/teachers/query/useGetClassroomList.query";
import { useCourseDetailsQuery } from "../../../../apis/hooks/course/query/useCourseDetails.query";
import { useBatchDetailsQuery } from "../../../../apis/hooks/batch/query/useBatchDetails.query";
import { useCreateTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useCreateTimeTable.mutation";
import { useUpdateTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useUpdateTimeTable.mutation";
import { useDeleteTimeTableMutation } from "../../../../apis/hooks/timetable/mutations/useDeleteTimeTable.mutation";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrls } from "../../../../apis/urls";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { request } from "../../../../services/axios.service";
import { store } from "../../../../app/store";
import { COLORS } from "../../../../colors";
import { TTimetableCell } from "./TimetableGrid";
import { useNavigation } from "@react-navigation/native";
import { TScreenNavigator } from "../../../../types/navigator/screen-navigator";

type SlotFormModalProps = {
  visible: boolean;
  selectedCell: TTimetableCell | null;
  editingSlot?: any | null; // Slot data when editing
  onClose: () => void;
  onNavigateToClassrooms?: () => void;
  selectedBatch?: string;
  selectedBatchId?: string;
  batchData?: any;
  onSuccess?: () => void; // Callback after successful creation
  weekStart?: Date; // Week start date for refetch
  selectedOrganization?: any; // Organization for refetch params
  timeTableData?: any; // Timetable data for conflict validation
};

const PURPLE = "#6B57F2";
const DAY_KEYS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

// Convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Generate start times: operating hours ke andar 15 min intervals
const generateStartTimes = (opening: string, closing: string) => {
  const startMin = timeToMinutes(opening);
  const endMin = timeToMinutes(closing);
  const times: string[] = [];

  for (let minutes = startMin; minutes <= endMin; minutes += 15) {
    times.push(minutesToTime(minutes));
  }
  return times;
};

// Generate end times = start + 15 min increments, lekin closing time se zyada nahi
const generateEndTimes = (start: string, closing: string) => {
  const startMin = timeToMinutes(start);
  const closingMin = timeToMinutes(closing);
  const endTimes: string[] = [];

  for (let minutes = startMin + 15; minutes <= closingMin; minutes += 15) {
    endTimes.push(minutesToTime(minutes));
  }
  return endTimes;
};

// Check if two time slots overlap
const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // Two slots overlap if: start1 < end2 AND end1 > start2
  return start1Min < end2Min && end1Min > start2Min;
};

const SlotFormModal = ({
  visible,
  selectedCell,
  editingSlot,
  onClose,
  onNavigateToClassrooms,
  selectedBatch = "Batch",
  selectedBatchId = "",
  batchData,
  onSuccess,
  weekStart,
  selectedOrganization: propSelectedOrganization,
  timeTableData,
}: SlotFormModalProps) => {
  console.log("📋 === SLOT FORM MODAL RENDERED ===");
  console.log("📋 visible:", visible);
  console.log("📋 editingSlot prop:", editingSlot);
  console.log("📋 selectedCell:", selectedCell);
  
  const navigation = useNavigation<TScreenNavigator>();
  
  // ⭐ TEACHER LIST API
  const { data: teacherData } = useTeachersListQuery();

  // ⭐ CLASSROOM LIST API
  const { data: classroomData } = useGetClassroomListQuery();

  // ⭐ Selected batch info + courseId
  const selectedBatchInfo = useMemo(() => {
    if (batchData?.statusCode === 200 && Array.isArray(batchData.data) && selectedBatchId) {
      return batchData.data.find((b: any) => b.batchId === selectedBatchId) || null;
    }
    return null;
  }, [batchData, selectedBatchId]);

  const courseId = selectedBatchInfo?.courses?.[0]?.courseId || "";

  // ⭐ BATCH DETAILS API (assigned subjects ke liye)
  const { data: batchDetailsData } = useBatchDetailsQuery({
    batchId: selectedBatchId || "",
  });

  // ⭐ COURSE DETAIL API (subjects ke liye)
  const { data: courseDetailData } = useCourseDetailsQuery({
    courseId: courseId || "",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubjects, setCustomSubjects] = useState<{ value: string; label: string }[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(true);
  
  // ⭐ Add Subject Modal states
  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);
  const [selectedSubjectForBatch, setSelectedSubjectForBatch] = useState("");
  const [subjectModalMode, setSubjectModalMode] = useState<"select" | "create">("select");
  const [newSubjectName, setNewSubjectName] = useState("");

  // ⭐ Cascading dropdown states
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [startTimeDropdownOpen, setStartTimeDropdownOpen] = useState(false);
  const [endTimeDropdownOpen, setEndTimeDropdownOpen] = useState(false);

  // ⭐ TEACHER OPTIONS for Picker
  const teacherOptions = useMemo(() => {
    if (teacherData?.statuscode === 200 && Array.isArray(teacherData.data)) {
      return teacherData.data.map((t: any) => ({
        value: t.teacherId,
        label: `${t.teacherFirstName} ${t.teacherLastName || ""}`.trim(),
      }));
    }
    return [];
  }, [teacherData]);

  // ⭐ CLASSROOM OPTIONS for Picker
  const classroomOptions = useMemo(() => {
    if (classroomData?.statusCode === 200 && classroomData.data?.classRooms) {
      return classroomData.data.classRooms.map((room: any) => ({
        value: room.classRoomId,
        label: room.classRoomName,
      }));
    }
    return [];
  }, [classroomData]);

  // ⭐ SUBJECT OPTIONS - Show ONLY batch assigned subjects
  // (As per requirement: Main dropdown should show only subjects assigned to this batch)
  const subjectOptions = useMemo(() => {
    if (courseDetailData?.data?.subjects && Array.isArray(courseDetailData.data.subjects)) {
      // Get assigned subject IDs from batch details
      const batchAssignedSubjectIds: string[] = [];
      if (batchDetailsData?.data?.subjects && Array.isArray(batchDetailsData.data.subjects) && batchDetailsData.data.subjects.length > 0) {
        // Extract subject IDs from batch
        batchAssignedSubjectIds.push(
          ...batchDetailsData.data.subjects.map((s: any) => 
            s.subjectId || s.id || s
          )
        );
      }
      
      // Get all course subjects
      const allCourseSubjects = courseDetailData.data.subjects.map((s: any) => ({
        value: s.subjectId,
        label: s.subjectName,
      }));
      
      // Show ONLY batch-assigned subjects in main dropdown
      if (batchAssignedSubjectIds.length > 0) {
        return allCourseSubjects.filter((subject: { value: string; label: string }) =>
          batchAssignedSubjectIds.includes(subject.value)
        );
      }
      
      // If batch has NO subjects assigned, dropdown should be empty
      return [];
    }
    return [];
  }, [courseDetailData, batchDetailsData]);

  const courseName = courseDetailData?.data?.courseName || selectedBatchInfo?.courses?.[0]?.courseName || "Course";
  const batchName = selectedBatchInfo?.batchName || selectedBatch || "Batch";

  // ⭐ UNASSIGNED SUBJECTS (subjects in course but not assigned to batch)
  const unassignedSubjectOptions = useMemo(() => {
    if (courseDetailData?.data?.subjects && Array.isArray(courseDetailData.data.subjects)) {
      // Get assigned subject IDs from batch details
      const batchAssignedSubjectIds: string[] = [];
      if (batchDetailsData?.data?.subjects && Array.isArray(batchDetailsData.data.subjects)) {
        batchAssignedSubjectIds.push(
          ...batchDetailsData.data.subjects.map((s: any) => 
            s.subjectId || s.id || s
          )
        );
      }
      
      // Get all course subjects
      const allCourseSubjects = courseDetailData.data.subjects.map((s: any) => ({
        value: s.subjectId,
        label: s.subjectName,
      }));
      
      // Filter to show only unassigned subjects (not in batch)
      return allCourseSubjects.filter((subject: { value: string; label: string }) =>
        !batchAssignedSubjectIds.includes(subject.value)
      );
    }
    return [];
  }, [courseDetailData, batchDetailsData]);

  const combinedSubjectOptions = useMemo(
    () => [...subjectOptions, ...customSubjects],
    [subjectOptions, customSubjects]
  );

  // ⭐ OPERATING HOURS
  const DEFAULT_HOURS = { openingTime: "09:00", closingTime: "18:00" };
  const operatingHours = useMemo(() => {
    const opening =
      classroomData?.data?.openingTime ??
      classroomData?.data?.operatingHours?.openingTime ??
      DEFAULT_HOURS.openingTime;
    const closing =
      classroomData?.data?.closingTime ??
      classroomData?.data?.operatingHours?.closingTime ??
      DEFAULT_HOURS.closingTime;
    return { openingTime: opening, closingTime: closing };
  }, [classroomData]);

  // ⭐ START TIMES (operating hours ke andar 15 min intervals)
  const startTimes = useMemo(
    () => generateStartTimes(operatingHours.openingTime, operatingHours.closingTime),
    [operatingHours]
  );

  // ⭐ END TIMES (start time se 15 min increments, closing time se zyada nahi)
  const endTimes = useMemo(() => {
    if (!startTime) return [];
    return generateEndTimes(startTime, operatingHours.closingTime);
  }, [startTime, operatingHours.closingTime]);

  // ⭐ Reset endTime when startTime changes (but not in edit mode when initializing)
  useEffect(() => {
    if (startTime && !editingSlot) {
      setEndTime("");
    }
  }, [startTime, editingSlot]);

  // ⭐ Cascading dropdown logic (dropdowns always close, but next opens only in normal mode)
  useEffect(() => {
    if (selectedSubject) {
      setSubjectDropdownOpen(false);
      if (!editingSlot) {
        setTeacherDropdownOpen(true);
      }
    }
  }, [selectedSubject, editingSlot]);

  useEffect(() => {
    if (selectedTeacher) {
      setTeacherDropdownOpen(false);
      if (!editingSlot) {
        setRoomDropdownOpen(true);
      }
    }
  }, [selectedTeacher, editingSlot]);

  useEffect(() => {
    if (selectedRoom) {
      setRoomDropdownOpen(false);
      if (!editingSlot) {
        setStartTimeDropdownOpen(true);
      }
    }
  }, [selectedRoom, editingSlot]);

  useEffect(() => {
    if (startTime) {
      setStartTimeDropdownOpen(false);
      if (!editingSlot) {
        setEndTimeDropdownOpen(true);
      }
    }
  }, [startTime, editingSlot]);

  useEffect(() => {
    if (endTime) {
      setEndTimeDropdownOpen(false);
    }
  }, [endTime]);

  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2]); // M T W default

  // ⭐ Check if in edit mode (declare early so it can be used in useEffect)
  const isEditMode = !!editingSlot;

  // ⭐ Prefill form when editingSlot exists
  useEffect(() => {
    console.log("📝 === SLOT FORM MODAL EFFECT ===");
    console.log("📝 visible:", visible);
    console.log("📝 editingSlot:", editingSlot ? JSON.stringify(editingSlot, null, 2) : "null");
    console.log("📝 isEditMode:", isEditMode);
    
    if (editingSlot && visible) {
      console.log("📝 Prefilling form with editingSlot");
      console.log("📝 Subject ID:", editingSlot.subjectId);
      console.log("📝 Teacher ID:", editingSlot.teacherId);
      console.log("📝 Room ID:", editingSlot.classRoomId);
      console.log("📝 Start Time:", editingSlot.startTime);
      console.log("📝 End Time:", editingSlot.endTime);
      console.log("📝 Day:", editingSlot.day);
      
      // Set values immediately - Picker will update when options are available
      setSelectedSubject(editingSlot.subjectId || "");
      setSelectedTeacher(editingSlot.teacherId || "");
      setSelectedRoom(editingSlot.classRoomId || "");
      setStartTime(editingSlot.startTime || "");
      setEndTime(editingSlot.endTime || "");
      setRepeat(true); // Single day for edit mode
      
      // Set active day based on editingSlot.day
      if (editingSlot.day) {
        const dayDate = editingSlot.day instanceof Date ? editingSlot.day : new Date(editingSlot.day);
        const dayOfWeek = dayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Convert to our day index (0 = Monday)
        const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        console.log("📝 Day of week:", dayOfWeek, "Adjusted index:", adjustedIndex);
        setActiveDays([adjustedIndex]);
      }
      
      console.log("✅ Form values set:", {
        subject: editingSlot.subjectId,
        teacher: editingSlot.teacherId,
        room: editingSlot.classRoomId,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      });
    } else if (!editingSlot && visible) {
      console.log("📝 Resetting form for new slot");
      // Reset form when opening for new slot
      setSelectedSubject("");
      setSelectedTeacher("");
      setSelectedRoom("");
      setStartTime("");
      setEndTime("");
      setRepeat(true);
      setActiveDays([]);
    }
  }, [editingSlot, visible, isEditMode]);

  // ⭐ Log state values when they change (for debugging)
  useEffect(() => {
    if (visible && isEditMode) {
      console.log("📊 Current form state:", {
        selectedSubject,
        selectedTeacher,
        selectedRoom,
        startTime,
        endTime,
        activeDays,
        subjectOptionsCount: subjectOptions.length,
        teacherOptionsCount: teacherOptions.length,
        classroomOptionsCount: classroomOptions.length,
      });
    }
  }, [visible, isEditMode, selectedSubject, selectedTeacher, selectedRoom, startTime, endTime, activeDays, subjectOptions.length, teacherOptions.length, classroomOptions.length]);

  const toggleDay = (index: number) => {
    // In edit mode, only one day can be selected at a time
    if (isEditMode) {
      // If clicking the same day, deselect it (optional - or keep it selected)
      // If clicking a different day, replace the selection
      setActiveDays([index]);
    } else {
      // Normal mode: allow multiple days selection
      setActiveDays((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    }
  };

  // Format selected days for display
  const formatSelectedDays = () => {
    if (activeDays.length === 0) return "";
    
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const selectedDayNames = activeDays
      .sort((a, b) => a - b) // Sort by index to maintain order
      .map((index) => dayNames[index]);
    
    return `Occurs weekly on ${selectedDayNames.join(", ")}`;
  };

  const handleRoomPlusPress = () => {
    onClose();
    requestAnimationFrame(() => {
      onNavigateToClassrooms?.();
    });
  };

  // ⭐ REDUX: Organization data (use prop if provided, else from Redux)
  const reduxOrganization = useSelector((state: RootState) => state.auth.selectedOrganization);
  const selectedOrganization = propSelectedOrganization || reduxOrganization;

  // ⭐ MUTATION: Create, Update and Delete TimeTable
  const createMutation = useCreateTimeTableMutation();
  const updateMutation = useUpdateTimeTableMutation();
  const deleteMutation = useDeleteTimeTableMutation();
  const queryClient = useQueryClient();
  const updateCourseMutation = useUpdateCourseMutation();
  const updateBatchMutation = useUpdateBatchMutation();

  // ⭐ HANDLE: Create new subject and assign to batch
  /**
   * ISSUE EXPLANATION (subjectId क्यों नहीं मिलता):
   * 
   * 1. BACKEND PROCESSING DELAY:
   *    - जब हम updateCourse API call करते हैं, backend नया subject create करता है
   *    - Backend को subjectId generate करने में time लगता है (database write, ID generation)
   *    - कभी-कभी updateCourse का response तुरंत return हो जाता है, लेकिन subjectId अभी generate नहीं हुआ होता
   * 
   * 2. RESPONSE STRUCTURE:
   *    - updateCourse response में कभी-कभी नए subject का subjectId नहीं आता
   *    - यह backend की implementation पर depend करता है
   *    - Web portal में भी यही issue हो सकता है, लेकिन वहां retry mechanism है
   * 
   * 3. SOLUTION - RETRY MECHANISM:
   *    - updateCourse response में subjectId न मिलने पर singleCourseDetails API call करते हैं
   *    - singleCourseDetails हमेशा latest data return करता है (database से directly)
   *    - 5 attempts तक retry करते हैं, हर attempt में delay बढ़ता जाता है
   *    - Delay इसलिए क्योंकि backend को processing time चाहिए
   * 
   * 4. WHY THIS WORKS:
   *    - singleCourseDetails API database से directly data fetch करता है
   *    - updateCourse के बाद database update हो जाता है (थोड़ा delay के साथ)
   *    - Retry mechanism backend processing time को handle करता है
   * 
   * 5. ALTERNATIVE SOLUTIONS:
   *    - Backend को fix करना (updateCourse response में subjectId include करना) - Best solution
   *    - WebSocket/Real-time updates use करना - Complex
   *    - Polling mechanism - Current solution (simple and effective)
   */
  const handleCreateAndAssignSubject = async () => {
    const trimmedSubjectName = newSubjectName?.trim();
    
    if (!trimmedSubjectName) {
      Alert.alert("Error", "Please enter a subject name");
      return;
    }

    if (!courseId) {
      Alert.alert("Error", "Course ID not found");
      return;
    }

    // Get current course subjects with proper structure - include ALL existing subjects with their IDs and dates
    // This matches the web payload format where existing subjects have subjectId and dateCreated
    const currentCourseSubjects = (courseDetailData?.data?.subjects || [])
      .filter((s: any) => s.subjectId && !s.subjectId.startsWith('temp_') && !s.subjectId.startsWith('temp-'))
      .map((s: any) => ({
        subjectId: s.subjectId, // Must include for existing subjects
        subjectName: s.subjectName,
        subjectDescription: s.subjectDescription || "",
        dateCreated: s.dateCreated || Date.now(), // Must include for existing subjects
      }));

    // Create new subject object with temporary ID (like web portal does)
    // Web portal format: 5-character alphanumeric (lowercase letters + numbers)
    // Examples: "rh5my", "nz1yq", "ojy4z", "s3r3u"
    const generateTemporarySubjectId = () => {
      // Generate 5-character alphanumeric ID (like web portal)
      // Characters: a-z (lowercase) and 0-9
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      
      // Generate 5 random characters
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
      }
      
      return result; // Example: "rh5my", "nz1yq", etc.
    };
    
    const temporarySubjectId = generateTemporarySubjectId();
    const currentTimestamp = Date.now();
    
    // Create new subject object with temporary ID (backend will replace with real ID)
    // This helps us track the subject in the response
    const newSubject = {
      subjectId: temporarySubjectId, // Temporary ID for tracking
      subjectName: trimmedSubjectName, // Ensure it's properly trimmed
      subjectDescription: "",
      dateCreated: currentTimestamp, // Temporary timestamp
    };
    
    console.log("📝 Generated temporary subjectId:", temporarySubjectId);
    console.log("📝 This temporary ID will help us track the subject in response");

    // Prepare course update payload with new subject
    const courseUpdatePayload = {
      courseId: courseId,
      courseName: courseDetailData?.data?.courseName || "",
      courseDescription: courseDetailData?.data?.courseDescription || "",
      courseFee: courseDetailData?.data?.courseFee || 0,
      courseFeeDescription: courseDetailData?.data?.courseFeeDescription || "",
      courseDurationYear: courseDetailData?.data?.courseDuration 
        ? Math.floor(courseDetailData.data.courseDuration / 12) 
        : 0,
      courseDurationMonth: courseDetailData?.data?.courseDuration 
        ? courseDetailData.data.courseDuration % 12 
        : 0,
      maxPaymentInstallment: courseDetailData?.data?.maxPaymentInstallment || 2,
      mode: courseDetailData?.data?.mode || "offline",
      courseStatus: courseDetailData?.data?.courseStatus || "active",
      subjects: [...currentCourseSubjects, newSubject],
    };

    console.log("📝 Creating subject with name:", trimmedSubjectName);
    console.log("📝 Course update payload:", JSON.stringify(courseUpdatePayload, null, 2));

    try {
      // First, add subject to course
      const courseResponse = await updateCourseMutation.mutateAsync(courseUpdatePayload);
      
      console.log("📝 Course update response:", JSON.stringify(courseResponse, null, 2));
      
      if (courseResponse?.statusCode === 200) {
        console.log("📝 Course updated successfully");
        
        // Get subjects from updateCourse response
        const updatedSubjects = courseResponse?.data?.subjects || [];
        console.log("📝 Updated subjects from response:", updatedSubjects);
        console.log("📝 Looking for subject with name:", trimmedSubjectName);
        
        // Helper function to find subjectId from subjects array
        // Strategy: First try to find by temporary ID, then by name, then by newest
        const findSubjectId = (subjects: any[]): string | null => {
          console.log("🔍 Finding subjectId with temporary ID:", temporarySubjectId);
          console.log("🔍 Subject name:", trimmedSubjectName);
          
          // Strategy 1: Find by temporary ID first (if backend returned it)
          // Note: Temporary ID is now 5-character alphanumeric (like real IDs)
          // Backend might return the same temporary ID or replace it with a new real ID
          const subjectByTempId = subjects.find(
            (s: any) => s.subjectId === temporarySubjectId
          );
          
          if (subjectByTempId) {
            // If backend returned the same ID, it might be temporary or real
            // But if it matches our temporary ID exactly, we can use it for tracking
            // Backend will eventually replace it with a real ID (or might keep it if it's unique)
            // For now, we'll use it and let backend handle the ID generation
            console.log("✅ Found subject by temporary ID match:", subjectByTempId.subjectId);
            console.log("📝 Note: Backend may replace this with a real ID, or keep it if unique");
            // We'll still use this ID, but also try to find a newer real ID
            // Continue to other strategies to find the real ID
          }
          
          // Strategy 2: Find by exact name match with ID (5-character alphanumeric format)
          // Since temporary ID is also 5-character, we need to check if it's in our original list
          const existingSubjectIds = new Set(
            currentCourseSubjects.map((s: any) => s.subjectId).filter((id: any) => id)
          );
          
          const createdSubject = subjects.find(
            (s: any) => {
              const nameMatch = s.subjectName?.trim() === trimmedSubjectName;
              const hasId = s.subjectId && s.subjectId.length === 5; // 5-character alphanumeric
              // If ID is not in existing list, it's likely the new subject
              const isNew = hasId && !existingSubjectIds.has(s.subjectId);
              return nameMatch && hasId && isNew;
            }
          );
          
          if (createdSubject?.subjectId) {
            console.log("✅ Found real ID by name match:", createdSubject.subjectId);
            return createdSubject.subjectId;
          }
          
          // Strategy 3: Find the newest subject with matching name (5-character alphanumeric ID)
          const matchingSubjects = subjects.filter(
            (s: any) => {
              const nameMatch = s.subjectName?.trim() === trimmedSubjectName;
              const hasId = s.subjectId && s.subjectId.length === 5; // 5-character alphanumeric
              const isNew = hasId && !existingSubjectIds.has(s.subjectId);
              return nameMatch && hasId && isNew;
            }
          );
          
          if (matchingSubjects.length > 0) {
            // Sort by dateCreated descending (newest first) and get the first one
            const sorted = matchingSubjects.sort((a: any, b: any) => {
              return (b.dateCreated || 0) - (a.dateCreated || 0);
            });
            const foundId = sorted[0]?.subjectId || null;
            if (foundId) {
              console.log("✅ Found real ID by newest match:", foundId);
            }
            return foundId;
          }
          
          // Strategy 4: Find any new subject (not in original list) with 5-character ID
          const newSubjects = subjects.filter(
            (s: any) => {
              const hasId = s.subjectId && s.subjectId.length === 5; // 5-character alphanumeric
              const isNew = hasId && !existingSubjectIds.has(s.subjectId);
              return hasId && isNew;
            }
          );
          
          if (newSubjects.length > 0) {
            // Prefer matching name, otherwise get newest
            const foundId = newSubjects.find(
              (s: any) => s.subjectName?.trim() === trimmedSubjectName
            )?.subjectId || newSubjects.sort((a: any, b: any) => {
              return (b.dateCreated || 0) - (a.dateCreated || 0);
            })[0]?.subjectId || null;
            
            if (foundId) {
              console.log("✅ Found real ID by new subject match:", foundId);
            }
            return foundId;
          }
          
          console.log("❌ Could not find real ID using any strategy");
          return null;
        };
        
        // Try to find subjectId from updateCourse response first
        let newSubjectId = findSubjectId(updatedSubjects);
        
        // If subjectId not found in updateCourse response, fetch singleCourseDetails with retry
        /**
         * RETRY MECHANISM EXPLANATION:
         * 
         * क्यों Retry जरूरी है:
         * - updateCourse response में subjectId नहीं मिला
         * - Backend अभी भी processing कर रहा है (database write, ID generation)
         * - singleCourseDetails API database से directly latest data fetch करता है
         * 
         * Retry Strategy:
         * - 5 attempts तक try करते हैं
         * - हर attempt के बीच delay बढ़ता जाता है (500ms, 1000ms, 1500ms, 2000ms, 2500ms)
         * - Delay इसलिए क्योंकि backend को processing time चाहिए
         * - पहले attempt में तुरंत try करते हैं (0ms delay)
         * 
         * कैसे काम करता है:
         * 1. updateCourse call होता है → subject create होता है
         * 2. Response में subjectId नहीं मिलता
         * 3. singleCourseDetails call करते हैं (attempt 1) → अगर मिल गया तो stop
         * 4. नहीं मिला तो 500ms wait करके फिर try (attempt 2)
         * 5. यही process 5 attempts तक continue होता है
         * 6. किसी भी attempt में subjectId मिल जाए तो loop break हो जाता है
         * 
         * Success Rate:
         * - ज्यादातर cases में attempt 1 या 2 में subjectId मिल जाता है
         * - Rare cases में 3-4 attempts लग सकते हैं
         * - 5 attempts के बाद भी नहीं मिला तो error show करते हैं
         */
        if (!newSubjectId) {
          console.log("⚠️ SubjectId not found in updateCourse response, fetching singleCourseDetails...");
          console.log("📋 Reason: Backend is still processing the new subject creation");
          console.log("📋 Solution: Fetching latest data from database using singleCourseDetails API");
          
          const organization = store.getState().auth.selectedOrganization;
          const maxRetries = 5;
          const retryDelays = [500, 1000, 1500, 2000, 2500]; // Increasing delays in ms
          
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              // Wait before retry (except first attempt)
              // पहले attempt में तुरंत try करते हैं, बाकी में delay के साथ
              if (attempt > 0) {
                console.log(`⏳ Waiting ${retryDelays[attempt - 1]}ms before retry ${attempt + 1}...`);
                console.log(`⏳ Reason: Giving backend more time to process and generate subjectId`);
                await new Promise(resolve => setTimeout(resolve, retryDelays[attempt - 1]));
              }
              
              console.log(`🔄 Fetching singleCourseDetails (attempt ${attempt + 1}/${maxRetries})...`);
              console.log(`🔄 This API fetches latest data directly from database`);
              
              // singleCourseDetails API call - यह database से directly latest data fetch करता है
              const courseDetailsResponse = await request({
                url: apiUrls.course.FETCH_COURSE_DETAILS,
                method: "POST",
                data: {
                  courseId: courseId,
                  customerId: organization?.customerId,
                  organizationId: organization?.organizationId,
                },
              });
              
              console.log(`📋 singleCourseDetails response (attempt ${attempt + 1}):`, JSON.stringify(courseDetailsResponse, null, 2));
              
              // Check if response is valid and has subjects array
              if (courseDetailsResponse?.statusCode === 200 && courseDetailsResponse?.data?.subjects) {
                const fetchedSubjects = courseDetailsResponse.data.subjects;
                console.log(`📋 Total subjects found: ${fetchedSubjects.length}`);
                
                // Try to find subjectId using helper function
                newSubjectId = findSubjectId(fetchedSubjects);
                
                if (newSubjectId) {
                  console.log(`✅ Successfully found subject ID on attempt ${attempt + 1}:`, newSubjectId);
                  console.log(`✅ Subject name: "${trimmedSubjectName}"`);
                  console.log(`✅ Backend processing completed, subjectId is now available`);
                  break; // Exit retry loop - success!
                } else {
                  console.log(`⚠️ SubjectId still not found in attempt ${attempt + 1}`);
                  console.log(`⚠️ Backend might still be processing, will retry...`);
                  
                  // Log all subjects for debugging
                  console.log(`📋 All subjects in response:`, fetchedSubjects.map((s: any) => ({
                    name: s.subjectName,
                    id: s.subjectId,
                    dateCreated: s.dateCreated
                  })));
                }
              } else {
                console.log(`⚠️ Invalid response in attempt ${attempt + 1}`);
                console.log(`⚠️ Status code: ${courseDetailsResponse?.statusCode}`);
                console.log(`⚠️ Has subjects: ${!!courseDetailsResponse?.data?.subjects}`);
              }
            } catch (error: any) {
              console.error(`❌ Error fetching singleCourseDetails (attempt ${attempt + 1}):`, error);
              console.error(`❌ Error details:`, error?.response?.data || error?.message);
              // Continue to next retry - don't give up yet
            }
          }
        }
        
        if (!newSubjectId) {
          console.error("❌ Could not find created subject ID after all retries");
          console.error("❌ All subjects in updateCourse response:", updatedSubjects);
          console.error("❌ Looking for name:", trimmedSubjectName);
          Alert.alert(
            "Error", 
            `Subject "${trimmedSubjectName}" was created but the ID could not be retrieved after multiple attempts. Please refresh and try again.`,
            [
              {
                text: "OK",
                onPress: () => {
                  queryClient.invalidateQueries({
                    predicate: (query) => {
                      return query.queryKey[0] === apiUrls.course.FETCH_COURSE_DETAILS;
                    },
                  });
                  setAddSubjectModalVisible(false);
                  setSubjectModalMode("select");
                  setNewSubjectName("");
                },
              },
            ]
          );
          return;
        }
        
        console.log("✅ Successfully found subject ID:", newSubjectId);

        // Now assign this new subject to batch
        const batchInfo = selectedBatchInfo || batchDetailsData?.data;
        if (!batchInfo) {
          Alert.alert("Error", "Batch information not found");
          return;
        }

        // Get current batch subjects - preserve existing structure (string or object format)
        // According to API, subjects can be: string (subjectId) OR object {subjectId, startTime, endTime, teacherId}
        const currentBatchSubjects: (string | any)[] = [];
        if (batchDetailsData?.data?.subjects && Array.isArray(batchDetailsData.data.subjects)) {
          batchDetailsData.data.subjects.forEach((s: any) => {
            if (typeof s === "string") {
              // If it's a string, keep it as string
              currentBatchSubjects.push(s);
            } else if (s.subjectId) {
              // If it's an object, preserve the object structure
              currentBatchSubjects.push({
                subjectId: s.subjectId,
                startTime: s.startTime || null,
                endTime: s.endTime || null,
                teacherId: s.teacherId || "",
              });
            } else if (s.id) {
              // Fallback: if only id exists, convert to string
              currentBatchSubjects.push(s.id);
            }
          });
        }

        // Add new subject ID - check if it's already present
        const isAlreadyPresent = currentBatchSubjects.some((s: any) => {
          if (typeof s === "string") {
            return s === newSubjectId;
          } else if (s.subjectId) {
            return s.subjectId === newSubjectId;
          }
          return false;
        });

        if (!isAlreadyPresent) {
          // Add new subject as object format (matching API structure)
          currentBatchSubjects.push({
            subjectId: newSubjectId,
            startTime: null,
            endTime: null,
            teacherId: "",
          });
        }

        const batchUpdatePayload = {
          batchId: selectedBatchId,
          batchName: batchInfo.batchName || batchName,
          batchDescription: batchInfo.batchDescription || "",
          batchStartDate: batchInfo.batchStartDate || "",
          batchEndDate: batchInfo.batchEndDate || "",
          setBatchTime: batchInfo.batchClassStartTime ? "Yes" : "No",
          batchClassStartTime: batchInfo.batchClassStartTime || "",
          batchClassEndTime: batchInfo.batchClassEndTime || "",
          batchStatus: batchInfo.batchStatus || "active",
          subjects: currentBatchSubjects, // Array with mixed format: strings and objects
          batchDetails: batchInfo, // Pass complete batch details for mutation
          courses: batchInfo.courses || selectedBatchInfo?.courses || [],
          students: batchInfo.students || [],
          teacher: batchInfo.teacher || [],
        };

        console.log("📝 Batch update payload:", JSON.stringify(batchUpdatePayload, null, 2));

        const batchResponse = await updateBatchMutation.mutateAsync(batchUpdatePayload);
        
        console.log("📝 Batch update response:", JSON.stringify(batchResponse, null, 2));
        
        if (batchResponse?.statusCode === 200) {
          Alert.alert("Success", "Subject created and assigned to batch successfully");
          
          // Invalidate ALL related queries to refresh data
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === apiUrls.batch.FETCH_BATCH_DETAILS;
            },
          });
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === apiUrls.batch.FETCH_BATCHES_LIST;
            },
          });
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === apiUrls.batch.FETCH_BATCHES_LIST_NEW;
            },
          });
          // Invalidate singleCourseDetails (FETCH_COURSE_DETAILS) query
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === apiUrls.course.FETCH_COURSE_DETAILS;
            },
          });
          
          // Refetch course details to update singleCourseDetails data
          if (courseId) {
            queryClient.refetchQueries({
              queryKey: [apiUrls.course.FETCH_COURSE_DETAILS, { courseId }],
            });
          }
          
          // Refetch batch details to get updated subject list
          if (selectedBatchId) {
            queryClient.refetchQueries({
              predicate: (query) => {
                const queryKey = query.queryKey[0];
                const queryParams = query.queryKey[1] as any;
                return queryKey === apiUrls.batch.FETCH_BATCH_DETAILS && 
                       queryParams?.batchId === selectedBatchId;
              },
            });
          }
          
          // Close modal and reset
          setAddSubjectModalVisible(false);
          setSubjectModalMode("select");
          setNewSubjectName("");
          setSelectedSubjectForBatch("");
          // Set the new subject in the form
          setSelectedSubject(newSubjectId);
        } else {
          Alert.alert("Error", batchResponse?.message || "Subject created but failed to assign to batch");
        }
      } else {
        Alert.alert("Error", courseResponse?.message || "Failed to create subject");
      }
    } catch (error: any) {
      console.error("❌ Error creating subject:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      Alert.alert("Error", error?.response?.data?.message || "Failed to create subject");
    }
  };

  // ⭐ HANDLE: Assign subject to batch
  const handleAssignSubjectToBatch = async () => {
    if (!selectedSubjectForBatch || !selectedBatchId) {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    // Get current batch subjects
    const currentBatchSubjects: string[] = [];
    if (batchDetailsData?.data?.subjects && Array.isArray(batchDetailsData.data.subjects)) {
      currentBatchSubjects.push(
        ...batchDetailsData.data.subjects.map((s: any) => 
          s.subjectId || s.id || s
        )
      );
    }

    // Add new subject if not already present
    if (!currentBatchSubjects.includes(selectedSubjectForBatch)) {
      currentBatchSubjects.push(selectedSubjectForBatch);
    }

    // Get batch data for update
    const batchInfo = selectedBatchInfo || batchDetailsData?.data;
    if (!batchInfo) {
      Alert.alert("Error", "Batch information not found");
      return;
    }

    // Prepare update payload
    const updatePayload = {
      batchId: selectedBatchId,
      batchName: batchInfo.batchName || batchName,
      batchStartDate: batchInfo.batchStartDate || "",
      batchEndDate: batchInfo.batchEndDate || "",
      setBatchTime: batchInfo.batchClassStartTime ? "Yes" : "No",
      batchClassStartTime: batchInfo.batchClassStartTime || "",
      batchClassEndTime: batchInfo.batchClassEndTime || "",
      batchStatus: batchInfo.batchStatus || "active",
      subjects: currentBatchSubjects, // Array of subject IDs
    };

    try {
      const response = await updateBatchMutation.mutateAsync(updatePayload);
      if (response?.statusCode === 200) {
        Alert.alert("Success", "Subject assigned to batch successfully");
        // Invalidate batch details query to refetch
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey[0] === apiUrls.batch.FETCH_BATCH_DETAILS;
          },
        });
        // Also invalidate batch list to refresh
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey[0] === apiUrls.batch.FETCH_BATCHES_LIST;
          },
        });
        // Close modal and reset
        setAddSubjectModalVisible(false);
        const assignedSubjectId = selectedSubjectForBatch;
        setSelectedSubjectForBatch("");
        // Also set the selected subject in the form
        setSelectedSubject(assignedSubjectId);
      } else {
        Alert.alert("Error", response?.message || "Failed to assign subject to batch");
      }
    } catch (error: any) {
      console.error("Error assigning subject to batch:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to assign subject to batch");
    }
  };

  // ⭐ HELPER: Handle success response (refetch and close modal)
  const handleSuccessResponse = (response: any, isEdit: boolean) => {
    console.log(`✅ TimeTable ${isEdit ? "updated" : "created"} successfully:`, response);
    
    // Check for error responses (404, etc.)
    if (response?.status === 404 || response?.data?.statusCode === 404) {
      console.error("❌ 404 Error: Resource not found");
      Alert.alert("Error", response?.data?.message || "API endpoint not found (404). Please check the backend service.");
      return;
    }
    
    // Check if response is empty string (backend returns "" but saves data like web)
    const isEmptyResponse = typeof response === "string" && response === "";
    const hasNoData = !response?.data && !response?.statusCode;
    
    if (isEmptyResponse) {
      console.log("ℹ️ Backend returned empty string (like web), but data should be saved");
    } else if (hasNoData && !isEmptyResponse) {
      console.warn("⚠️ WARNING: Backend returned invalid response!");
      Alert.alert(
        "Warning",
        "Slot operation may have failed. Please check if the slot appears in the timetable. If not, please try again or contact support.",
        [{ text: "OK", style: "default" }]
      );
    }
    
    // Invalidate ALL timetable queries (with any params) to refresh grid
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === "timeTable";
      },
    });
    
    // If weekStart is provided, refetch with exact params
    if (weekStart && selectedOrganization && selectedBatchId) {
      const startWeekDate = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const endWeekDate = endDate.toISOString().split('T')[0];
      
      const refetchParams = {
        customerId: selectedOrganization.customerId,
        organizationId: selectedOrganization.organizationId,
        batchId: selectedBatchId,
        startWeekDate: startWeekDate,
        endWeekDate: endWeekDate,
      };
      
      console.log("🔄 Refetching with params:", refetchParams);
      
      setTimeout(() => {
        console.log("🔄 Executing refetch now...");
        queryClient.refetchQueries({
          queryKey: ["timeTable", refetchParams],
        }).then(() => {
          console.log("✅ Refetch completed");
        }).catch((err) => {
          console.error("❌ Refetch error:", err);
        });
      }, 2000);
    } else {
      setTimeout(() => {
        queryClient.refetchQueries({
          predicate: (query) => {
            return query.queryKey[0] === "timeTable";
          },
        });
      }, 2000);
    }
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    // Close modal
    onClose();
    // Reset form
    setSelectedSubject("");
    setSelectedTeacher("");
    setSelectedRoom("");
    setStartTime("");
    setEndTime("");
    setActiveDays([]);
  };

  // ⭐ HELPER: Handle error response
  const handleErrorResponse = (error: any, isEdit: boolean) => {
    console.error(`❌ Error ${isEdit ? "updating" : "creating"} TimeTable:`, error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    console.error("❌ API URL that failed:", isEdit ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE);
    
    const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEdit ? "update" : "create"} slot. Please try again.`;
    const is404 = error?.response?.status === 404 || 
                 error?.response?.data?.statusCode === 404 || 
                 error?.message?.includes("404") || 
                 error?.message?.includes("not found") ||
                 error?.message?.includes("Not Found");
    
    if (is404) {
      Alert.alert(
        "Error",
        "API endpoint not found (404). Please check the backend service or contact support.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      Alert.alert("Error", errorMessage, [{ text: "OK", style: "default" }]);
    }
  };

  // ⭐ HANDLE ADD/UPDATE SLOT
  const handleAddSlot = () => {
    const action = isEditMode ? "UPDATE" : "ADD";
    console.log(`🔵 === ${action} SLOT CLICKED ===`);
    console.log("Form Values:", {
      selectedSubject,
      selectedTeacher,
      selectedRoom,
      startTime,
      endTime,
      selectedBatchId,
      repeat,
      activeDays,
      selectedCell: selectedCell ? "exists" : "null",
      editingSlot: editingSlot ? "exists" : "null",
    });

    // Validation
    if (!selectedSubject) {
      console.log("❌ Validation failed: Subject not selected");
      Alert.alert("Error", "Please select a subject");
      return;
    }
    if (!selectedTeacher) {
      console.log("❌ Validation failed: Teacher not selected");
      Alert.alert("Error", "Please select a teacher");
      return;
    }
    if (!selectedRoom) {
      console.log("❌ Validation failed: Room not selected");
      Alert.alert("Error", "Please select a room");
      return;
    }
    if (!startTime) {
      console.log("❌ Validation failed: Start time not selected");
      Alert.alert("Error", "Please select start time");
      return;
    }
    if (!endTime) {
      console.log("❌ Validation failed: End time not selected");
      Alert.alert("Error", "Please select end time");
      return;
    }
    if (!selectedBatchId) {
      console.log("❌ Validation failed: Batch ID not found");
      Alert.alert("Error", "Batch not selected");
      return;
    }
    if (repeat && activeDays.length === 0) {
      console.log("❌ Validation failed: No days selected");
      Alert.alert("Error", "Please select at least one day");
      return;
    }
    if (!repeat && !selectedCell) {
      console.log("❌ Validation failed: No cell selected and repeat is off");
      Alert.alert("Error", "Please select a cell or enable repeat");
      return;
    }

    console.log("✅ All validations passed");

    // ⭐ CONFLICT VALIDATION: Check for time conflicts with existing slots
    const repeatDaysData = timeTableData?.data?.repeatDays || {};
    const conflicts: string[] = [];
    const dayNames: { [key: string]: string } = {
      "M": "Monday",
      "T": "Tuesday",
      "W": "Wednesday",
      "Th": "Thursday",
      "F": "Friday",
      "Sa": "Saturday",
      "Su": "Sunday"
    };

    // Build daysToUse first to check conflicts
    let daysToUse: string[] = [];
    if (repeat) {
      if (weekStart) {
        daysToUse = activeDays.map((dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);
          const dayOfWeek = dayDate.getDay();
          const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
          return dayKeys[dayOfWeek];
        });
      } else {
        daysToUse = activeDays.map((dayIndex) => DAY_KEYS[dayIndex]);
      }
    } else if (isEditMode && editingSlot?.day) {
      const dayOfWeek = editingSlot.day.getDay();
      const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
      daysToUse = [dayKeys[dayOfWeek]];
    } else if (selectedCell) {
      const dayOfWeek = selectedCell.day.getDay();
      const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
      daysToUse = [dayKeys[dayOfWeek]];
    }

    // Check conflicts for each selected day
    for (const dayKey of daysToUse) {
      const daySlots = repeatDaysData[dayKey] || [];
      const dayName = dayNames[dayKey] || dayKey;

      for (const existingSlot of daySlots) {
        // Skip the current slot if we're editing (to avoid self-conflict)
        if (isEditMode && editingSlot && (existingSlot.id === editingSlot.id || existingSlot.slotId === editingSlot.id)) {
          continue;
        }

        // Check if times overlap
        if (isTimeOverlap(startTime, endTime, existingSlot.startTime, existingSlot.endTime)) {
          // Check if same teacher
          if (existingSlot.teacherId === selectedTeacher) {
            conflicts.push(`${dayName}: Teacher already has a slot from ${existingSlot.startTime} to ${existingSlot.endTime}`);
          }
          // Check if same classroom
          else if (existingSlot.classRoomId === selectedRoom) {
            conflicts.push(`${dayName}: Classroom already booked from ${existingSlot.startTime} to ${existingSlot.endTime}`);
          }
        }
      }
    }

    // If conflicts found, show error and return
    if (conflicts.length > 0) {
      const conflictMessage = `⛔ Time Conflict Detected:\n\n${conflicts.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
      console.log("❌ Conflict detected:", conflictMessage);
      Alert.alert("Time Conflict", conflictMessage);
      return;
    }

    // Build slot object
    const slotObject = {
      subjectId: selectedSubject,
      teacherId: selectedTeacher,
      classRoomId: selectedRoom,
      startTime: startTime,
      endTime: endTime,
    };

    // Build repeatDays payload (daysToUse already calculated above in conflict validation)
    // Final validation: ensure we have at least one day
    if (daysToUse.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    // ⭐ CHECK IF DAY HAS CHANGED (for edit mode)
    let dayChanged = false;
    let originalDayKey = "";
    
    if (isEditMode && editingSlot?.day) {
      // Get original day key from editingSlot
      const originalDayDate = editingSlot.day instanceof Date ? editingSlot.day : new Date(editingSlot.day);
      const originalDayOfWeek = originalDayDate.getDay();
      const dayKeys = ["Su", "M", "T", "W", "Th", "F", "Sa"];
      originalDayKey = dayKeys[originalDayOfWeek];
      
      // Check if new day is different from original day
      // For single day edit, daysToUse should have only one day
      if (daysToUse.length === 1 && daysToUse[0] !== originalDayKey) {
        dayChanged = true;
        console.log("🔄 Day changed detected!");
        console.log("🔄 Original day:", originalDayKey);
        console.log("🔄 New day:", daysToUse[0]);
      }
    }

    let payload: any;

    // For UPDATE: Use flat structure like web (simple object with repeatDays array)
    if (isEditMode && editingSlot) {
      // Clean the ID - remove any extra quotes or whitespace
      let slotId = (editingSlot.id || editingSlot.slotId || "").toString();
      // Remove quotes from start and end only (not from middle)
      slotId = slotId.replace(/^["']+|["']+$/g, "").trim();
      
      console.log("✏️ Edit mode - Slot ID:", slotId);
      console.log("✏️ Original ID from editingSlot:", editingSlot.id);
      
      if (!slotId) {
        Alert.alert("Error", "Slot ID is missing. Cannot update slot.");
        return;
      }

      // Convert day keys to day indices (like web: [0, 1, 2] for M, T, W)
      // Web uses: 0=Monday, 1=Tuesday, etc.
      const dayKeyToIndex: Record<string, number> = {
        "M": 0,
        "T": 1,
        "W": 2,
        "Th": 3,
        "F": 4,
        "Sa": 5,
        "Su": 6,
      };
      const repeatDaysArray = daysToUse
        .map(dayKey => dayKeyToIndex[dayKey])
        .filter(idx => idx !== undefined);

      // Build flat payload like web version
      payload = {
        customerId: selectedOrganization?.customerId,
        organizationId: selectedOrganization?.organizationId,
        batchId: selectedBatchId,
        id: slotId,
        subjectId: selectedSubject,
        teacherId: selectedTeacher,
        classRoomId: selectedRoom,
        startTime: startTime,
        endTime: endTime,
        repeatDays: repeatDaysArray, // Array of day indices, not nested object
        startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
        endDate: weekStart ? (() => {
          const end = new Date(weekStart);
          end.setDate(weekStart.getDate() + 6);
          return end.toISOString().split('T')[0];
        })() : "",
      };
      
      console.log("✏️ Update payload (flat structure like web):", JSON.stringify(payload, null, 2));
    } else {
      // For CREATE: Use FLAT structure like web (not nested)
      // Convert day keys to day indices (0=Monday, 1=Tuesday, etc.)
      const dayKeyToIndex: Record<string, number> = {
        "M": 0,
        "T": 1,
        "W": 2,
        "Th": 3,
        "F": 4,
        "Sa": 5,
        "Su": 6,
      };
      const repeatDaysArray = daysToUse
        .map(dayKey => dayKeyToIndex[dayKey])
        .filter(idx => idx !== undefined);

      // Build flat payload like web version
      payload = {
        customerId: selectedOrganization?.customerId,
        organizationId: selectedOrganization?.organizationId,
        batchId: selectedBatchId,
        subjectId: selectedSubject,
        teacherId: selectedTeacher,
        classRoomId: selectedRoom,
        startTime: startTime,
        endTime: endTime,
        repeatDays: repeatDaysArray, // Array of day indices, not nested object
        startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
        endDate: weekStart ? (() => {
          const end = new Date(weekStart);
          end.setDate(weekStart.getDate() + 6);
          return end.toISOString().split('T')[0];
        })() : "",
      };
      
      console.log("📦 CREATE payload (flat structure like web):", JSON.stringify(payload, null, 2));
    }

    console.log(`📦 Final Payload (${isEditMode ? "UPDATE" : "CREATE"}):`, JSON.stringify(payload, null, 2));
    console.log("📦 Organization:", {
      customerId: selectedOrganization?.customerId,
      organizationId: selectedOrganization?.organizationId,
    });

    // ⭐ HANDLE DAY CHANGE: If day changed, delete old slot first, then create new one
    if (dayChanged && isEditMode && editingSlot) {
      console.log("🔄 Day changed - Deleting old slot and creating new one...");
      
      // Clean the ID
      let slotId = (editingSlot.id || editingSlot.slotId || "").toString();
      slotId = slotId.replace(/^["']+|["']+$/g, "").trim();
      
      // Build delete payload
      const deletePayload = {
        customerId: selectedOrganization?.customerId,
        organizationId: selectedOrganization?.organizationId,
        batchId: selectedBatchId,
        startDate: weekStart ? weekStart.toISOString().split('T')[0] : "",
        endDate: weekStart ? (() => {
          const end = new Date(weekStart);
          end.setDate(weekStart.getDate() + 6);
          return end.toISOString().split('T')[0];
        })() : "",
        id: slotId,
        dayKey: originalDayKey,
        startTime: editingSlot.startTime || startTime,
        endTime: editingSlot.endTime || endTime,
      };
      
      console.log("🗑️ Delete payload (old day):", JSON.stringify(deletePayload, null, 2));
      
      // First delete from old day
      deleteMutation.mutate(deletePayload, {
        onSuccess: (deleteResponse) => {
          console.log("✅ Old slot deleted successfully:", deleteResponse);
          
          // Now create new slot in new day
          console.log("➕ Creating new slot in new day...");
          createMutation.mutate(payload, {
            onSuccess: (createResponse) => {
              console.log("✅ New slot created successfully:", createResponse);
              handleSuccessResponse(createResponse, false);
            },
            onError: (createError) => {
              console.error("❌ Error creating new slot:", createError);
              handleErrorResponse(createError, false);
            },
          });
        },
        onError: (deleteError: any) => {
          console.error("❌ Error deleting old slot:", deleteError);
          const errorMessage = deleteError?.response?.data?.message || deleteError?.message || "Failed to delete old slot. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      });
      
      return; // Exit early, don't proceed with normal update
    }

    // Call API (normal update or create)
    const mutation = isEditMode ? updateMutation : createMutation;
    console.log(`🚀 Calling ${isEditMode ? "updateMutation" : "createMutation"}.mutate...`);
    mutation.mutate(payload, {
      onSuccess: (response) => {
        console.log(`✅ TimeTable ${isEditMode ? "updated" : "created"} successfully:`, response);
        console.log("📝 Response type:", typeof response);
        console.log("📝 Response stringified:", JSON.stringify(response));
        console.log("📝 Response data:", response?.data);
        console.log("📝 Response statusCode:", response?.statusCode);
        console.log("📝 Response message:", response?.message);
        
        // Check for error responses (404, etc.) - If axios returns error as response
        if (response?.status === 404 || response?.data?.statusCode === 404) {
          console.error("❌ 404 Error: Resource not found (caught in onSuccess)");
          // Throw error so it goes to onError handler for proper handling
          throw new Error(response?.data?.message || "API endpoint not found (404). Please check the backend service.");
        }
        
        // Check if response is empty string (backend returns "" but saves data like web)
        const isEmptyResponse = typeof response === "string" && response === "";
        const hasNoData = !response?.data && !response?.statusCode;
        
        if (isEmptyResponse) {
          console.log("ℹ️ Backend returned empty string (like web), but data should be saved");
          // Don't show warning - web me bhi same response aata hai and it works
          // Proceed with refetch - data should be saved
        } else if (hasNoData && !isEmptyResponse) {
          console.warn("⚠️ WARNING: Backend returned invalid response!");
          console.warn("⚠️ This might indicate the data was not saved properly.");
          
          // Show warning to user only if response is not empty string
          Alert.alert(
            "Warning",
            "Slot creation may have failed. Please check if the slot appears in the timetable. If not, please try again or contact support.",
            [
              {
                text: "OK",
                style: "default",
              },
            ]
          );
        }
        
        // Invalidate ALL timetable queries (with any params) to refresh grid
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey[0] === "timeTable";
          },
        });
        
        // If weekStart is provided, refetch with exact params
        if (weekStart && selectedOrganization && selectedBatchId) {
          const startWeekDate = weekStart.toISOString().split('T')[0];
          const endDate = new Date(weekStart);
          endDate.setDate(weekStart.getDate() + 6);
          const endWeekDate = endDate.toISOString().split('T')[0];
          
          const refetchParams = {
            customerId: selectedOrganization.customerId,
            organizationId: selectedOrganization.organizationId,
            batchId: selectedBatchId,
            startWeekDate: startWeekDate,
            endWeekDate: endWeekDate,
          };
          
          console.log("🔄 Refetching with params:", refetchParams);
          
          // Longer delay to ensure backend has fully processed and committed
          setTimeout(() => {
            console.log("🔄 Executing refetch now...");
            queryClient.refetchQueries({
              queryKey: ["timeTable", refetchParams],
            }).then(() => {
              console.log("✅ Refetch completed");
            }).catch((err) => {
              console.error("❌ Refetch error:", err);
            });
          }, 2000); // Increased to 2 seconds
        } else {
          // Fallback: refetch all timeTable queries
          setTimeout(() => {
            queryClient.refetchQueries({
              predicate: (query) => {
                return query.queryKey[0] === "timeTable";
              },
            });
          }, 2000);
        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        // Close modal
        onClose();
        // Reset form
        setSelectedSubject("");
        setSelectedTeacher("");
        setSelectedRoom("");
        setStartTime("");
        setEndTime("");
        setActiveDays([]);
      },
      onError: (error: any) => {
        console.error(`❌ Error ${isEditMode ? "updating" : "creating"} TimeTable:`, error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        console.error("❌ Error type:", typeof error);
        console.error("❌ Error message:", error?.message);
        console.error("❌ Error response:", error?.response);
        console.error("❌ Error status:", error?.response?.status);
        console.error("❌ Error statusCode:", error?.response?.data?.statusCode);
        console.error("❌ Error response message:", error?.response?.data?.message);
        console.error("❌ API URL that failed:", isEditMode ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE);
        
        // Get error message from different possible locations
        const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? "update" : "create"} slot. Please try again.`;
        const is404 = error?.response?.status === 404 || 
                     error?.response?.data?.statusCode === 404 || 
                     error?.message?.includes("404") || 
                     error?.message?.includes("not found") ||
                     error?.message?.includes("Not Found");
        
        // Check for 404 specifically
        if (is404) {
          const apiUrl = isEditMode ? apiUrls.timetable.UPDATE_TIME_TABLE : apiUrls.timetable.CREATE_TIME_TABLE;
          Alert.alert(
            "404 - Resource Not Found",
            `The API endpoint was not found. Please check:\n\n1. API URL: ${apiUrl}\n2. Payload structure\n3. Backend service status\n\nError: ${errorMessage}`
          );
        } else {
          Alert.alert(
            "Error",
            errorMessage
          );
        }
      },
    });
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.modalContentWrapper}>
            <ScrollView
              style={styles.modalContainer}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
          {/* Title */}
          <Text style={styles.title}>
            {isEditMode ? "Update Slot" : `Add New Slot for ${selectedBatch}`}
            
          </Text>

          {/* SUBJECT */}
          <Text style={styles.label}>Subject</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.dropdownBox}
              onPress={() => {
                setSubjectDropdownOpen(!subjectDropdownOpen);
                if (subjectDropdownOpen) {
                  setTeacherDropdownOpen(false);
                  setRoomDropdownOpen(false);
                  setStartTimeDropdownOpen(false);
                  setEndTimeDropdownOpen(false);
                }
              }}
            >
              <View style={styles.dropdownContent}>
                <Text style={[styles.dropdownText, !selectedSubject && styles.dropdownPlaceholder]}>
                  {selectedSubject 
                    ? combinedSubjectOptions.find((s: { value: string; label: string }) => s.value === selectedSubject)?.label 
                    : "Select subject"}
                </Text>
                <Text style={styles.dropdownArrow}>{subjectDropdownOpen ? "▲" : "▼"}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusBtn}
              onPress={() => {
                if (courseId && selectedBatchId) {
                  setAddSubjectModalVisible(true);
                } else {
                  Alert.alert("Error", "Course ID or Batch ID not found. Please select a batch first.");
                }
              }}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Subject Dropdown List */}
          {subjectDropdownOpen && (
            <View style={styles.cascadingDropdown}>
              <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
                {combinedSubjectOptions.length > 0 ? (
                  combinedSubjectOptions.map((subject: { value: string; label: string }) => {
                    const isSelected = selectedSubject === subject.value;
                    return (
                      <TouchableOpacity
                        key={subject.value}
                        style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
                        onPress={() => {
                          setSelectedSubject(subject.value);
                        }}
                      >
                        <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
                          {subject.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.cascadingDropdownItem}>
                    <Text style={styles.cascadingDropdownItemText}>Data not found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* TEACHER */}
          <Text style={styles.label}>Teacher</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.dropdownBox, !selectedSubject && styles.dropdownBoxDisabled]}
              onPress={() => {
                if (selectedSubject) {
                  setTeacherDropdownOpen(!teacherDropdownOpen);
                  if (teacherDropdownOpen) {
                    setRoomDropdownOpen(false);
                    setStartTimeDropdownOpen(false);
                    setEndTimeDropdownOpen(false);
                  }
                }
              }}
              disabled={!selectedSubject}
            >
              <View style={styles.dropdownContent}>
                <Text style={[styles.dropdownText, (!selectedTeacher || !selectedSubject) && styles.dropdownPlaceholder]}>
                  {selectedTeacher 
                    ? teacherOptions.find((t: { value: string; label: string }) => t.value === selectedTeacher)?.label 
                    : "Select teacher"}
                </Text>
                <Text style={[styles.dropdownArrow, !selectedSubject && { opacity: 0.5 }]}>
                  {teacherDropdownOpen ? "▲" : "▼"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.plusBtn}
              onPress={() => {
                onClose(); // Close slot form modal first
                (navigation as any).navigate("AddEmployeeScreen");
              }}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Teacher Dropdown List */}
          {teacherDropdownOpen && selectedSubject && (
            <View style={styles.cascadingDropdown}>
              <Text style={styles.cascadingDropdownTitle}>Select teacher</Text>
              <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
                {teacherOptions.length > 0 ? (
                  teacherOptions.map((teacher: { value: string; label: string }) => {
                    const isSelected = selectedTeacher === teacher.value;
                    return (
                      <TouchableOpacity
                        key={teacher.value}
                        style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
                        onPress={() => {
                          setSelectedTeacher(teacher.value);
                        }}
                      >
                        <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
                          {teacher.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.cascadingDropdownItem}>
                    <Text style={styles.cascadingDropdownItemText}>No teachers found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* ROOM */}
          <Text style={styles.label}>Room</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.dropdownBox, !selectedTeacher && styles.dropdownBoxDisabled]}
              onPress={() => {
                if (selectedTeacher) {
                  setRoomDropdownOpen(!roomDropdownOpen);
                  if (roomDropdownOpen) {
                    setStartTimeDropdownOpen(false);
                    setEndTimeDropdownOpen(false);
                  }
                }
              }}
              disabled={!selectedTeacher}
            >
              <View style={styles.dropdownContent}>
                <Text style={[styles.dropdownText, (!selectedRoom || !selectedTeacher) && styles.dropdownPlaceholder]}>
                  {selectedRoom 
                    ? classroomOptions.find((r: { value: string; label: string }) => r.value === selectedRoom)?.label 
                    : "Select room"}
                </Text>
                <Text style={[styles.dropdownArrow, !selectedTeacher && { opacity: 0.5 }]}>
                  {roomDropdownOpen ? "▲" : "▼"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.plusBtn} onPress={handleRoomPlusPress}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Room Dropdown List */}
          {roomDropdownOpen && selectedTeacher && (
            <View style={styles.cascadingDropdown}>
              <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
                {classroomOptions.length > 0 ? (
                  classroomOptions.map((room: { value: string; label: string }) => {
                    const isSelected = selectedRoom === room.value;
                    return (
                      <TouchableOpacity
                        key={room.value}
                        style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
                        onPress={() => {
                          setSelectedRoom(room.value);
                        }}
                      >
                        <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
                          {room.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.cascadingDropdownItem}>
                    <Text style={styles.cascadingDropdownItemText}>Data not found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* START TIME */}
          <Text style={styles.label}>Start Time</Text> 
          <View style={styles.row}>       
          <TouchableOpacity 
            style={[styles.dropdownBox, !selectedRoom && styles.dropdownBoxDisabled]}
            onPress={() => {
              if (selectedRoom) {
                setStartTimeDropdownOpen(!startTimeDropdownOpen);
                if (startTimeDropdownOpen) {
                  setEndTimeDropdownOpen(false);
                }
              }
            }}
            disabled={!selectedRoom}
          >
            <View style={styles.dropdownContent}>
              <Text style={[styles.dropdownText, (!startTime || !selectedRoom) && styles.dropdownPlaceholder]}>
                {startTime || "Select start time"}
              </Text>
              <Text style={[styles.dropdownArrow, !selectedRoom && { opacity: 0.5 }]}>
                {startTimeDropdownOpen ? "▲" : "▼"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ width: 38, height: 38 }} />
          </View>
          {/* Start Time Dropdown List */}
          {startTimeDropdownOpen && selectedRoom && (
            <View style={styles.cascadingDropdown}>
              <Text style={styles.cascadingDropdownTitle}>Select start time</Text>
              <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
                {startTimes.map((time: string) => {
                  const isSelected = startTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
                      onPress={() => {
                        setStartTime(time);
                      }}
                    >
                      <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* END TIME */}
          <Text style={styles.label}>End Time</Text>
          <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.dropdownBox, !startTime && styles.dropdownBoxDisabled]}
            onPress={() => {
              if (startTime) {
                setEndTimeDropdownOpen(!endTimeDropdownOpen);
              }
            }}
            disabled={!startTime}
          >
            <View style={styles.dropdownContent}>
              <Text style={[styles.dropdownText, (!endTime || !startTime) && styles.dropdownPlaceholder]}>
                {endTime || "Select end time"}
              </Text>
              <Text style={[styles.dropdownArrow, !startTime && { opacity: 0.5 }]}>
                {endTimeDropdownOpen ? "▲" : "▼"}
              </Text>
            </View>
          </TouchableOpacity>
            {/* Invisible spacer to match Teacher field width */}
          <View style={{ width: 38, height: 38 }} />
          </View>

          {/* End Time Dropdown List */}
          {endTimeDropdownOpen && startTime && (
            <View style={styles.cascadingDropdown}>
              <Text style={styles.cascadingDropdownTitle}>Select end time</Text>
              <ScrollView style={styles.cascadingDropdownList} nestedScrollEnabled>
                {endTimes.map((time: string) => {
                  const isSelected = endTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.cascadingDropdownItem, isSelected && styles.cascadingDropdownItemSelected]}
                      onPress={() => {
                        setEndTime(time);
                      }}
                    >
                      <Text style={[styles.cascadingDropdownItemText, isSelected && styles.cascadingDropdownItemTextSelected]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* REPEAT TOGGLE */}
          <View style={styles.repeatRow}>
            <Text style={styles.repeatLabel}>Schedule Days</Text>
            <Switch
              value={repeat}
              onValueChange={setRepeat}
              thumbColor="#FFF"
              trackColor={{ true: COLORS.primary, false: "#CCC" }}
            />
          </View>

          {/* SELECT DAYS */}
          {/* SELECT DAYS (Visible only when REPEAT = true) */}
{repeat && (
  <>
    <Text style={styles.label}>Select Days</Text>

    <View style={styles.daysRow}>
      {DAY_KEYS.map((d, i) => {
        const isActive = activeDays.includes(i);
        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.dayCircle,
              isActive && { backgroundColor: PURPLE },
            ]}
            onPress={() => toggleDay(i)}
          >
            <Text
              style={[
                styles.dayText,
                isActive && { color: "#FFF", fontWeight: "700" },
              ]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {activeDays.length > 0 && (
      <View style={styles.daySummaryBox}>
        <Text style={styles.daySummaryText}>{formatSelectedDays()}</Text>
      </View>
    )}
  </>
)}


        </ScrollView>

        {/* FOOTER BUTTONS */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, (isEditMode ? updateMutation : createMutation).isPending && styles.saveBtnDisabled]}
            onPress={() => {
              console.log("🟢 BUTTON CLICKED!");
              handleAddSlot();
            }}
            disabled={(isEditMode ? updateMutation : createMutation).isPending}
          >
            <Text style={styles.saveBtnText}>
              {(isEditMode ? updateMutation : createMutation).isPending 
                ? (isEditMode ? "Updating..." : "Adding...") 
                : (isEditMode ? "UPDATE SLOT" : "ADD SLOT +")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </Modal>

    {/* Add Subject Modal */}
    <Modal
      visible={addSubjectModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setAddSubjectModalVisible(false)}
    >
      <View style={styles.addSubjectBackdrop}>
        <TouchableOpacity
          style={styles.addSubjectBackdropOverlay}
          activeOpacity={1}
          onPress={() => setAddSubjectModalVisible(false)}
        />
        <View style={styles.addSubjectCard}>
          {/* Header */}
          <View style={styles.addSubjectHeader}>
            <Text style={styles.addSubjectTitle}>Add Subject</Text>
            <TouchableOpacity 
              style={styles.addSubjectCloseButton}
              onPress={() => {
                setAddSubjectModalVisible(false);
                setSelectedSubjectForBatch("");
                setSubjectModalMode("select");
                setNewSubjectName("");
              }}
            >
              <Text style={styles.addSubjectClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Course and Batch Info */}
          <View style={styles.addSubjectMetaContainer}>
            <View style={styles.addSubjectMetaRow}>
              <Text style={styles.addSubjectMetaLabel}>Course:</Text>
              <Text style={styles.addSubjectMetaValue}>{courseName}</Text>
            </View>
            <View style={styles.addSubjectMetaRow}>
              <Text style={styles.addSubjectMetaLabel}>Batch:</Text>
              <Text style={styles.addSubjectMetaValue}>{batchName}</Text>
            </View>
          </View>

          {/* Mode Toggle */}
          <View style={styles.addSubjectModeToggle}>
            <TouchableOpacity
              style={[
                styles.addSubjectModeButton,
                subjectModalMode === "select" && styles.addSubjectModeButtonActive,
              ]}
              onPress={() => {
                setSubjectModalMode("select");
                setNewSubjectName("");
              }}
            >
              <Text style={[
                styles.addSubjectModeButtonText,
                subjectModalMode === "select" && styles.addSubjectModeButtonTextActive,
              ]}>
                Select Existing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addSubjectModeButton,
                subjectModalMode === "create" && styles.addSubjectModeButtonActive,
              ]}
              onPress={() => {
                setSubjectModalMode("create");
                setSelectedSubjectForBatch("");
              }}
            >
              <Text style={[
                styles.addSubjectModeButtonText,
                subjectModalMode === "create" && styles.addSubjectModeButtonTextActive,
              ]}>
                Create New
              </Text>
            </TouchableOpacity>
          </View>

          {subjectModalMode === "select" ? (
            <>
              {/* Select Subjects Label */}
              <Text style={styles.addSubjectSelectLabel}>Select Subjects</Text>

              {/* Selected Subject Display */}
              {selectedSubjectForBatch && (
                <View style={styles.selectedSubjectDisplay}>
                  <View style={styles.selectedSubjectContent}>
                    <View style={styles.selectedSubjectCheckbox}>
                      <Text style={styles.selectedSubjectTick}>✓</Text>
                    </View>
                    <Text style={styles.selectedSubjectText}>
                      {unassignedSubjectOptions.find((s: { value: string; label: string }) => s.value === selectedSubjectForBatch)?.label}
                    </Text>
                  </View>
                </View>
              )}

              {/* Subject List */}
              <View style={styles.addSubjectListContainer}>
                {unassignedSubjectOptions.length > 0 ? (
                  <ScrollView 
                    style={styles.addSubjectScrollView} 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    {unassignedSubjectOptions.map((subject: { value: string; label: string }) => {
                      const isSelected = selectedSubjectForBatch === subject.value;
                      return (
                        <TouchableOpacity
                          key={subject.value}
                          style={[
                            styles.addSubjectOptionRow,
                            isSelected && styles.addSubjectOptionRowSelected,
                          ]}
                          onPress={() => setSelectedSubjectForBatch(subject.value)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.addSubjectCheckbox,
                            isSelected && styles.addSubjectCheckboxActive
                          ]}>
                            {isSelected && <Text style={styles.addSubjectCheckboxTick}>✓</Text>}
                          </View>
                          <Text style={[
                            styles.addSubjectOptionLabel,
                            isSelected && styles.addSubjectOptionLabelSelected
                          ]}>
                            {subject.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={styles.addSubjectEmptyContainer}>
                    <Text style={styles.addSubjectEmptyText}>
                      {courseDetailData?.data?.subjects?.length > 0 
                        ? "All subjects are already assigned to this batch" 
                        : "No subjects available"}
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Create New Subject */}
              <Text style={styles.addSubjectSelectLabel}>Create New Subject</Text>
              <View style={styles.addSubjectInputContainer}>
                <TextInput
                  style={styles.addSubjectTextInput}
                  placeholder="Enter subject name"
                  placeholderTextColor="#9CA3AF"
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                  autoCapitalize="words"
                  maxLength={100}
                />
              </View>
              <Text style={styles.addSubjectInputHint}>
                This subject will be added to the course and assigned to this batch
              </Text>
            </>
          )}

          {/* Footer Buttons */}
          <View style={styles.addSubjectFooter}>
            <TouchableOpacity
              style={styles.addSubjectCancel}
              onPress={() => {
                setAddSubjectModalVisible(false);
                setSelectedSubjectForBatch("");
                setSubjectModalMode("select");
                setNewSubjectName("");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.addSubjectCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addSubjectSubmit,
                (subjectModalMode === "select" 
                  ? (!selectedSubjectForBatch || updateBatchMutation.isPending)
                  : (!newSubjectName?.trim() || updateCourseMutation.isPending || updateBatchMutation.isPending)
                ) && styles.addSubjectSubmitDisabled,
              ]}
              disabled={
                subjectModalMode === "select"
                  ? !selectedSubjectForBatch || updateBatchMutation.isPending
                  : !newSubjectName?.trim() || updateCourseMutation.isPending || updateBatchMutation.isPending
              }
              onPress={
                subjectModalMode === "select"
                  ? handleAssignSubjectToBatch
                  : handleCreateAndAssignSubject
              }
              activeOpacity={0.8}
            >
              <Text style={styles.addSubjectSubmitText}>
                {(updateCourseMutation.isPending || updateBatchMutation.isPending) 
                  ? "Submitting..." 
                  : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

export default SlotFormModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",  // ✅ Center me show hoga
    alignItems: "center",
  },
  modalContentWrapper: {
    flex: 1,
    width: "85%",
    maxHeight: "50%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#000000",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#000000",
  },
  dropdownBox: {
    flex: 1,
    
    height: 45,             
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#0B4DA2",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#0B4DA2",
    fontSize: 22,
    fontWeight: "700",
  },
  repeatRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  repeatLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000", 
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9D4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    color: "#444",
    fontWeight: "600",
  },
  daySummaryBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  daySummaryText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelBtn: {
    flex: 1,
    marginRight: 10,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#111" },
  saveBtn: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  addSubjectBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addSubjectBackdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  addSubjectCard: {
    width: "100%",
    maxWidth: 450,
    maxHeight: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  addSubjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  addSubjectTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.3,
  },
  addSubjectCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addSubjectClose: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  addSubjectMetaContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addSubjectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addSubjectMetaLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
    minWidth: 60,
  },
  addSubjectMetaValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
  },
  addSubjectSelectLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  selectedSubjectDisplay: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedSubjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedSubjectCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedSubjectTick: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedSubjectText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    flex: 1,
  },
  addSubjectListContainer: {
    maxHeight: 280,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  addSubjectScrollView: {
    maxHeight: 280,
  },
  addSubjectOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  addSubjectOptionRowSelected: {
    backgroundColor: "#EEF2FF",
  },
  addSubjectCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  addSubjectCheckboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  addSubjectCheckboxTick: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  addSubjectOptionLabel: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  addSubjectOptionLabelSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  addSubjectEmptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addSubjectEmptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  createLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  createLinkIcon: {
    color: COLORS.primary,
    fontSize: 18,
    marginRight: 6,
  },
  createLinkText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  addSubjectInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  addSubjectAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#16A34A",
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  addSubjectAddText: {
    color: "#16A34A",
    fontWeight: "700",
  },
  pendingList: {
    marginTop: 16,
  },
  pendingItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  pendingRemove: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  pendingTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  pendingTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#9CA3AF",
  },
  addSubjectEmpty: {
    textAlign: "center",
    color: "#9CA3AF",
    marginVertical: 24,
  },
  addSubjectFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  addSubjectCancel: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    minWidth: 100,
    alignItems: "center",
  },
  addSubjectCancelText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  addSubjectSubmit: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    minWidth: 100,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addSubjectSubmitDisabled: {
    backgroundColor: "#CBD5F5",
    shadowOpacity: 0,
    elevation: 0,
  },
  addSubjectSubmitText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  addSubjectModeToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addSubjectModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addSubjectModeButtonActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addSubjectModeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  addSubjectModeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  addSubjectInputContainer: {
    marginBottom: 12,
  },
  addSubjectTextInput: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFF",
  },
  addSubjectInputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 16,
  },
  // Cascading dropdown styles
  dropdownContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#6B7280",
  },
  dropdownArrow: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 8,
  },
  dropdownBoxDisabled: {
    opacity: 0.5,
  },
  cascadingDropdown: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginTop: 8,
    marginBottom: 8,
    maxHeight: 250,
    overflow: "hidden",
    width: "85%",
  },
  cascadingDropdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cascadingDropdownList: {
    maxHeight: 200,
  },
  cascadingDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cascadingDropdownItemSelected: {
    backgroundColor: "rgba(107,87,242,0.05)",
  },
  cascadingDropdownItemText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  cascadingDropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  cascadingDropdownCheck: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});