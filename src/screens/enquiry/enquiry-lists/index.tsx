import React, { useEffect, useMemo, useState } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { TScreenNavigator } from "../../../types/navigator/screen-navigator";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SearchBar from "../../../@ui/search-bar/SearchBar";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import Flex from "../../../@ui/flex/Flex";
import Button from "../../../@ui/button/Button";
import { StyleSheet } from "react-native";
import { COLORS } from "../../../colors";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../images";
import GridTable from "../../../@ui/table/GridTable";
import { useEnquiryListsQuery } from "../../../apis/hooks/enquiry/query/useEnquiryLists.query";
import { columns } from "./components/columns";
import { TTableColumns } from "../../../types/table/tableColomuns";
import FilterButton from "./components/FilterButton";
import ActionPopover from "./components/ActionPopover";

const EnquiryLists = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const { data, isLoading, refetch } = useEnquiryListsQuery();
  const isFocused = useIsFocused();
  const tableColumns = [...columns];

  tableColumns.unshift({
    key: "action",
    field: "action",
    label: "Action",
    minWidth: 80,
    renderCell: (row) => <ActionPopover refetch={refetch} row={row} />,
    dataCellStyle: { alignItems: "center" },
  });

  const enquiries: TEnquiryData[] = useMemo(() => {
    if (isLoading || !data?.data) {
      return [];
    }

    // Filter out deleted leads (always exclude delete status)
    const activeLeads = data.data.filter(
      (lead: any) => lead.status !== "delete"
    );

    const mapped: TEnquiryData[] = activeLeads.map((lead: any) => ({
      id: lead.id,
      leadId: lead.leadId || lead.id, // Use leadId from API, fallback to id
      studentName: lead.leadName || "",
      enquiryCourse: lead.enquiryCourse || "",
      mobileNumber: lead.leadMobileNumber || "",
      email: lead.leadEmail || "",
      // Show same status text as API response
      status: lead.status || "",
      visited: lead.visited ?? false,
      followUp: [],
      leadManager: {
        managerName: lead.assigneLeadManagers?.managerName || "",
      },
    }));

    // Apply search filter
    const search = filters.search?.toLowerCase() ?? "";
    let result = mapped.filter((item) => {
      if (!search) return true;
      return (
        item.studentName.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.mobileNumber.includes(search)
      );
    });

    // Apply status filter on client side based on API fields
    const statusFilter = filters.status;
    if (statusFilter) {
      result = result.filter((item: any, index) => {
        const original = activeLeads[index];
        const lastFollowUpStatus =
          original?.lastFollowUpStatus &&
          String(original.lastFollowUpStatus).toLowerCase();
        const status = String(original?.status || "").toLowerCase();

        switch (statusFilter) {
          case "active":
            return status === "active";
          case "inActive":
            return status === "inactive" || status === "inactive ";
          case "new":
            return original?.visited === false;
          case "pending":
            return lastFollowUpStatus === "pending";
          case "Interested":
            return lastFollowUpStatus === "interested";
          case "Not Interested":
            return lastFollowUpStatus === "not interested";
          case "Call Not Picked":
            return lastFollowUpStatus === "call not picked";
          case "Success Leads":
            return status === "student";
          default:
            return true;
        }
      });
    }

    return result;
  }, [isLoading, data, filters]);
  console.log("Enquiry Lists Data:", enquiries);
  useEffect(() => {
    console.log("Enquiry Lists Data:", enquiries);
  }, [enquiries]);


  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <SafeView>
      <AppHeader
        title="Enquiry List"
        handleBackClick={() => navigation.goBack()}
      />
      <ThemeScrollView paddingHorizontal={12} reloadData={refetch}>
        <Flex my={10}>
          <SearchBar
            value={filters.search}
            onChange={(e) => setFilters((state) => ({ ...state, search: e }))}
          />
          <FilterButton filter={filters} updateFilter={setFilters} />
        </Flex>
        <Flex mb={10}>
          <Button
            onPress={() => navigation.push("GenerateEnquiry")}
            btnStyles={{ ...styles.actionBtn, backgroundColor: COLORS.white }}
            title="Create Enquiry"
            rightIcon={
              <Flex mx={7}>
                <AutoHeightImage source={IMAGES.createIcon} width={14} />
              </Flex>
            }
            btnTxtStyles={{ ...styles.btnText, color: COLORS.primary }}
          />
          <Button
            onPress={() => navigation.push("AssignManager", { leads: [] })}
            btnStyles={styles.actionBtn}
            title="Assign"
            leftIcon={
              <Flex mx={13}>
                <AutoHeightImage source={IMAGES.assignIcon} width={17} />
              </Flex>
            }
            btnTxtStyles={{ ...styles.btnText, marginRight: 5 }}
          />
        </Flex>

        <Flex styles={{ marginBottom: 20, marginHorizontal: -9 }}>
          <GridTable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handleRowClick={(e: any) =>
              navigation.navigate("EnquiryDetails", { 
                id: e.id,
                leadId: e.leadId || e.id // Pass leadId if available, otherwise use id
              })
            }
            data={enquiries}
            columns={tableColumns as TTableColumns<unknown>[]}
            isLoading={isLoading}
          />
        </Flex>
      </ThemeScrollView>
    </SafeView>
  );
};

export default EnquiryLists;

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    height: 41,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.5,
    elevation: 4,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  btnText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
});