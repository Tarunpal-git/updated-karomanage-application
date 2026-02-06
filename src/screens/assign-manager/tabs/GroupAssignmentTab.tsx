import React, { FC, memo } from "react";
import { StyleSheet, View } from "react-native";

const GroupAssignmentTab: FC = () => {
  return <View style={styles.tabRoot} />;
};

export default memo(GroupAssignmentTab);

const styles = StyleSheet.create({
  tabRoot: {
    flex: 1,
    marginTop: 20,
  },
});
