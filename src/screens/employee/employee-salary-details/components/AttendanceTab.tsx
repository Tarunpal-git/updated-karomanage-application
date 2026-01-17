import React, { useMemo, useState } from "react";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../images";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import dayjs from "dayjs";
import { COLORS } from "../../../../colors";
import { useSingleEmployeeMonthlyAttendanceQuery } from "../../../../apis/hooks/employee/query/useSingleEmployeeMonthlyAttendance.query";
 
const Heights = {
  cardHeight: Dimensions.get("window").height * 0.62,
};
 
type AttendanceEntry = {
  status: "present" | "absent" | "half";
  interval?: string;
};
 
const AttendanceTab = ({ employeeId }) => {
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today);
 
  const month = currentMonth.format("MM");
  const year = currentMonth.format("YYYY");
 
  // 🔹 API CALL
  const { data, isLoading } =
    useSingleEmployeeMonthlyAttendanceQuery({
      employeeId,
      month,
      year,
    });
 
  // ===============================
  // 🔹 API → MAP (day → status + interval)
  // ===============================
  const attendanceMap: Record<number, AttendanceEntry> = useMemo(() => {
    const map: Record<number, AttendanceEntry> = {};
 
    data?.data?.attendanceThisMonth?.forEach((item) => {
      const day = Number(item.attendanceDate.slice(6, 8));
 
      if (item.availablityStatus?.status === "HalfDay") {
        map[day] = {
          status: "half",
          interval: item.availablityStatus.interval, // "1" | "2"
        };
      } else if (item.attendanceStatus === "present") {
        map[day] = { status: "present" };
      } else {
        map[day] = { status: "absent" };
      }
    });
 
    return map;
  }, [data]);
 
  // ===============================
  // 🔹 SUMMARY COUNTS
  // ===============================
  const presentCount = Object.values(attendanceMap).filter(
    (v) => v.status === "present"
  ).length;
 
  const absentCount = Object.values(attendanceMap).filter(
    (v) => v.status === "absent"
  ).length;
 
  const halfCount = Object.values(attendanceMap).filter(
    (v) => v.status === "half"
  ).length;
 
  // ===============================
  // 🔹 CALENDAR BUILD
  // ===============================
  const isCurrentMonth = currentMonth.isSame(today, "month");
  const startDay = currentMonth.startOf("month").day();
  const totalDays = currentMonth.daysInMonth();
 
  let calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarCells.push(null);
 
  for (let d = 1; d <= totalDays; d++) {
    if (isCurrentMonth && d > today.date()) break;
    calendarCells.push(d);
  }
 
  if (isLoading) {
    return (
      <View style={{ marginTop: 15 }}>
        <View style={styles.card}>
          <Text>Loading attendance...</Text>
        </View>
      </View>
    );
  }
 
  return (
    <View style={{ marginTop: 15 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Attendance</Text>
 
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {/* ===== SUMMARY BLOCK ===== */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryMonth}>
              {currentMonth.format("MMMM")}
            </Text>
 
            <View style={[styles.tag, { backgroundColor: "#d7ffd9" }]}>
              <Text style={styles.tagText}>PRESENT : {presentCount}</Text>
            </View>
 
            <View style={[styles.tag, { backgroundColor: "#ffd7d7" }]}>
              <Text style={styles.tagText}>ABSENT : {absentCount}</Text>
            </View>
 
            <View style={[styles.tag, { backgroundColor: "#ffe6b0" }]}>
              <Text style={styles.tagText}>HALF DAY : {halfCount}</Text>
            </View>
          </View>
 
          {/* ===== MONTH HEADER ===== */}
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(currentMonth.subtract(1, "month"))
              }
              style={styles.arrow}
            >
            <AutoHeightImage width={16} source={IMAGES.chevronArrowLeftIcon} />
            </TouchableOpacity>
 
            <Text style={styles.monthTitle}>
              {currentMonth.format("MMMM YYYY")}
            </Text>
 
            <TouchableOpacity
              disabled={isCurrentMonth}
              onPress={() =>
                setCurrentMonth(currentMonth.add(1, "month"))
              }
              style={[
                styles.arrow,
                isCurrentMonth && {  },
              ]}
            >
              <AutoHeightImage width={16} source={IMAGES.chevronArrowRightIcon} />
            </TouchableOpacity>
          </View>
 
          {/* ===== WEEK DAYS ===== */}
          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <Text key={d} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>
 
          {/* ===== CALENDAR ===== */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((day, index) => {
              if (!day) return <View key={index} style={styles.dayCell} />;
 
              const attendance = attendanceMap[day];
 
              const bg =
                attendance?.status === "present"
                  ? "#7CDE3B"
                  : attendance?.status === "absent"
                  ? "#FFD5D5"
                  : attendance?.status === "half"
                  ? "#FFC107"
                  : "transparent";
 
              const label =
                attendance?.status === "present"
                  ? "Present"
                  : attendance?.status === "absent"
                  ? "Absent"
                  : attendance?.status === "half"
                  ? `Half Day ${attendance.interval ?? ""}`
                  : "";
 
              return (
                <View
                  key={index}
                  style={[styles.dayCell, { backgroundColor: bg }]}
                >
                  <Text style={styles.dayText}>{day}</Text>
                  {label !== "" && (
                    <Text style={styles.dayStatus}>{label}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
 
export default AttendanceTab;
 
/* ================= STYLES ================= */
 
const styles = StyleSheet.create({
  card: {
    width: "108%",
    height: Heights.cardHeight,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 6,
    paddingTop: 18,
    paddingHorizontal: 25,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    alignSelf: "center",
  },
 
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000000"   // Pure Black
,
  },
 
  summaryCard: {
    backgroundColor: "#fff",
    width: 140,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 4,
     
  },
 
  summaryMonth: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
 
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
 
  tagText: {
    fontSize: 12,
    fontWeight: "bold",
  },
 
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
   
  },
 
  arrow: {
    // backgroundColor: "#243447",
    padding: 6,
    borderRadius: 8,
  },
 
  arrowText: {
    color: "#fff",
    fontSize: 16,
  },
 
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
 
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
 
  weekDay: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#6D7A90",
  },
 
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
 
  dayCell: {
    width: "14.28%",
    paddingVertical: 8,
    alignItems: "center",
  },
 
  dayText: {
    color: "#111",
    fontWeight: "600",
  },
 
  dayStatus: {
    fontSize: 8,
    marginTop: 2,
    fontWeight: "700",
    color: "#111",
  },
});
 
 