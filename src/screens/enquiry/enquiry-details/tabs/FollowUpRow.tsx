import { StyleSheet } from "react-native";
import React, { FC, memo } from "react";
import { Col, Row } from "react-native-easy-grid";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import moment from "moment";
import PopoverText from "../../../../@ui/popover-text/PopoverText";

interface IFollowUpRow {
  query: TFollowUp;
  handleCheckBoxClick: (followUpId: string, isChecked: boolean) => void;
  selected: boolean;
}

const FollowUpRow: FC<IFollowUpRow> = ({
  query,
  handleCheckBoxClick,
  selected,
}) => {
  console.log("[FollowUpRow] Rendering follow-up:", query);
  console.log("[FollowUpRow] createDate:", query?.createDate);
  console.log("[FollowUpRow] followUpDate:", query?.followUpDate);
  console.log("[FollowUpRow] flag:", query?.flag);
  console.log("[FollowUpRow] message:", query?.message);
  
  // Format dates - handle multiple formats
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Try DD/MM/YYYY format first
    const parsed = moment(dateString, "DD/MM/YYYY", true);
    if (parsed.isValid()) {
      return parsed.format("DD-MM-YY");
    }
    // Try DD-MM-YYYY format
    const parsed2 = moment(dateString, "DD-MM-YYYY", true);
    if (parsed2.isValid()) {
      return parsed2.format("DD-MM-YY");
    }
    // Return as is if can't parse
    return dateString;
  };

  return (
    <Row style={styles.dataRow}>
      <Col style={styles.formColumn}>
        <ScalableText style={styles.dataText} fontFamily="Regular">
          {formatDate(query?.createDate || "")}
        </ScalableText>
      </Col>
      <Col style={styles.formColumn}>
        <ScalableText style={styles.dataText} fontFamily="Regular">
          {formatDate(query?.followUpDate || "")}
        </ScalableText>
      </Col>
      <Col style={styles.formColumn}>
        <ScalableText style={styles.dataText} fontFamily="Regular">
          {query.flag || "-"}
        </ScalableText>
      </Col>
      <Col style={styles.formColumn}>
        <PopoverText text={query.message ?? ""} width={150} />
      </Col>
      <Col style={styles.formColumn}>
        {/* Empty Actions column for existing follow-ups */}
      </Col>
    </Row>
  );
};

export default memo(FollowUpRow);

const styles = StyleSheet.create({
  formColumn: {
    width: 95,
    justifyContent: "center",
    alignItems: "center",
    // padding: 10,
    flex: 1,
  },
  headerRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 0.8,
    height: 65,
  },
  dataRow: {
    borderBottomColor: "#D1D1D1",
    borderBottomWidth: 0.8,
    height: 55,
  },
  headerTitle: {
    fontSize: 14,
  },
  dataText: {
    fontSize: 12,
    textAlign: "center",
  },
  readMore: {
    fontSize: 11,
    color: "#1E86FF",
    marginTop: 0,
    textDecorationLine: "underline",
  },
});
