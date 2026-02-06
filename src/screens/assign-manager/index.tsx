import React, { useState } from "react";
import SafeView from "../../@ui/safe-view/SafeView";
import AppHeader from "../../@ui/app-header/AppHeader";
import Tabs from "../../@ui/tabs/Tabs";
import Flex from "../../@ui/flex/Flex";
import IndividualAssignmentTab from "./tabs/IndividualAssignmentTab.tsx";
import GroupAssignmentTab from "./tabs/GroupAssignmentTab";

const AssignManager = () => {
  const [activeTab, setActiveTab] = useState("individual");

  const tabs = [
    { label: "Individual\nAssignment", value: "individual" },
    { label: "Group\nAssignment", value: "group" },
  ];

  return (
    <SafeView>
      <AppHeader showDrawer={false} title="Assign Manager" />
      <Flex my={20}>
        <Tabs onChange={(e) => setActiveTab(e)} tabs={tabs} value={activeTab} />
      </Flex>

      {activeTab === "individual" && <IndividualAssignmentTab />}
      {activeTab === "group" && <GroupAssignmentTab />}
    </SafeView>
  );
};

export default AssignManager;
