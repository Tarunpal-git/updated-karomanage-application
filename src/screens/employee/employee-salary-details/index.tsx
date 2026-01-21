import React, { useState } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  TScreenNavigator,
  TScreenNavigatorParams,
} from "../../../types/navigator/screen-navigator";

import Flex from "../../../@ui/flex/Flex";
import Tabs from "../../../@ui/tabs/Tabs";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import { ScrollView, View } from "react-native";

// 👉 ADD THESE IMPORTS
import ActionIcon from "../../../@ui/action-icon/ActionIcon";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../images";

// TAB COMPONENTS
import AttendanceTab from "./components/AttendanceTab";
import ExpensePaidTab from "./components/ExpensePaidTab";
import SalaryRecordTab from "./components/SalaryRecordTab";
import EducationDetailTab from "./components/EducationDetailTab";
import BankDetailTab from "./components/BankDetailTab";
import DocumentTab from "./components/DocumentTab";
import SalaryUpdateTab from "./components/SalaryUpdateTab";

const EmployeeSalaryDetails = () => {
  const navigation = useNavigation<TScreenNavigator>();

  const {
    params: { employeeId },
  } = useRoute<RouteProp<TScreenNavigatorParams, "EmployeeSalaryDetails">>();

  const [tab, setTab] = useState("Attendance");

  return (
    <SafeView>
      {/* 🔥 HEADER WITH PROFILE ICON */}
      <AppHeader
        title="Employee Details"
        handleBackClick={() => navigation.goBack()}
        showDrawer={false}
        leftSection={
          <ActionIcon
            onPress={() =>
              navigation.navigate("EmployeeDetails", { employeeId })
            }
          >
            <AutoHeightImage
              source={IMAGES.profilePrimaryIcon}
              width={30}
            />
          </ActionIcon>
        }
      />

      {/* SCROLLABLE TABS */}
      <Flex my={20} mx={30}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row" }}>
            {[
              { label: "Attendance", value: "Attendance" },
              { label: "Expense Paid", value: "Expense Paid" },
              { label: "Salary Record", value: "Salary Record" },
              { label: "Education Detail", value: "Education Detail" },
              { label: "Bank Detail", value: "Bank Detail" },
              { label: "Documents", value: "Documents" },
              { label: "Salary Update", value: "Salary Update" },
            ].map((item, index) => (
              <View key={index} style={{ marginRight: 25 }}>
                <Tabs
                  onChange={setTab}
                  value={tab}
                  tabs={[item]}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </Flex>

      {/* TAB CONTENT */}
      <ThemeScrollView 
  paddingHorizontal={15}
  refreshControl={undefined}  
>
        {tab === "Attendance" && <AttendanceTab employeeId={employeeId} />}
        {tab === "Expense Paid" && <ExpensePaidTab employeeId={employeeId} />}
        {tab === "Salary Record" && <SalaryRecordTab employeeId={employeeId} />}
        {tab === "Education Detail" && (
          <EducationDetailTab employeeId={employeeId} />
        )}
        {tab === "Bank Detail" && <BankDetailTab employeeId={employeeId} />}
        {tab === "Documents" && <DocumentTab employeeId={employeeId} />}
        {tab === "Salary Update" && (
          <SalaryUpdateTab employeeId={employeeId} />
        )}
      </ThemeScrollView>
    </SafeView>
  );
};

export default EmployeeSalaryDetails;

