
// import React, { FC, memo, useState, useMemo, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { useGetAllFilteredLeadsManagerWiseQuery } from "../../../apis/hooks/lead-management/query/useGetAllFilteredLeadsManagerWise.query";

// const LEADS = [
//   { id: "1", name: "Ghanshu Yadav", assigned: "harish" },
//   { id: "2", name: "jignaya gupta", assigned: null },
//   { id: "3", name: "tarun pal", assigned: null },
//   { id: "4", name: "tarun patel", assigned: "harish" },
//   { id: "5", name: "hemant jha", assigned: null },
// ];

// interface Manager {
//   employeeId: string;
//   userName: string;
//   lastName?: string;
//   designation: string;
//   userStatus: string;
// }

// const IndividualAssignmentTab: FC = () => {
//   const [selectedManager, setSelectedManager] = useState<string | null>(null);
//   const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   // API call to get managers
//   const { data, isLoading, isError, isSuccess, error } = useGetAllFilteredLeadsManagerWiseQuery();

//   // Debug logs
//   useEffect(() => {
//     console.log("=== API DEBUG ===");
//     console.log("isLoading:", isLoading);
//     console.log("isSuccess:", isSuccess);
//     console.log("isError:", isError);
//     console.log("error:", error);
//     console.log("data:", data);
//     console.log("data?.data:", data?.data);
//     console.log("================");
//   }, [isLoading, isSuccess, isError, data, error]);

//   // Extract managers from API response
//   const managers = useMemo(() => {
//     console.log("useMemo running - data:", data);
    
//     if (!data?.data || !Array.isArray(data.data)) {
//       console.log("No managers data available");
//       return [];
//     }
    
//     const mappedManagers = data.data.map((manager: Manager) => ({
//       id: manager.employeeId,
//       name: manager.lastName 
//         ? `${manager.userName} ${manager.lastName}` 
//         : manager.userName,
//       userName: manager.userName,
//     }));
    
//     console.log("Mapped managers:", mappedManagers);
//     return mappedManagers;
//   }, [data]);

//   useEffect(() => {
//     console.log("Managers list updated:", managers);
//   }, [managers]);

//   const toggleLead = (id: string) => {
//     setSelectedLeads((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const selectAll = () => {
//     if (selectedLeads.length === LEADS.length) {
//       setSelectedLeads([]);
//     } else {
//       setSelectedLeads(LEADS.map((l) => l.id));
//     }
//   };

//   const onCancel = () => {
//     setSelectedManager(null);
//     setSelectedLeads([]);
//   };

//   const onAssign = () => {
//     alert(
//       `Manager: ${selectedManager}\nLeads: ${selectedLeads.join(", ")}`
//     );
//   };

//   const renderFooter = () => (
//     <View style={styles.bottomRow}>
//       <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
//         <Text style={styles.cancelText}>CANCEL</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[
//           styles.assignBtn,
//           !(selectedManager && selectedLeads.length) &&
//             styles.disabledBtn,
//         ]}
//         disabled={!(selectedManager && selectedLeads.length)}
//         onPress={onAssign}
//       >
//         <Text
//           style={[
//             styles.assignText,
//             selectedManager && selectedLeads.length && { color: "#fff" },
//           ]}
//         >
//           ASSIGN TO MANAGER
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.tabRoot}>
//       {/* Select Manager */}
//       <Text style={styles.label}>Select Manager</Text>
//       <TouchableOpacity
//         style={styles.dropdownBox}
//         onPress={() => {
//           console.log("Dropdown clicked");
//           setShowDropdown(true);
//         }}
//       >
//         <Text
//           style={
//             selectedManager
//               ? styles.text
//               : [styles.text, { color: "#9AA0A6" }]
//           }
//         >
//           {selectedManager || "Select Manager"}
//         </Text>
//         <Text style={styles.arrow}>▼</Text>
//       </TouchableOpacity>

//       {/* Show error message if API fails */}
//       {isError && (
//         <Text style={styles.errorText}>
//           Failed to load managers. Please try again.
//         </Text>
//       )}

//       {/* Dropdown - NO LOADING STATE */}
//       <Modal transparent visible={showDropdown} animationType="fade">
//         <TouchableOpacity
//           style={styles.overlay}
//           activeOpacity={1}
//           onPress={() => {
//             console.log("Overlay clicked - closing dropdown");
//             setShowDropdown(false);
//           }}
//         >
//           <View style={styles.dropdownList}>
//             {managers.length === 0 ? (
//               <View style={styles.dropdownItem}>
//                 <Text style={[styles.text, { color: "#9AA0A6" }]}>
//                   No managers available
//                 </Text>
//               </View>
//             ) : (
//               managers.map((manager) => (
//                 <TouchableOpacity
//                   key={manager.id}
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     console.log("Manager selected:", manager.name);
//                     setSelectedManager(manager.name);
//                     setShowDropdown(false);
//                   }}
//                 >
//                   <Text style={styles.text}>{manager.name}</Text>
//                 </TouchableOpacity>
//               ))
//             )}
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Select Leads */}
//       <Text style={styles.label}>Select Leads</Text>

//       <TouchableOpacity style={styles.leadRow} onPress={selectAll}>
//         <Text style={styles.checkbox}>
//           {selectedLeads.length === LEADS.length ? "☑" : "☐"}
//         </Text>
//         <Text style={styles.text}>Select All</Text>
//       </TouchableOpacity>

//       {/* Leads List with Footer */}
//       <FlatList
//         data={LEADS}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => {
//           const checked = selectedLeads.includes(item.id);
//           return (
//             <TouchableOpacity
//               style={styles.leadRow}
//               onPress={() => toggleLead(item.id)}
//             >
//               <Text style={styles.checkbox}>
//                 {checked ? "☑" : "☐"}
//               </Text>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.text}>{item.name}</Text>
//                 <Text style={styles.subText}>
//                   {item.assigned
//                     ? `Assigned to: ${item.assigned}`
//                     : "Unassigned"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         ListFooterComponent={renderFooter}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />
//     </View>
//   );
// };

// export default memo(IndividualAssignmentTab);

// const styles = StyleSheet.create({
//   tabRoot: {
//     flex: 1,
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "#fff",
//   },

//   text: {
//     fontSize: 12.5,
//     color: "#3c4043",
//   },

//   subText: {
//     fontSize: 11.5,
//     color: "#5f6368",
//   },

//   label: {
//     fontSize: 14,
//     color: "#202124",
//     marginBottom: 8,
//     fontWeight: "500",
//   },

//   dropdownBox: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#DADCE0",
//     borderRadius: 8,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     marginBottom: 16,
//   },

//   arrow: {
//     fontSize: 12,
//     color: "#5F6368",
//   },

//   errorText: {
//     fontSize: 12,
//     color: "#d93025",
//     marginBottom: 12,
//     marginTop: -8,
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.1)",
//   },

//   dropdownList: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     marginHorizontal: 16,
//     marginTop: 250,
//     elevation: 8,
//     maxHeight: 300,
//   },

//   dropdownItem: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   leadRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   checkbox: {
//     fontSize: 16,
//     marginRight: 10,
//   },

//   bottomRow: {
//     marginTop: 24,
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 12,
//   },

//   cancelBtn: {
//     borderWidth: 1,
//     borderColor: "#b7b7ff",
//     borderRadius: 6,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//   },

//   cancelText: {
//     color: "#4b6cff",
//     fontWeight: "600",
//     fontSize: 12,
//   },

//   assignBtn: {
//     backgroundColor: "#4b6cff",
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 6,
//   },

//   disabledBtn: {
//     backgroundColor: "#e6e6e6",
//   },

//   assignText: {
//     color: "#9aa0a6",
//     fontWeight: "600",
//     fontSize: 12,
//   },
// });

import React, { FC, memo, useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useGetAllFilteredLeadsManagerWiseQuery } from "../../../apis/hooks/lead-management/query/useGetAllFilteredLeadsManagerWise.query";
import { useGetAllLeadsByFilterQuery } from "../../../apis/hooks/lead-management/query/useGetAllLeadsByFilter.query";
import { useUpdateLeadManagerV2Mutation } from "../../../apis/hooks/lead-management/mutation/useUpdateLeadManagerV2.mutation";
import { store } from "../../../app/store";
import { COLORS } from "../../../colors";

interface Manager {
  employeeId: string;
  userName: string;
  lastName?: string;
  designation: string;
  userStatus: string;
}

interface Lead {
  leadId: string;
  leadName: string;
  status: string;
  assigneLeadManagers?: {
    managerName?: string;
    employeeId?: string;
    designation?: string;
    dateCreated?: number;
    assignedOn?: string;
  };
}

interface MappedLead {
  id: string;
  name: string;
  assigned: string | null;
}

interface SelectedManagerInfo {
  name: string;
  employeeId: string;
  designation: string;
}

const IndividualAssignmentTab: FC = () => {
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [selectedManagerInfo, setSelectedManagerInfo] = useState<SelectedManagerInfo | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get organizationId and customerId from store
  const organizationId = store.getState().auth.selectedOrganization?.organizationId || "";
  const customerId = store.getState().auth.selectedOrganization?.customerId || "";

  // API call to get managers
  const { data: managersData, isLoading: isLoadingManagers, isError: isManagersError, isSuccess: isManagersSuccess, error: managersError } = useGetAllFilteredLeadsManagerWiseQuery();

  // API call to get leads
  const { data: leadsData, isLoading: isLoadingLeads, isError: isLeadsError, error: leadsError, refetch: refetchLeads } = useGetAllLeadsByFilterQuery({
    organizationId,
    customerId,
    leadSourceType: "enquiry",
    startDate: undefined,
    endDate: undefined,
  });

  // API call to update lead manager
  const { mutate: updateLeadManager, isPending: isUpdating } = useUpdateLeadManagerV2Mutation();

  // Debug logs
  useEffect(() => {
    console.log("=== API DEBUG ===");
    console.log("isLoadingManagers:", isLoadingManagers);
    console.log("isManagersSuccess:", isManagersSuccess);
    console.log("isManagersError:", isManagersError);
    console.log("managersError:", managersError);
    console.log("managersData:", managersData);
    console.log("isLoadingLeads:", isLoadingLeads);
    console.log("isLeadsError:", isLeadsError);
    console.log("leadsError:", leadsError);
    console.log("leadsData:", leadsData);
    console.log("================");
  }, [isLoadingManagers, isManagersSuccess, isManagersError, managersData, managersError, isLoadingLeads, isLeadsError, leadsError, leadsData]);

  // Extract managers from API response
  const managers = useMemo(() => {
    console.log("useMemo running - managersData:", managersData);
    
    if (!managersData?.data || !Array.isArray(managersData.data)) {
      console.log("No managers data available");
      return [];
    }
    
    const mappedManagers = managersData.data.map((manager: Manager) => ({
      id: manager.employeeId,
      name: manager.lastName 
        ? `${manager.userName} ${manager.lastName}` 
        : manager.userName,
      userName: manager.userName,
      employeeId: manager.employeeId,
      designation: manager.designation,
    }));
    
    console.log("Mapped managers:", mappedManagers);
    return mappedManagers;
  }, [managersData]);

  // Extract leads from API response
  const leads = useMemo(() => {
    console.log("useMemo running - leadsData:", leadsData);
    
    if (!leadsData?.data || !Array.isArray(leadsData.data)) {
      console.log("No leads data available");
      return [];
    }
    
    // Filter out leads with status "delete" and map the rest
    const mappedLeads = leadsData.data
      .filter((lead: Lead) => lead.status !== "delete")
      .map((lead: Lead) => ({
        id: lead.leadId,
        name: lead.leadName,
        assigned: lead.assigneLeadManagers?.managerName || null,
      }));
    
    console.log("Mapped leads:", mappedLeads);
    return mappedLeads;
  }, [leadsData]);

  useEffect(() => {
    console.log("Managers list updated:", managers);
  }, [managers]);

  useEffect(() => {
    console.log("Leads list updated:", leads);
  }, [leads]);

  const toggleLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l: MappedLead) => l.id));
    }
  };

  const onCancel = () => {
    setSelectedManager(null);
    setSelectedManagerInfo(null);
    setSelectedLeads([]);
  };

  const onAssign = () => {
    if (!selectedManagerInfo || selectedLeads.length === 0) {
      Alert.alert("Error", "Please select a manager and at least one lead");
      return;
    }

    updateLeadManager(
      {
        leadId: selectedLeads,
        id: selectedLeads,
        flag: "enquiry",
        leadManager: {
          managerName: selectedManagerInfo.name,
          employeeId: selectedManagerInfo.employeeId,
          designation: selectedManagerInfo.designation,
        },
      },
      {
        onSuccess: (response) => {
          console.log("Lead manager updated successfully:", response);
          Alert.alert("Success", "Manager assigned successfully!", [
            {
              text: "OK",
              onPress: () => {
                // Refresh leads list
                refetchLeads();
                // Reset selections
                onCancel();
              },
            },
          ]);
        },
        onError: (error: any) => {
          console.error("Error updating lead manager:", error);
          Alert.alert(
            "Error",
            error?.response?.data?.message || "Failed to assign manager. Please try again."
          );
        },
      }
    );
  };


  return (
    <View style={styles.tabRoot}>
      {/* Select Manager */}
      <Text style={styles.label}>Select Manager</Text>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => {
          console.log("Dropdown clicked");
          setShowDropdown(true);
        }}
      >
        <Text
          style={
            selectedManager
              ? styles.text
              : [styles.text, { color: "#9AA0A6" }]
          }
        >
          {selectedManager || "Select Manager"}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Show error message if API fails */}
      {isManagersError && (
        <Text style={styles.errorText}>
          Failed to load managers. Please try again.
        </Text>
      )}
      {isLeadsError && (
        <Text style={styles.errorText}>
          Failed to load leads. Please try again.
        </Text>
      )}

      {/* Dropdown - NO LOADING STATE */}
      <Modal transparent visible={showDropdown} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            console.log("Overlay clicked - closing dropdown");
            setShowDropdown(false);
          }}
        >
          <View style={styles.dropdownList}>
            {managers.length === 0 ? (
              <View style={styles.dropdownItem}>
                <Text style={[styles.text, { color: "#9AA0A6" }]}>
                  No managers available
                </Text>
              </View>
            ) : (
              managers.map((manager: { id: string; name: string; userName: string; employeeId: string; designation: string }) => (
                <TouchableOpacity
                  key={manager.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    console.log("Manager selected:", manager.name);
                    setSelectedManager(manager.name);
                    setSelectedManagerInfo({
                      name: manager.name,
                      employeeId: manager.employeeId,
                      designation: manager.designation,
                    });
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.text}>{manager.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Select Leads */}
      <Text style={styles.label}>Select Leads</Text>

      {isLoadingLeads ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4b6cff" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.leadRow} onPress={selectAll}>
            <Text style={styles.checkbox}>
              {selectedLeads.length === leads.length && leads.length > 0 ? "☑" : "☐"}
            </Text>
            <Text style={styles.text}>Select All</Text>
          </TouchableOpacity>

          {/* Leads List - Scrollable with max 4 items visible */}
          <FlatList
            data={leads}
            keyExtractor={(item) => item.id}
            style={styles.leadsList}
            contentContainerStyle={styles.leadsListContent}
            renderItem={({ item }) => {
              const checked = selectedLeads.includes(item.id);
              return (
                <TouchableOpacity
                  style={styles.leadRow}
                  onPress={() => toggleLead(item.id)}
                >
                  <Text style={styles.checkbox}>
                    {checked ? "☑" : "☐"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.text}>{item.name}</Text>
                    <Text style={styles.subText}>
                      {item.assigned
                        ? `Assigned to: ${item.assigned}`
                        : "Unassigned"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No leads available</Text>
              </View>
            }
            showsVerticalScrollIndicator={true}
          />
        </>
      )}

      {/* Fixed Buttons at Bottom */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.assignBtn,
            (!(selectedManager && selectedLeads.length) || isUpdating) &&
              styles.disabledBtn,
          ]}
          disabled={!(selectedManager && selectedLeads.length) || isUpdating}
          onPress={onAssign}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              style={[
                styles.assignText,
                selectedManager && selectedLeads.length ? { color: "#fff" } : undefined,
              ]}
            >
              ASSIGN TO MANAGER
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(IndividualAssignmentTab);

const styles = StyleSheet.create({
  tabRoot: {
    flex: 1,
    marginTop: 20,
    padding: 16,
    paddingBottom: 0,
    backgroundColor: "#fff",
  },

  leadsList: {
    maxHeight: 240, // Approximately 4 lead items (60px each)
  },

  leadsListContent: {
    paddingBottom: 8,
  },

  text: {
    fontSize: 12.5,
    color: "#3c4043",
  },

  subText: {
    fontSize: 11.5,
    color: "#5f6368",
  },

  label: {
    fontSize: 14,
    color: "#202124",
    marginBottom: 8,
    fontWeight: "500",
  },

  dropdownBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  arrow: {
    fontSize: 12,
    color: "#5F6368",
  },

  errorText: {
    fontSize: 12,
    color: "#d93025",
    marginBottom: 12,
    marginTop: -8,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 250,
    elevation: 8,
    maxHeight: 300,
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  leadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  checkbox: {
    fontSize: 16,
    marginRight: 10,
  },

  bottomRow: {
    marginTop: 8,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  cancelText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  assignBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
  },

  disabledBtn: {
    backgroundColor: "#e6e6e6",
  },

  assignText: {
    color: "#9aa0a6",
    fontWeight: "600",
    fontSize: 12,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },

  loadingText: {
    fontSize: 12.5,
    color: "#5f6368",
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 12.5,
    color: "#9AA0A6",
  },
});
