// import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
// import React, { useMemo, useState } from "react";
// import {
//   TScreenNavigator,
//   TScreenNavigatorParams,
// } from "../../../types/navigator/screen-navigator";
// import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { useBatchDetailsQuery } from "../../../apis/hooks/batch/query/useBatchDetails.query";
// import Flex from "../../../@ui/flex/Flex";
// import Avatar from "../../../@ui/avatar/Avatar";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";
// import { getStatusColor } from "../../../utils/getStatusColor";
// import BatchPaymentOverviewDetails from "./BatchPaymentOverviewDetails";
// import { isEmptyString } from "../../../utils/isEmptyString";
// import UpdateBatch from "../update-batch";
// import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../images";
// import { hasUpdatePermission } from "../../../utils/fetchPermissionsTitle";

// const BatchDetails = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const { batchId } =
//     useRoute<RouteProp<TScreenNavigatorParams, "BatchDetails">>().params;
//   const { isLoading, data, refetch } = useBatchDetailsQuery({ batchId });
//   const [showUpdateForm, setShowUpdateForm] = useState(false);

//   const batchDetails: TBatchData = useMemo(() => {
//     if (!isLoading && data && data.statusCode === 200) {
//       return data.data;
//     } else {
//       return undefined;
//     }
//   }, [isLoading, data]);

//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Batch Details"
//         handleBackClick={() => navigation.goBack()}
//       />
//       <ThemeScrollView
//         loading={isLoading}
//         reloadData={refetch}
//         paddingHorizontal={15}
//       >
//         <Flex
//           styles={styles.batchDetailsCard}
//           flexDirection="column"
//           align="flex-start"
//         >
//           <Flex mb={30}>
//             <Flex flex={0}>
//               <Avatar
//                 size={39}
//                 content={batchDetails?.batchName}
//                 backgroundColor="#E3F2FF"
//                 textStyle={{
//                   color: COLORS.primary,
//                   fontFamily: "Poppins-SemiBold",
//                   fontSize: 20,
//                 }}
//               />
//             </Flex>
//             <Flex flexWrap="wrap" flex={1}>
//               <ScalableText style={{ ...styles.title }} fontFamily="Bold">
//                 {batchDetails?.batchName}
//               </ScalableText>
//             </Flex>
//             {hasUpdatePermission("Batch") && (
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Edit button pressed');
//                   setShowUpdateForm(true);
//                 }}
//                 style={styles.editButton}
//               >
//                 <AutoHeightImage source={IMAGES.editIcon} width={20} />
//               </TouchableOpacity>
//             )}
//           </Flex>

//           <Flex flexDirection="column" ml={5} align="flex-start">
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Name:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {isEmptyString(batchDetails?.batchName)}{" "}
//               </ScalableText>
//             </ScalableText>
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Interval:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {`${batchDetails?.batchStartDate} To ${batchDetails?.batchEndDate}`}
//               </ScalableText>
//             </ScalableText>
//             {batchDetails?.batchClassStartTime && (
//               <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//                 Time:{" "}
//                 <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                   {`${batchDetails?.batchClassStartTime} TO ${isEmptyString(
//                     batchDetails?.batchClassEndTime
//                   )}`}
//                 </ScalableText>
//               </ScalableText>
//             )}
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Status:{" "}
//               <ScalableText
//                 style={{
//                   ...styles.detailsContent,
//                   color: getStatusColor(batchDetails?.batchStatus),
//                 }}
//                 fontFamily="Medium"
//               >
//                 {batchDetails?.batchStatus}{" "}
//               </ScalableText>
//             </ScalableText>
//           </Flex>
//         </Flex>
//         {batchDetails?.students && (
//           <BatchPaymentOverviewDetails
//             courses={batchDetails?.courses.map((course) => course.courseId)}
//             students={batchDetails?.students}
//           />
//         )}
//       </ThemeScrollView>
      
//       {showUpdateForm && (
//         <View style={styles.modalOverlay}>
//           <UpdateBatch
//             batchData={batchDetails}
//             onClose={() => {
//               console.log('Closing update form');
//               setShowUpdateForm(false);
//               refetch();
//             }}
//           />
//         </View>
//       )}
//     </SafeView>
//   );
// };

// export default BatchDetails;

// const styles = StyleSheet.create({
//   batchDetailsCard: {
//     backgroundColor: COLORS.white,
//     elevation: 4,
//     padding: 15,
//     marginTop: 10,
//     borderRadius: 8,
//     borderWidth: 0.5,
//     borderColor: COLORS.primary,
//   },
//   title: {
//     fontSize: 20,
//     color: COLORS.primary,
//     textTransform: "capitalize",
//     marginLeft: 10,
//   },
//   detailsHeading: {
//     fontSize: 16,
//     marginVertical: 15,
//   },
//   detailsContent: {
//     color: "#646464",
//     fontSize: 14,
//     textTransform: "capitalize",
//   },
//   editButton: {
//     padding: 8,
//     marginLeft: 10,
//   },
//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 1000,
//   },
// });


// import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
// import React, { useMemo, useState } from "react";
// import {
//   TScreenNavigator,
//   TScreenNavigatorParams,
// } from "../../../types/navigator/screen-navigator";
// import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
// import { Text } from "react-native";

// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { useBatchDetailsQuery } from "../../../apis/hooks/batch/query/useBatchDetails.query";
// import Flex from "../../../@ui/flex/Flex";
// import Avatar from "../../../@ui/avatar/Avatar";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";
// import { getStatusColor } from "../../../utils/getStatusColor";
// import BatchPaymentOverviewDetails from "./BatchPaymentOverviewDetails";
// import { isEmptyString } from "../../../utils/isEmptyString";
// import UpdateBatch from "../update-batch";
// import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../images";
// import { hasUpdatePermission } from "../../../utils/fetchPermissionsTitle";

// const BatchDetails = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const { batchId } =
//     useRoute<RouteProp<TScreenNavigatorParams, "BatchDetails">>().params;
//   const { isLoading, data, refetch } = useBatchDetailsQuery({ batchId });
//   const [showUpdateForm, setShowUpdateForm] = useState(false);

//   const batchDetails: TBatchData | undefined = useMemo(() => {
//     if (data?.statusCode === 200) {
//       return data.data;
//     }
//     return undefined;
//   }, [data]);
  
//   console.log("Batch Details FULL DATA:", batchDetails);
// console.log("Batch Description:", batchDetails?.batchDescription);


//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Batch Details"
//         handleBackClick={() => navigation.goBack()}
//       />
//       <ThemeScrollView
//         loading={isLoading}
//         reloadData={refetch}
//         paddingHorizontal={15}
//       >
//         <Flex
//           styles={styles.batchDetailsCard}
//           flexDirection="column"
//           align="flex-start"
//         >
//           <Flex mb={30}>
//             <Flex flex={0}>
//               <Avatar
//                 size={39}
//                 content={batchDetails?.batchName}
//                 backgroundColor="#E3F2FF"
//                 textStyle={{
//                   color: COLORS.primary,
//                   fontFamily: "Poppins-SemiBold",
//                   fontSize: 20,
//                 }}
//               />
//             </Flex>
//             <Flex flexWrap="wrap" flex={1}>
//               <ScalableText style={{ ...styles.title }} fontFamily="Bold">
//                 {batchDetails?.batchName}
//               </ScalableText>
//             </Flex>
//             {hasUpdatePermission("Batch") && (
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Edit button pressed');
//                   setShowUpdateForm(true);
//                 }}
//                 style={styles.editButton}
//               >
//                 <AutoHeightImage source={IMAGES.editIcon} width={20} />
//               </TouchableOpacity>
//             )}
//           </Flex>

//           <Flex flexDirection="column" ml={5} align="flex-start">
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Name:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {isEmptyString(batchDetails?.batchName)}{" "}
//               </ScalableText>
//             </ScalableText>
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Interval:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {`${batchDetails?.batchStartDate} To ${batchDetails?.batchEndDate}`}
//               </ScalableText>
//             </ScalableText>
//             {batchDetails?.batchClassStartTime && (
//               <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//                 Time:{" "}
//                 <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                   {`${batchDetails?.batchClassStartTime} TO ${isEmptyString(
//                     batchDetails?.batchClassEndTime
//                   )}`}
//                 </ScalableText>
//               </ScalableText>
//             )}
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Status:{" "}
//               <ScalableText
//                 style={{
//                   ...styles.detailsContent,
//                   color: getStatusColor(batchDetails?.batchStatus),
//                 }}
//                 fontFamily="Medium"
//               >
//                 {batchDetails?.batchStatus}{" "}
//               </ScalableText>
//             </ScalableText>
//             <Text style={styles.detailsHeading}>
//             Description:
//              </Text>

//             <Text style={styles.detailsContent}>
//             {batchDetails?.batchDescription || "-"}
//              </Text>
//           </Flex>
//         </Flex>
//         {batchDetails?.students && (
//           <BatchPaymentOverviewDetails
//             courses={batchDetails?.courses.map((course) => course.courseId)}
//             students={batchDetails?.students}
//           />
//         )}
//       </ThemeScrollView>
      
//       {showUpdateForm && (
//         <View style={styles.modalOverlay}>
//           <UpdateBatch
//             batchData={batchDetails}
//             onClose={() => {
//               console.log('Closing update form');
//               setShowUpdateForm(false);
//               refetch();
//             }}
//           />
//         </View>
//       )}
//     </SafeView>
//   );
// };

// export default BatchDetails;

// const styles = StyleSheet.create({
//   batchDetailsCard: {
//     backgroundColor: COLORS.white,
//     elevation: 4,
//     padding: 15,
//     marginTop: 10,
//     borderRadius: 8,
//     borderWidth: 0.5,
//     borderColor: COLORS.primary,
//   },
//   title: {
//     fontSize: 20,
//     color: COLORS.primary,
//     textTransform: "capitalize",
//     marginLeft: 10,
//   },
//   detailsHeading: {
//     fontSize: 16,
//     marginVertical: 15,
//   },
//   detailsContent: {
//     color: "#646464",
//     fontSize: 14,
//     textTransform: "capitalize",
//   },
//   editButton: {
//     padding: 8,
//     marginLeft: 10,
//   },
//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 1000,
//   },
// });

// import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
// import React, { useMemo, useState } from "react";
// import {
//   TScreenNavigator,
//   TScreenNavigatorParams,
// } from "../../../types/navigator/screen-navigator";
// import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
// import { Text } from "react-native";

// import SafeView from "../../../@ui/safe-view/SafeView";
// import AppHeader from "../../../@ui/app-header/AppHeader";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import { useBatchDetailsQuery } from "../../../apis/hooks/batch/query/useBatchDetails.query";
// import Flex from "../../../@ui/flex/Flex";
// import Avatar from "../../../@ui/avatar/Avatar";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";
// import { getStatusColor } from "../../../utils/getStatusColor";
// import BatchPaymentOverviewDetails from "./BatchPaymentOverviewDetails";
// import { isEmptyString } from "../../../utils/isEmptyString";
// import UpdateBatch from "../update-batch";
// import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../images";
// import { hasUpdatePermission } from "../../../utils/fetchPermissionsTitle";

// const BatchDetails = () => {
//   const navigation = useNavigation<TScreenNavigator>();
//   const { batchId } =
//     useRoute<RouteProp<TScreenNavigatorParams, "BatchDetails">>().params;
//   const { isLoading, data, refetch } = useBatchDetailsQuery({ batchId });
//   const [showUpdateForm, setShowUpdateForm] = useState(false);

//   const batchDetails: TBatchData | undefined = useMemo(() => {
//     if (data?.statusCode === 200) {
//       return data.data;
//     }
//     return undefined;
//   }, [data]);
  
//   console.log("Batch Details FULL DATA:", batchDetails);
// console.log("Batch Description:", batchDetails?.batchDescription);


//   return (
//     <SafeView>
//       <AppHeader
//         showDrawer={false}
//         title="Batch Details"
//         handleBackClick={() => navigation.goBack()}
//       />
//       <ThemeScrollView
//         loading={isLoading}
//         reloadData={refetch}
//         paddingHorizontal={15}
//       >
//         <Flex
//           styles={styles.batchDetailsCard}
//           flexDirection="column"
//           align="flex-start"
//         >
//           <Flex mb={30}>
//             <Flex flex={0}>
//               <Avatar
//                 size={39}
//                 content={batchDetails?.batchName}
//                 backgroundColor="#E3F2FF"
//                 textStyle={{
//                   color: COLORS.primary,
//                   fontFamily: "Poppins-SemiBold",
//                   fontSize: 20,
//                 }}
//               />
//             </Flex>
//             <Flex flexWrap="wrap" flex={1}>
//               <ScalableText style={{ ...styles.title }} fontFamily="Bold">
//                 {batchDetails?.batchName}
//               </ScalableText>
//             </Flex>
//             {hasUpdatePermission("Batch") && (
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Edit button pressed');
//                   setShowUpdateForm(true);
//                 }}
//                 style={styles.editButton}
//               >
//                 <AutoHeightImage source={IMAGES.editIcon} width={20} />
//               </TouchableOpacity>
//             )}
//           </Flex>

//           <Flex flexDirection="column" ml={5} align="flex-start">
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Name:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {isEmptyString(batchDetails?.batchName)}{" "}
//               </ScalableText>
//             </ScalableText>
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Interval:{" "}
//               <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                 {`${batchDetails?.batchStartDate} To ${batchDetails?.batchEndDate}`}
//               </ScalableText>
//             </ScalableText>
//             {batchDetails?.batchClassStartTime && (
//               <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//                 Time:{" "}
//                 <ScalableText style={styles.detailsContent} fontFamily="Medium">
//                   {`${batchDetails?.batchClassStartTime} TO ${isEmptyString(
//                     batchDetails?.batchClassEndTime
//                   )}`}
//                 </ScalableText>
//               </ScalableText>
//             )}
//             <ScalableText fontFamily="SemiBold" style={styles.detailsHeading}>
//               Status:{" "}
//               <ScalableText
//                 style={{
//                   ...styles.detailsContent,
//                   color: getStatusColor(batchDetails?.batchStatus),
//                 }}
//                 fontFamily="Medium"
//               >
//                 {batchDetails?.batchStatus}{" "}
//               </ScalableText>
//             </ScalableText>
//             <View style={styles.row}>
//   <Text style={styles.detailsHeading}>
//     Description:
//   </Text>
//   <Text style={styles.detailsContent}>
//     {batchDetails?.batchDescription || "-"}
//   </Text>
// </View>

//           </Flex>
//         </Flex>
//         {batchDetails?.students && (
//           <BatchPaymentOverviewDetails
//             courses={batchDetails?.courses.map((course) => course.courseId)}
//             students={batchDetails?.students}
//           />
//         )}
//       </ThemeScrollView>
      
//       {showUpdateForm && (
//         <View style={styles.modalOverlay}>
//           <UpdateBatch
//             batchData={batchDetails}
//             onClose={() => {
//               console.log('Closing update form');
//               setShowUpdateForm(false);
//               refetch();
//             }}
//           />
//         </View>
//       )}
//     </SafeView>
//   );
// };

// export default BatchDetails;

// const styles = StyleSheet.create({
//   batchDetailsCard: {
//     backgroundColor: COLORS.white,
//     elevation: 4,
//     padding: 15,
//     marginTop: 10,
//     borderRadius: 8,
//     borderWidth: 0.5,
//     borderColor: COLORS.primary,
//   },
//   title: {
//     fontSize: 20,
//     color: COLORS.primary,
//     textTransform: "capitalize",
//     marginLeft: 10,
//   },
//   detailsHeading: {
//     fontSize: 16,
//     marginVertical: 15,
//   },
//   detailsContent: {
//     color: "#646464",
//     fontSize: 14,
//     textTransform: "capitalize",
//   },
//   editButton: {
//     padding: 8,
//     marginLeft: 10,
//   },
//   modalOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 1000,
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 6,
//   },
  
// });

import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import {
  TScreenNavigator,
  TScreenNavigatorParams,
} from "../../../types/navigator/screen-navigator";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import { useBatchDetailsQuery } from "../../../apis/hooks/batch/query/useBatchDetails.query";
import Flex from "../../../@ui/flex/Flex";
import Avatar from "../../../@ui/avatar/Avatar";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../colors";
import { getStatusColor } from "../../../utils/getStatusColor";
import BatchPaymentOverviewDetails from "./BatchPaymentOverviewDetails";
import { isEmptyString } from "../../../utils/isEmptyString";
import UpdateBatch from "../update-batch";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../images";
import { hasUpdatePermission } from "../../../utils/fetchPermissionsTitle";

const BatchDetails = () => {
  const navigation = useNavigation<TScreenNavigator>();
  const { batchId } =
    useRoute<RouteProp<TScreenNavigatorParams, "BatchDetails">>().params;

  const { isLoading, data, refetch } = useBatchDetailsQuery({ batchId });
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const batchDetails: TBatchData | undefined = useMemo(() => {
    if (data?.statusCode === 200) {
      return data.data;
    }
    return undefined;
  }, [data]);

  return (
    <SafeView>
      <AppHeader
        showDrawer={false}
        title="Batch Details"
        handleBackClick={() => navigation.goBack()}
      />

      <ThemeScrollView
        loading={isLoading}
        reloadData={refetch}
        paddingHorizontal={15}
      >
        <Flex
          styles={styles.batchDetailsCard}
          flexDirection="column"
          align="flex-start"
        >
          {/* HEADER */}
          <Flex mb={25}>
            <Avatar
              size={39}
              content={batchDetails?.batchName}
              backgroundColor="#E3F2FF"
              textStyle={{
                color: COLORS.primary,
                fontFamily: "Poppins-SemiBold",
                fontSize: 20,
              }}
            />

            <Flex flex={1} ml={10}>
              <ScalableText style={styles.title} fontFamily="Bold">
                {batchDetails?.batchName}
              </ScalableText>
            </Flex>

            {hasUpdatePermission("Batch") && (
              <TouchableOpacity
                onPress={() => setShowUpdateForm(true)}
                style={styles.editButton}
              >
                <AutoHeightImage source={IMAGES.editIcon} width={20} />
              </TouchableOpacity>
            )}
          </Flex>

          {/* DETAILS */}
          <Flex flexDirection="column" ml={5} align="stretch">
            {/* Name */}
            <View style={styles.row}>
              <ScalableText style={styles.label} fontFamily="SemiBold">
                Name:
              </ScalableText>
              <ScalableText style={styles.value} fontFamily="Medium">
                {isEmptyString(batchDetails?.batchName)}
              </ScalableText>
            </View>

            {/* Interval */}
            <View style={styles.row}>
              <ScalableText style={styles.label} fontFamily="SemiBold">
                Interval:
              </ScalableText>
              <ScalableText style={styles.value} fontFamily="Medium">
                {`${batchDetails?.batchStartDate} To ${batchDetails?.batchEndDate}`}
              </ScalableText>
            </View>

            {/* Time */}
            {batchDetails?.batchClassStartTime && (
              <View style={styles.row}>
                <ScalableText style={styles.label} fontFamily="SemiBold">
                  Time:
                </ScalableText>
                <ScalableText style={styles.value} fontFamily="Medium">
                  {`${batchDetails?.batchClassStartTime} TO ${isEmptyString(
                    batchDetails?.batchClassEndTime
                  )}`}
                </ScalableText>
              </View>
            )}

            {/* Status */}
            <View style={styles.row}>
              <ScalableText style={styles.label} fontFamily="SemiBold">
                Status:
              </ScalableText>
              <ScalableText
                style={[
                  styles.value,
                  { color: getStatusColor(batchDetails?.batchStatus) },
                ]}
                fontFamily="Medium"
              >
                {batchDetails?.batchStatus}
              </ScalableText>
            </View>

            {/* Description */}
            <View style={styles.row}>
              <ScalableText style={styles.label} fontFamily="SemiBold">
                Description:
              </ScalableText>
              <ScalableText style={styles.description} fontFamily="Medium">
                {batchDetails?.batchDescription || "-"}
              </ScalableText>
            </View>
          </Flex>
        </Flex>

        {batchDetails?.students && (
          <BatchPaymentOverviewDetails
            courses={batchDetails?.courses.map((c) => c.courseId)}
            students={batchDetails?.students}
          />
        )}
      </ThemeScrollView>

      {showUpdateForm && (
        <View style={styles.modalOverlay}>
          <UpdateBatch
            batchData={batchDetails}
            onClose={() => {
              setShowUpdateForm(false);
              refetch();
            }}
          />
        </View>
      )}
    </SafeView>
  );
};

export default BatchDetails;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  batchDetailsCard: {
    backgroundColor: COLORS.white,
    elevation: 4,
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 20,
    color: COLORS.primary,
    textTransform: "capitalize",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",   // 👈 YAHI MAIN FIX
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    marginRight: 6,
  },
  value: {
    fontSize: 14,
    color: "#646464",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 14,
    color: COLORS.black,
    flexShrink: 1,
  },
  editButton: {
    padding: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
});

