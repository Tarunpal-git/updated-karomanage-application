import { StyleSheet } from "react-native";
import React, { FC, memo } from "react";
import { Col, Row } from "react-native-easy-grid";
import ScalableText from "../../../../@ui/scalable-text/ScalableText";
import Flex from "../../../../@ui/flex/Flex";
import moment from "moment";

interface IBatchDetailRow {
  batch: any; // Batch data from listBatches API
}

const BatchDetailRow: FC<IBatchDetailRow> = ({ batch }) => {
  if (!batch) {
    return null;
  }

  // Format interval
  const formatDate = (date: string) => {
    if (!date) return "-";
    try {
      // Try different date formats
      const parsed = moment(date, ["DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "DD/mm/yyyy"]);
      if (parsed.isValid()) {
        return parsed.format("DD/MM/YYYY");
      }
      return date;
    } catch {
      return date || "-";
    }
  };

  const interval = batch.batchStartDate && batch.batchEndDate
    ? `${formatDate(batch.batchStartDate)} - ${formatDate(batch.batchEndDate)}`
    : "-";

  const classTime = batch.batchClassStartTime && batch.batchClassEndTime
    ? `${batch.batchClassStartTime} - ${batch.batchClassEndTime}`
    : "-";

  return (
    <Row style={styles.dataRow}>
      <Col size={25}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {batch?.batchName || "-"}
        </ScalableText>
      </Col>
      <Col size={30}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {interval}
        </ScalableText>
      </Col>
      <Col size={25}>
        <ScalableText fontFamily="Regular" style={styles.dataText}>
          {classTime}
        </ScalableText>
      </Col>
      <Col size={20}>
        <Flex
          styles={{
            ...styles.statusChip,
            backgroundColor:
              batch?.batchStatus === "active" ? "#ECFFE0" : "#FFE3E3",
          }}
        >
          <ScalableText
            style={{
              ...styles.statusChipText,
              color: batch?.batchStatus === "active" ? "#4AC400" : "#FF6363",
            }}
            fontFamily="Medium"
          >
            {batch?.batchStatus || "-"}
          </ScalableText>
        </Flex>
      </Col>
    </Row>
  );
};

export default memo(BatchDetailRow);

const styles = StyleSheet.create({
  statusChip: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusChipText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  dataRow: {
    borderBottomWidth: 1,
    borderColor: "#D1D1D1",
    paddingVertical: 20,
  },
  dataText: {
    color: "#1B1A1A",
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
  },
});
