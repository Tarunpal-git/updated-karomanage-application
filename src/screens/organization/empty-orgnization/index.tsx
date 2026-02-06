// import { Linking, StyleSheet } from "react-native";
// import React from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import Center from "../../../@ui/center/Center";
// import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../images";
// import { SCREEN_WIDTH } from "../../../constants/Screen";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";

// const EmptyOrganization = () => {
//   return (
//     <SafeView>
//       <ThemeScrollView>
//         <Center>
//           <AutoHeightImage
//             source={IMAGES.noOrganization}
//             width={SCREEN_WIDTH - 30}
//           />
//           <ScalableText style={styles.description} fontFamily="Regular">
//             Please create organization on Karomanage portal:{" "}
//             <ScalableText
//               onPress={() => Linking.openURL("https://portal.karomanage.com/")}
//               fontFamily="Regular"
//               style={{ color: COLORS.primary, textDecorationLine: "underline" }}
//             >
//               Karomanage
//             </ScalableText>
//           </ScalableText>
//         </Center>
//       </ThemeScrollView>
//     </SafeView>
//   );
// };

// export default EmptyOrganization;

// const styles = StyleSheet.create({
//   description: {
//     fontSize: 16,
//     color: COLORS.black,
//     textAlign: "center",
//     lineHeight: 24,
//   },
// });

// import {
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   TextInput,
//   Alert,
// } from "react-native";
// import React, { useState, useEffect } from "react";
// import SafeView from "../../../@ui/safe-view/SafeView";
// import Center from "../../../@ui/center/Center";
// import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
// import { IMAGES } from "../../../images";
// import { SCREEN_WIDTH } from "../../../constants/Screen";
// import ScalableText from "../../../@ui/scalable-text/ScalableText";
// import { COLORS } from "../../../colors";
// import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
// import Flex from "../../../@ui/flex/Flex";
// import { useNavigation } from "@react-navigation/native";
// import { TOrganizationNavigator } from "../../../navigators/organization-navigator/OrganizationNavigator";
// import { useAcceptInvitationQuery } from "../../../apis/hooks/organization/query/useAcceptInvitation.query";
// import CryptoJS from "crypto-js";
// import { useAppSelector } from "../../../app/hooks";
// import { useQueryClient } from "@tanstack/react-query";
// import { ORGANIZATION_PREFIX } from "../../../constants";
// import { apiUrls } from "../../../apis/urls";

// const EmptyOrganization = () => {
//   const navigation = useNavigation<TOrganizationNavigator>();
//   const [inviteLink, setInviteLink] = useState("");
//   const [decryptedData, setDecryptedData] = useState<any>(null);
//   const [shouldFetch, setShouldFetch] = useState(false);

//   // Get current user's customerId from Redux
//   const authUser = useAppSelector((state) => state.auth.authUser);
//   const currentUserId = authUser?.customerId || "";

//   // Query client for invalidating queries
//   const queryClient = useQueryClient();

//   // Accept Invitation Query
//   const { data, error, isSuccess, isError } = useAcceptInvitationQuery(
//     {
//       parentCustomerId: decryptedData?.customerId || "",
//       organizationId: decryptedData?.organizationId || "",
//       customerId: currentUserId || "", // Current user's customerId
//       userId: decryptedData?.temporaryId || "", // Decrypted temporaryId
//     },
//     shouldFetch
//   );

//   // Decrypt invitation link function
//   const decryptLink = (encryptedLink: string) => {
//     try {
//       const bytes = CryptoJS.AES.decrypt(encryptedLink, "test key");
//       const decrypted = bytes.toString(CryptoJS.enc.Utf8);

//       if (decrypted) {
//         const parts = decrypted.split("/");
//         return {
//           customerId: parts[0], // parentCustomerId
//           organizationId: parts[1],
//           temporaryId: parts[2], // userId parameter ke liye
//           timestamp: parts[3],
//         };
//       }
//       return null;
//     } catch (err) {
//       console.error("Decryption error:", err);
//       return null;
//     }
//   };

//   // Handle success/error responses
//   useEffect(() => {
//     if (shouldFetch && isSuccess && data) {
//       if (data?.data?.message?.includes("Success") || data?.statusCode === 200) {
//         Alert.alert("Success", "Successfully joined organization!", [
//           {
//             text: "OK",
//             onPress: () => {
//               // Reset states
//               setInviteLink("");
//               setDecryptedData(null);
//               setShouldFetch(false);

//               // Invalidate queries to refresh organization list
//               queryClient.invalidateQueries({
//                 queryKey: [
//                   ORGANIZATION_PREFIX,
//                   apiUrls.organization.FETCH_ORGANIZATION_LISTS,
//                 ],
//               });
//               queryClient.invalidateQueries({
//                 queryKey: [
//                   ORGANIZATION_PREFIX,
//                   apiUrls.organization.GET_CUSTOMER_DETAILS,
//                 ],
//               });

//               // Navigate back to show updated organization list
//               navigation.goBack();
//             },
//           },
//         ]);
//       } else {
//         Alert.alert("Error", data?.data?.message || "Failed to join organization");
//         setShouldFetch(false);
//       }
//     }

//     if (shouldFetch && isError) {
//       Alert.alert("Error", "Failed to join organization");
//       setShouldFetch(false);
//     }
//   }, [isSuccess, isError, data, shouldFetch]);

//   const handleJoinOrganization = async () => {
//     // Validation
//     if (!inviteLink.trim()) {
//       Alert.alert("Error", "Please enter invitation link");
//       return;
//     }

//     if (!currentUserId) {
//       Alert.alert("Error", "User ID not found. Please login again.");
//       return;
//     }

//     // Decrypt link
//     const decrypted = decryptLink(inviteLink.trim());
//     if (!decrypted) {
//       Alert.alert("Error", "Invalid invitation link");
//       return;
//     }

//     // Check timestamp (1 hour validity)
//     const currentTime = new Date().getTime();
//     const timeDiff = Math.abs(currentTime - Number(decrypted.timestamp));
//     const hoursDiff = timeDiff / (60000 * 60);

//     if (hoursDiff > 1) {
//       Alert.alert("Error", "The link has expired");
//       return;
//     }

//     // Set decrypted data and trigger API
//     setDecryptedData(decrypted);
//     setShouldFetch(true);
//   };

//   return (
//     <SafeView>
//       <ThemeScrollView>
//         <Center>
//           <AutoHeightImage
//             source={IMAGES.noOrganization}
//             width={SCREEN_WIDTH - 30}
//           />
//           <ScalableText fontFamily="SemiBold" style={styles.sectionLabel}>
//            Join Organization!
//           </ScalableText>

//           {/* 🔹 Join Organization */}
//           <View style={styles.joinContainer}>
            
//             <TextInput
//               placeholder="Enter invitation link"
//               value={inviteLink}
//               onChangeText={setInviteLink}
//               style={styles.joinInput}
//               // placeholderTextColor={COLORS.gray}
//             />
            
//             <TouchableOpacity
//               style={[
//                 styles.joinBtn,
//                 (!inviteLink || shouldFetch) && styles.joinBtnDisabled,
//               ]}
//               onPress={handleJoinOrganization}
//               disabled={!inviteLink || shouldFetch}
//             >
//               <ScalableText
//                 fontFamily="SemiBold"
//                 style={styles.joinBtnText}
//               >
//                 JOIN
//               </ScalableText>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.orContainer}>
//           <View style={styles.orLine} />
//           <ScalableText style={styles.orText }>OR</ScalableText>
//           <View style={styles.orLine} />
//           </View>
//           <ScalableText fontFamily="SemiBold" style={styles.sectionLabel}>
//   Create Organization!
// </ScalableText>

//           {/* 🔹 Create Organization */}
//           <TouchableOpacity
//             style={styles.createOrgBtn}
//             onPress={() => navigation.navigate("CreateOrganization")}
//           >
//             <Flex justify="center" align="center">
//               <AutoHeightImage source={IMAGES.createIcon} width={20} />
//               <ScalableText
//                 fontFamily="SemiBold"
//                 style={styles.createOrgText}
//               >
//                 Create Organization
//               </ScalableText>
//             </Flex>
//           </TouchableOpacity>
//         </Center>
//       </ThemeScrollView>
//     </SafeView>
//   );
// };

// export default EmptyOrganization;

// const styles = StyleSheet.create({
//   /* 🔹 Join Organization */
//   joinContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     marginVertical: 1,
//     backgroundColor: COLORS.white,
//     width: SCREEN_WIDTH - 66,
//   },

//   joinInput: {
//     flex: 1,
//     height: 45,
//     fontSize: 14,
//     color: COLORS.black,
//   },

//   joinBtn: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 18,
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginLeft: 8,
//   },

//   joinBtnText: {
//     color: COLORS.white,
//     fontSize: 14,
//   },

//   joinBtnDisabled: {
//     backgroundColor: COLORS.muted,
//     opacity: 0.5,
//   },

//   /* 🔹 Create Organization */
//   createOrgBtn: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//     borderRadius: 10,
//     paddingHorizontal: 63,
//     paddingVertical: 10,
//     marginVertical: 1,
//     alignItems: "center",
//   },
//   sectionLabel: {
//     fontSize: 16,
//     color: COLORS.black,
//     marginTop: 12,
//     marginBottom: 6,
//     alignSelf: "flex-start",   // ✅ LEFT side
//   width: SCREEN_WIDTH - 66, 
//   },
  
//   orContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 14,
//     width: SCREEN_WIDTH - 66,
//   },
  
//   orLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: COLORS.gray,
//     // fontWeight: 'bold',
//   },
  
//   orText: {
//     marginHorizontal: 19,
//     fontSize: 19,
//     color: '#000000',
  
//   },
  

//   createOrgText: {
//     fontSize: 16,
//     color: COLORS.primary,
//     marginLeft: 8,
//   },
// });


import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import SafeView from "../../../@ui/safe-view/SafeView";
import Center from "../../../@ui/center/Center";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import { IMAGES } from "../../../images";
import { SCREEN_WIDTH } from "../../../constants/Screen";
import ScalableText from "../../../@ui/scalable-text/ScalableText";
import { COLORS } from "../../../colors";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import Flex from "../../../@ui/flex/Flex";
import { useNavigation } from "@react-navigation/native";
import { TOrganizationNavigator } from "../../../navigators/organization-navigator/OrganizationNavigator";
import { useAcceptInvitationQuery } from "../../../apis/hooks/organization/query/useAcceptInvitation.query";
import CryptoJS from "crypto-js";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { ORGANIZATION_PREFIX } from "../../../constants";
import { apiUrls } from "../../../apis/urls";
import AppHeader from "../../../@ui/app-header/AppHeader";
import { updateNavigator } from "../../../app/reducer/auth/auth-reducer";

const EmptyOrganization = () => {
  const navigation = useNavigation<TOrganizationNavigator>();
  const dispatch = useAppDispatch();
  const [inviteLink, setInviteLink] = useState("");
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Get current user's customerId from Redux
  const authUser = useAppSelector((state) => state.auth.authUser);
  const currentUserId = authUser?.customerId || "";

  // Query client for invalidating queries
  const queryClient = useQueryClient();

  // Accept Invitation Query
  const { data, error, isSuccess, isError } = useAcceptInvitationQuery(
    {
      parentCustomerId: decryptedData?.customerId || "",
      organizationId: decryptedData?.organizationId || "",
      customerId: currentUserId || "", // Current user's customerId
      userId: decryptedData?.temporaryId || "", // Decrypted temporaryId
    },
    shouldFetch
  );

  // Decrypt invitation link function
  const decryptLink = (encryptedLink: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedLink, "test key");
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (decrypted) {
        const parts = decrypted.split("/");
        return {
          customerId: parts[0], // parentCustomerId
          organizationId: parts[1],
          temporaryId: parts[2], // userId parameter ke liye
          timestamp: parts[3],
        };
      }
      return null;
    } catch (err) {
      console.error("Decryption error:", err);
      return null;
    }
  };

  // Handle success/error responses
  useEffect(() => {
    if (shouldFetch && isSuccess && data) {
      if (data?.data?.message?.includes("Success") || data?.statusCode === 200) {
        Alert.alert("Success", "Successfully joined organization!", [
          {
            text: "OK",
            onPress: () => {
              // Reset states
              setInviteLink("");
              setDecryptedData(null);
              setShouldFetch(false);

              // Invalidate queries to refresh organization list
              queryClient.invalidateQueries({
                queryKey: [
                  ORGANIZATION_PREFIX,
                  apiUrls.organization.FETCH_ORGANIZATION_LISTS,
                ],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  ORGANIZATION_PREFIX,
                  apiUrls.organization.GET_CUSTOMER_DETAILS,
                ],
              });

              // Navigate back to show updated organization list
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Error", data?.data?.message || "Failed to join organization");
        setShouldFetch(false);
      }
    }

    if (shouldFetch && isError) {
      Alert.alert("Error", "Failed to join organization");
      setShouldFetch(false);
    }
  }, [isSuccess, isError, data, shouldFetch]);

  const handleJoinOrganization = async () => {
    // Validation
    if (!inviteLink.trim()) {
      Alert.alert("Error", "Please enter invitation link");
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    // Decrypt link
    const decrypted = decryptLink(inviteLink.trim());
    if (!decrypted) {
      Alert.alert("Error", "Invalid invitation link");
      return;
    }

    // Check timestamp (1 hour validity)
    const currentTime = new Date().getTime();
    const timeDiff = Math.abs(currentTime - Number(decrypted.timestamp));
    const hoursDiff = timeDiff / (60000 * 60);

    if (hoursDiff > 1) {
      Alert.alert("Error", "The link has expired");
      return;
    }

    // Set decrypted data and trigger API
    setDecryptedData(decrypted);
    setShouldFetch(true);
  };

  return (
     <SafeView>
    
    <AppHeader
      title="Create & Join Organization"
      showDrawer={false}
      handleBackClick={() => {
        // Switch back to AuthNavigator to show MsalAuthWebView
        dispatch(updateNavigator("logout"));
      }}
    />
      <ThemeScrollView>
        <Center>
          <AutoHeightImage
            source={IMAGES.noOrganization}
            width={SCREEN_WIDTH - 30}
          />
          <ScalableText fontFamily="SemiBold" style={styles.sectionLabel}>
           Join Organization!
          </ScalableText>

          {/* 🔹 Join Organization */}
          <View style={styles.joinContainer}>
            
            <TextInput
              placeholder="Enter invitation link"
              value={inviteLink}
              onChangeText={setInviteLink}
              style={styles.joinInput}
              // placeholderTextColor={COLORS.gray}
            />
            
            <TouchableOpacity
              style={[
                styles.joinBtn,
                (!inviteLink || shouldFetch) && styles.joinBtnDisabled,
              ]}
              onPress={handleJoinOrganization}
              disabled={!inviteLink || shouldFetch}
            >
              <ScalableText
                fontFamily="SemiBold"
                style={styles.joinBtnText}
              >
                JOIN
              </ScalableText>
            </TouchableOpacity>
          </View>
          <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <ScalableText style={styles.orText }>OR</ScalableText>
          <View style={styles.orLine} />
          </View>
          <ScalableText fontFamily="SemiBold" style={styles.sectionLabel}>
  Create Organization!
</ScalableText>

          {/* 🔹 Create Organization */}
          <TouchableOpacity
            style={styles.createOrgBtn}
            onPress={() => navigation.navigate("CreateOrganization")}
          >
            <Flex justify="center" align="center">
              <AutoHeightImage source={IMAGES.createIcon} width={20} />
              <ScalableText
                fontFamily="SemiBold"
                style={styles.createOrgText}
              >
                Create Organization
              </ScalableText>
            </Flex>
          </TouchableOpacity>
        </Center>
      </ThemeScrollView>
    </SafeView>
  );
};

export default EmptyOrganization;

const styles = StyleSheet.create({
  /* 🔹 Join Organization */
  joinContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 1,
    backgroundColor: COLORS.white,
    width: SCREEN_WIDTH - 66,
  },

  joinInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: COLORS.black,
  },

  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },

  joinBtnText: {
    color: COLORS.white,
    fontSize: 14,
  },

  joinBtnDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.5,
  },

  /* 🔹 Create Organization */
  createOrgBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 63,
    paddingVertical: 10,
    marginVertical: 1,
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 6,
    alignSelf: "flex-start",   // ✅ LEFT side
  width: SCREEN_WIDTH - 66, 
  },
  
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    width: SCREEN_WIDTH - 66,
  },
  
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray,
    // fontWeight: 'bold',
  },
  
  orText: {
    marginHorizontal: 19,
    fontSize: 19,
    color: '#000000',
  
  },
  

  createOrgText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
  },
});