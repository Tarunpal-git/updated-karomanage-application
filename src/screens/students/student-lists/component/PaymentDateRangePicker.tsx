import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC, memo, useState } from "react";
import Tooltip from "react-native-walkthrough-tooltip";
import Flex from "../../../../@ui/flex/Flex";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../../colors";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../images";
import DatePicker from "react-native-date-picker";
import moment from "moment";

interface IPaymentDateRangePicker {
  onApply: (startDate: string | null, endDate: string | null) => void;
  onClear: () => void;
  title?: string;
  triggerLabel?: string;
}

const PaymentDateRangePicker: FC<IPaymentDateRangePicker> = ({
  onApply,
  onClear,
  title = "Payment Date Range",
  triggerLabel = "Payment Date",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleApply = () => {
    const startDateStr = fromDate ? moment(fromDate).format("DD-MM-YYYY") : null;
    const endDateStr = toDate ? moment(toDate).format("DD-MM-YYYY") : null;
    console.log('📅 Payment Date Range Apply:', { startDateStr, endDateStr, fromDate, toDate });
    onApply(startDateStr, endDateStr);
    setShowPicker(false);
  };

  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    onClear();
    setShowPicker(false);
  };

  return (
    <>
      <Tooltip
        isVisible={showPicker}
        onClose={() => setShowPicker(false)}
        backgroundColor="#00000025"
        contentStyle={{
          elevation: 4,
          width: 200,
          borderRadius: 10,
          padding: 12,
          backgroundColor: COLORS.white,
          marginTop:-21
        }}
        content={
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <ScalableText style={styles.modalTitle} fontFamily="SemiBold">
              {title}
            </ScalableText>

            {/* From Date */}
            <View style={styles.dateFieldContainer}>
              <ScalableText style={styles.dateLabel} fontFamily="Medium">
                From
              </ScalableText>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromPicker(true)}
              >
                <ScalableText
                  style={[
                    styles.dateInputText,
                    !fromDate && styles.placeholderText,
                  ]}
                  fontFamily="Regular"
                >
                  {fromDate
                    ? moment(fromDate).format("DD-MM-YYYY")
                    : "dd-mm-yyyy"}
                </ScalableText>
                <AutoHeightImage
                  source={IMAGES.calendarIconOutline}
                  width={16}
                />
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View style={styles.dateFieldContainer}>
              <ScalableText style={styles.dateLabel} fontFamily="Medium">
                To
              </ScalableText>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToPicker(true)}
              >
                <ScalableText
                  style={[
                    styles.dateInputText,
                    !toDate && styles.placeholderText,
                  ]}
                  fontFamily="Regular"
                >
                  {toDate ? moment(toDate).format("DD-MM-YYYY") : "dd-mm-yyyy"}
                </ScalableText>
                <AutoHeightImage
                  source={IMAGES.calendarIconOutline}
                  width={16}
                />
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <Flex
              flexDirection="row"
              justifyContent="space-between"
              mt={15}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                activeOpacity={0.7}
              >
                <ScalableText style={styles.clearButtonText} fontFamily="Medium">
                  CLEAR
                </ScalableText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                activeOpacity={0.7}
              >
                <ScalableText style={styles.applyButtonText} fontFamily="Medium">
                  APPLY
                </ScalableText>
              </TouchableOpacity>
            </Flex>
          </View>
        }
        placement="bottom"
        arrowSize={{ width: 0, height: 0 }}
      >
        <View style={styles.triggerButton}>
          <TouchableOpacity
            style={styles.triggerButtonInner}
            onPress={() => setShowPicker(true)}
          >
            <ScalableText style={styles.triggerText} fontFamily="Medium">
              {triggerLabel}
            </ScalableText>
            <AutoHeightImage
              source={IMAGES.dropdownArrowDownIcon}
              width={10}
            />
          </TouchableOpacity>
        </View>
      </Tooltip>

      {/* From Date Picker */}
      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setFromDate(date);
          setShowFromPicker(false);
        }}
        onCancel={() => {
          setShowFromPicker(false);
        }}
      />

      {/* To Date Picker */}
      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        minimumDate={fromDate || undefined}
        onConfirm={(date) => {
          setToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => {
          setShowToPicker(false);
        }}
      />
    </>
  );
};

export default memo(PaymentDateRangePicker);

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  dateFieldContainer: {
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 6,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  dateInputText: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    marginRight: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    marginLeft: 6,
  },
  applyButtonText: {
    fontSize: 12,
    color: COLORS.white,
  },
  triggerButton: {
    width: "100%",
  },
  triggerButtonInner: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    minHeight: 40,
    flex: 0,
  },
  triggerText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.primary,
    marginTop: 0,
    marginRight: 5,
    textAlign: "center",
  },
});
