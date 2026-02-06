import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { FC, memo, useState } from "react";
import ScalableText from "../scalable-text/ScalableText";
import { COLORS } from "../../colors";
import { Controller, UseFormReturn } from "react-hook-form";
import DatePicker from "react-native-date-picker";
import moment from "moment";

interface IDateInput {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: UseFormReturn<any>;
  inputRoot?: ViewStyle;
  errorStyle?: TextStyle;
  inputTextStyles?: TextStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  showError?: boolean;
}

const DateInput: FC<IDateInput> = ({
  label,
  inputRoot,
  name,
  handler,
  errorStyle,
  inputTextStyles,
  minimumDate,
  maximumDate,
  showError = true,
}) => {
  const [picker, setPicker] = useState(false);
  return (
    <Controller
      control={handler.control}
      name={name}
      render={({ field: { onChange, value }, fieldState }) => {
        console.log('🎫 DateInput render - fieldState.error:', fieldState.error);
        console.log('🎫 DateInput render - fieldState.error.message:', fieldState.error?.message);
        return (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setPicker(true)}
              style={{ ...styles.inputRoot, ...inputRoot }}
            >
              <ScalableText
                fontFamily="Regular"
                style={{ ...styles.textInput, ...inputTextStyles }}
              >
                {(() => {
                  if (!value || value === null || value === '') return label;
                  try {
                    // If value is already a Date object
                    if (value instanceof Date) {
                      return isNaN(value.getTime()) ? label : moment(value).format("DD-MM-YY");
                    }
                    // If value is a string, try to parse it
                    if (typeof value === 'string') {
                      const parsed = moment(value, ['DD-MM-YYYY', 'DD-MM-YY', 'DD/MM/YYYY', 'DD/MM/YY', 'YYYY-MM-DD', moment.ISO_8601], true);
                      if (parsed.isValid()) {
                        return parsed.format("DD-MM-YY");
                      }
                    }
                    // Try standard Date parsing
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? label : moment(date).format("DD-MM-YY");
                  } catch (e) {
                    return label;
                  }
                })()}
              </ScalableText>
            </TouchableOpacity>
            {fieldState.error && showError && (
              <ScalableText
                fontFamily="Regular"
                style={{
                  color: COLORS.error,
                  fontSize: 12,
                  marginTop: 4,
                  ...errorStyle,
                }}
              >
                {fieldState.error.message}
              </ScalableText>
            )}
            <DatePicker
              {...(minimumDate ? { minimumDate } : {})}
              {...(maximumDate ? { maximumDate } : {})}
              mode="date"
              modal
              open={picker}
              date={(() => {
                if (value && value !== null && value !== '') {
                  try {
                    // If value is already a Date object
                    if (value instanceof Date) {
                      return isNaN(value.getTime()) ? (maximumDate || new Date()) : value;
                    }
                    // If value is a string, try to parse it
                    if (typeof value === 'string') {
                      const parsed = moment(value, ['DD-MM-YYYY', 'DD-MM-YY', 'DD/MM/YYYY', 'DD/MM/YY', 'YYYY-MM-DD', moment.ISO_8601], true);
                      if (parsed.isValid()) {
                        return parsed.toDate();
                      }
                    }
                    // Try standard Date parsing
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? (maximumDate || new Date()) : date;
                  } catch (e) {
                    return maximumDate || new Date();
                  }
                }
                return maximumDate || new Date();
              })()}
              onConfirm={(date) => {
                setPicker(false);
                onChange(date);
              }}
              onCancel={() => {
                setPicker(false);
              }}
              title={"Select date"}
            />
          </View>
        );
      }}
    />
  );
};

export default memo(DateInput);

const styles = StyleSheet.create({
  inputRoot: {
    color: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    elevation: 4,
    height: 40,
    justifyContent: "center",
    width: "100%",
  },
  textInput: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.black,
    marginTop: 0,
  },
});
