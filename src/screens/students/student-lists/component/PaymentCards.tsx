import { StyleSheet, ViewStyle } from "react-native";
import React, { FC, memo } from "react";
import Flex from "../../../../@ui/flex/Flex";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import AutoHeightImage from "../../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../../images";
import AnimatedCounter from "../../../../@ui/animated-views/AnimatedCounter";
import { COLORS } from "../../../../colors";

interface IPaymentCards {
  title: string;
  amount: number;
  textVariant: "success" | "error" | "primary" | "warning";
  containerStyles?: ViewStyle;
  showRupeeIcon?: boolean;
  isNumber?: boolean; // For cards that show count instead of amount
}

const PaymentCards: FC<IPaymentCards> = ({
  amount,
  textVariant,
  title,
  containerStyles,
  showRupeeIcon = true,
  isNumber = false,
}) => {
  const getTextColor = () => {
    switch (textVariant) {
      case "error":
        return COLORS.textError;
      case "success":
        return COLORS.textSuccess;
      case "primary":
        return COLORS.primary;
      case "warning":
        return "#FF9800"; // Orange color
      default:
        return COLORS.textSuccess;
    }
  };

  const getBorderColor = () => {
    return "#F0F0F0"; // Same border color for all cards
  };

  const getRupeeIcon = () => {
    if (!showRupeeIcon) return null;
    
    switch (textVariant) {
      case "error":
        return IMAGES.rupeeRedIcon;
      case "success":
        return IMAGES.rupeeGreenIcon;
      case "primary":
        return IMAGES.rupeePrimaryIcon || IMAGES.rupee || IMAGES.rupeeGreenIcon;
      case "warning":
        return IMAGES.rupeeRedIcon;
      default:
        return IMAGES.rupeeGreenIcon;
    }
  };

  return (
    <Flex styles={{ 
      ...styles.cardRoot, 
      borderColor: getBorderColor(),
      ...containerStyles 
    }}>
      <ScalableText style={styles.cardTitle} fontFamily="Medium">
        {title}
      </ScalableText>
      <Flex styles={styles.contentContainer}>
        {showRupeeIcon && !isNumber && (
          <Flex mr={5} styles={styles.rupeeIconContainer}>
            <AutoHeightImage
              source={getRupeeIcon()}
              width={10}
            />
          </Flex>
        )}
        <AnimatedCounter
          textStyles={{
            ...styles.amountText,
            color: getTextColor(),
            lineHeight: 24,
          }}
          endValue={amount}
          duration={1000}
        />
      </Flex>
    </Flex>
  );
};

export default memo(PaymentCards);

const styles = StyleSheet.create({
  amountText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    lineHeight: 24,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  cardTitle: {
    fontSize: 12,
    marginTop: 0,
    marginBottom: 8,
    color: "#666666",
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  cardRoot: {
    backgroundColor: COLORS.white,
    flexDirection: "column",
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  rupeeIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
