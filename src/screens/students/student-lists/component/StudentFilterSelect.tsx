import { StyleSheet, View } from "react-native";
import React, { FC, memo } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { IMAGES } from "../../../../images";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../../colors";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";

interface IStudentFilterSelect {
  label: string;
  onChange: (e: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

const StudentFilterSelect: FC<IStudentFilterSelect> = ({
  label,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <SelectDropdown
      data={disabled ? [{ value: "", label: "Select course first" }] : [{ value: "", label: "All" }, ...options]}
      onSelect={(selectedItem) => {
        if (!disabled) {
          onChange(selectedItem.value);
        }
      }}
      disabled={disabled}
      renderButton={(selectedItem) => {
        return (
          <View style={{ 
            ...styles.dropdownButtonStyle,
            opacity: disabled ? 0.5 : 1,
          }}>
            <ScalableText
              fontFamily="Medium"
              style={[
                styles.dropdownButtonTxtStyle,
                disabled && styles.disabledText,
              ]}
              numberOfLines={3}
            >
              {selectedItem && selectedItem.value === ""
                ? label
                : selectedItem?.label ?? label}{" "}
            </ScalableText>
            <AutoHeightImage source={IMAGES.dropdownArrowDownIcon} width={10} />
          </View>
        );
      }}
      renderItem={(item) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
            }}
          >
            <ScalableText
              fontFamily="Regular"
              style={styles.dropdownItemTxtStyle}
            >
              {item.label}
            </ScalableText>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={styles.dropdownMenuStyle}
      dropdownOverlayColor="transparent"
    />
  );
};

export default memo(StudentFilterSelect);

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    color: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: 0,
    flex: 0,
    minHeight: 40,
  },
  dropdownButtonTxtStyle: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.primary,
    marginTop: 0,
    marginRight: 5,
    textAlign: "center",
  },

  dropdownMenuStyle: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 10,
    minWidth: 100,
    marginTop: -19,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dropdownItemTxtStyle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: COLORS.muted,
    marginTop: 0,
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});
