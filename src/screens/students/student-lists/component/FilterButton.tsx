import { StyleSheet, View } from "react-native";
import React, { FC, memo, useState } from "react";
import Tooltip from "react-native-walkthrough-tooltip";
import Flex from "../../../../@ui/flex/Flex";
import Button from "../../../../@ui/button/Button";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../images";
import { COLORS } from "../../../../colors";
import StudentFilterSelect from "./StudentFilterSelect";
import PaymentDateRangePicker from "./PaymentDateRangePicker";

interface IFilterButton {
  filters: {
    studentStatus: string;
    paymentStatus: string;
    paymentMode: string;
    paymentDateStart: string;
    paymentDateEnd: string;
    admissionDateStart: string;
    admissionDateEnd: string;
    courseName: string;
    batchName: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      studentStatus: string;
      paymentStatus: string;
      paymentMode: string;
      paymentDateStart: string;
      paymentDateEnd: string;
      admissionDateStart: string;
      admissionDateEnd: string;
      courseName: string;
      batchName: string;
    }>
  >;
  coursesList: { label: string; value: string }[];
  batchesList: { label: string; value: string }[];
}

const FilterButton: FC<IFilterButton> = ({
  filters,
  setFilters,
  coursesList,
  batchesList,
}) => {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <Tooltip
      isVisible={showFilter}
      onClose={() => setShowFilter(false)}
      backgroundColor="#00000025"
      childContentSpacing={10}
      contentStyle={{
        elevation: 4,
        width: 200,
        borderRadius: 10,
        padding: 12,
      }}
      content={
        <View style={styles.filterContent}>
          <Flex mb={4}>
            <StudentFilterSelect
              onChange={(e) => {
                setFilters((previous) => ({ ...previous, studentStatus: e }));
              }}
              label="Student Status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inActive" },
                { label: "Defaulter", value: "defaulter" },
              ]}
            />
          </Flex>
          <Flex mb={4}>
            <StudentFilterSelect
              onChange={(e) => {
                setFilters((previous) => ({ ...previous, paymentStatus: e }));
              }}
              label="Payment Status"
              options={[
                { label: "Paid", value: "paid" },
                { label: "Due", value: "due" },
              ]}
            />
          </Flex>
          <Flex mb={4}>
            <StudentFilterSelect
              onChange={(e) => {
                setFilters((previous) => ({ ...previous, paymentMode: e }));
              }}
              label="Payment Mode"
              options={[
                { label: "Online", value: "online" },
                { label: "Cash", value: "cash" },
              ]}
            />
          </Flex>
          <Flex mb={4}>
            <PaymentDateRangePicker
              title="Payment Date Range"
              triggerLabel="Payment Date"
              onApply={(startDate, endDate) => {
                console.log('✅ Payment Date Filter Applied:', { startDate, endDate });
                setFilters((previous) => {
                  const updated = {
                    ...previous,
                    paymentDateStart: startDate || "",
                    paymentDateEnd: endDate || "",
                  };
                  console.log('📝 Updated filters:', updated);
                  return updated;
                });
              }}
              onClear={() => {
                console.log('🗑️ Payment Date Filter Cleared');
                setFilters((previous) => ({
                  ...previous,
                  paymentDateStart: "",
                  paymentDateEnd: "",
                }));
              }}
            />
          </Flex>
          <Flex mb={4}>
            <PaymentDateRangePicker
              title="Admission Date Range"
              triggerLabel="Admission Date"
              onApply={(startDate, endDate) => {
                setFilters((previous) => ({
                  ...previous,
                  admissionDateStart: startDate || "",
                  admissionDateEnd: endDate || "",
                }));
              }}
              onClear={() => {
                setFilters((previous) => ({
                  ...previous,
                  admissionDateStart: "",
                  admissionDateEnd: "",
                }));
              }}
            />
          </Flex>
          <Flex mb={4}>
            <StudentFilterSelect
              onChange={(e) => {
                setFilters((previous) => ({ ...previous, courseName: e }));
              }}
              label="Course Name"
              options={coursesList}
            />
          </Flex>
          <Flex mb={0}>
            <StudentFilterSelect
              onChange={(e) => {
                setFilters((previous) => ({ ...previous, batchName: e }));
              }}
              label="Batch Name"
              options={batchesList}
              disabled={!filters.courseName}
            />
          </Flex>
        </View>
      }
      placement="bottom"
      arrowSize={{ width: 0, height: 0 }}
    >
      <Button
        onPress={() => setShowFilter(true)}
        btnStyles={styles.buttonStyles}
        btnTxtStyles={{
          fontSize: 14,
          color: COLORS.muted,
          fontFamily: "Poppins-Medium",
        }}
        title="Filters"
        rightIcon={
          <Flex ml={10}>
            <AutoHeightImage source={IMAGES.filterIcon} width={16} />
          </Flex>
        }
      />
    </Tooltip>
  );
};

export default memo(FilterButton);

const styles = StyleSheet.create({
  buttonStyles: {
    width: 126,
    height: 40,
    marginVertical: 0,
    marginLeft: 10,
    backgroundColor: COLORS.white,
  },
  filterContent: {
    width: "100%",
  },
});
