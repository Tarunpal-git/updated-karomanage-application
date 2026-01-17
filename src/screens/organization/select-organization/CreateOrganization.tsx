
import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Alert,
  Image,
} from "react-native";
import TermsAndConditionsModal from './Termsandcondition';
import { useForm, Controller } from "react-hook-form";
import { launchImageLibrary } from 'react-native-image-picker';
import CryptoJS from "crypto-js";  // ✅ YEH ADD KAREIN
import AppConfig from "../../../utils/config";  // ✅ Changed from react-native-config to AppConfig
import SafeView from "../../../@ui/safe-view/SafeView";
import AppHeader from "../../../@ui/app-header/AppHeader";
import Flex from "../../../@ui/flex/Flex";
import AutoHeightImage from "../../../@ui/auto-height-image/AutoHeightImage";
import ThemeScrollView from "../../../@ui/theme-scroll-view/ThemeScrollView";
import Button from "../../../@ui/button/Button";
import { IMAGES } from "../../../images";
import { COLORS } from "../../../colors";
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useOrganizationPhoneOtpVerificationMutation } from  "../../../apis/hooks/otpverification/mutation/useOrganizationPhoneOtpVerification.mutation"
import { useOrganizationEmailVerificationMutation } from "../../../apis/hooks/otpverification/mutation/useOrganizationEmailVerification.mutation"
import { useValidateOrgEmailPhoneMutation } from "../../../apis/hooks/otpverification/mutation/useValidateOrgEmailPhone.mutation";
import { useCreateOrganizationMutation } from "../../../apis/hooks/organization/mutation/useCreateOrganization.mutation"
import { store } from "../../../app/store";
/* ================= TYPES ================= */

type TCreateOrgForm = {
  organizationName: string;
  website?: string;
  logo?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  email: string;
  phone: string;
  address: string;
  about?: string;
  enableGst: "YES" | "NO";
  acceptTerms: boolean;
};

/* ================= HELPER FUNCTIONS ================= */

// Generate Random 6-digit OTP - React Native compatible
const generateOTP = (): string => {
  // Ensure we get a proper 6-digit number (100000 to 999999)
  const min = 100000;
  const max = 999999;
  // Use Math.random() which works with react-native-get-random-values polyfill
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};

// Encrypt OTP Function - React Native compatible
const encryptOTP = (otp: string): { encryptedOtp: string; iv: string } => {
  let SECRET_KEY_HEX =
    (Config as any).REACT_APP_SECRET_KEY ||
    (Config as any).NEXT_PUBLIC_SECRET_KEY;

  if (!SECRET_KEY_HEX) {
    SECRET_KEY_HEX =
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
  }

  const secretKey = CryptoJS.enc.Hex.parse(SECRET_KEY_HEX);
  
  // ✅ React Native compatible Random IV Generation
  // AES-256-CBC requires 16 bytes (32 hex chars) for IV
  // Using CryptoJS's WordArray.random() which works better in React Native
  const generateRandomIV = (): string => {
    try {
      // Use CryptoJS's built-in random generator (works with react-native-get-random-values)
      const wordArray = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
      return wordArray.toString(CryptoJS.enc.Hex);
    } catch (error) {
      // Fallback to manual generation if CryptoJS.random fails
      console.warn("CryptoJS.random failed, using fallback:", error);
      const randomBytes: number[] = [];
      for (let i = 0; i < 16; i++) {
        randomBytes.push(Math.floor(Math.random() * 256));
      }
      return randomBytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  };

  const ivHex = generateRandomIV();
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  // Encrypt using AES-256-CBC
  const encrypted = CryptoJS.AES.encrypt(otp, secretKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedOtp: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
    iv: ivHex,
  };
};

/* ================= LABEL ================= */

/* ================= LABEL ================= */

const Label = ({ text }: { text: string }) => (
  <Text style={styles.label}>{text}</Text>
);

/* ================= GST MODAL ================= */

const GSTModal = ({ visible, onClose, onSave, onCancel, resetKey }: any) => {
  const [cgstOn, setCgstOn] = useState(false);
  const [sgstOn, setSgstOn] = useState(false);
  const [cgst, setCgst] = useState(9);
  const [sgst, setSgst] = useState(9);
  const [editCgst, setEditCgst] = useState(false);
  const [editSgst, setEditSgst] = useState(false);
  const [gstin, setGstin] = useState("");
  const [gstinError, setGstinError] = useState("");
  const [gstTypeError, setGstTypeError] = useState("");
  const [cgstError, setCgstError] = useState("");
  const [sgstError, setSgstError] = useState("");

  useEffect(() => {
    setCgstOn(false);
    setSgstOn(false);
    setCgst(9);
    setSgst(9);
    setEditCgst(false);
    setEditSgst(false);
    setGstin("");
    setGstinError("");
    setGstTypeError("");
    setCgstError("");
    setSgstError("");
  }, [resetKey]);

  const total = (cgstOn ? cgst : 0) + (sgstOn ? sgst : 0);

  const handleSave = () => {
    let valid = true;

    // Reset errors
    setGstinError("");
    setGstTypeError("");
    setCgstError("");
    setSgstError("");

    if (!gstin.trim()) {
      setGstinError("GSTIN number is required when GST is enabled.");
      valid = false;
    }

    if (!cgstOn && !sgstOn) {
      setGstTypeError(
        "At least one GST type (CGST or SGST) must be enabled."
      );
      valid = false;
    }

    // Check CGST validation
    if (cgstOn && cgst === 0) {
      setCgstError("CGST percentage cannot be 0 when CGST is enabled.");
      valid = false;
    }

    // Check SGST validation
    if (sgstOn && sgst === 0) {
      setSgstError("SGST percentage cannot be 0 when SGST is enabled.");
      valid = false;
    }

    if (valid) {
      const gstRuleData = {
        cgstPercentage: cgstOn ? cgst : 0,
        sgstPercentage: sgstOn ? sgst : 0,
        cgstEnabled: cgstOn,
        sgstEnabled: sgstOn,
        inclusionType: cgstOn || sgstOn ? "inclusive" : "noGST",
        gstinNumber: gstin.trim(),
      };
      onSave(gstRuleData);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Rules</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>GST Settings</Text>

          {/* GST TYPE */}
          <View style={styles.labelRow}>
            <Text style={styles.modalLabel}>GST Type *</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Info",
                  "Choose whether to enable GST or apply no GST"
                )
              }
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gstTypeBox}>
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
            <Text style={styles.gstTypeText}>GST Enable</Text>
          </View>

          {/* GSTIN */}
          <View style={styles.labelRow}>
            <Text style={styles.modalLabel}>GSTIN Number *</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Info",
                  "Goods and Services Tax Identification Number"
                )
              }
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Enter GSTIN number"
            value={gstin}
            maxLength={15}
            onChangeText={(v) => {
              setGstin(v);
              setGstinError("");
            }}
            style={[
              styles.gstinInput,
              gstinError && { borderColor: "red" },
            ]}
          />

          {gstinError ? <Text style={styles.errorText}>{gstinError}</Text> : null}

          {/* CGST */}
          <View style={styles.row}>
            <Text>Enable CGST</Text>
            <View style={styles.rightRow}>
              {editCgst ? (
                <TextInput
                  value={String(cgst)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const numValue = Number(v) || 0;
                    if (numValue <= 100) {
                      setCgst(numValue);
                      // Clear error if value is valid
                      if (numValue > 0 || !cgstOn) {
                        setCgstError("");
                      } else if (cgstOn && numValue === 0) {
                        setCgstError("CGST percentage cannot be 0 when CGST is enabled.");
                      }
                    }
                  }}
                  style={styles.percentInput}
                />
              ) : (
                <Text>{cgstOn ? `${cgst}%` : "0%"}</Text>
              )}

              <TouchableOpacity onPress={() => setEditCgst(!editCgst)}>
                <AutoHeightImage source={IMAGES["editIcon"]} width={20} />
              </TouchableOpacity>

              <Switch
                value={cgstOn}
                onValueChange={(v) => {
                  setCgstOn(v);
                  setGstTypeError("");
                  // Check validation when toggling
                  if (v && cgst === 0) {
                    setCgstError("CGST percentage cannot be 0 when CGST is enabled.");
                  } else {
                    setCgstError("");
                  }
                }}
              />
            </View>
          </View>

          <Text style={styles.helperText}>Toggle to apply CGST.</Text>
          {cgstError ? <Text style={styles.errorText}>{cgstError}</Text> : null}

          {/* SGST */}
          <View style={styles.row}>
            <Text>Enable SGST</Text>
            <View style={styles.rightRow}>
              {editSgst ? (
                <TextInput
                  value={String(sgst)}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    const numValue = Number(v) || 0;
                    if (numValue <= 100) {
                      setSgst(numValue);
                      // Clear error if value is valid
                      if (numValue > 0 || !sgstOn) {
                        setSgstError("");
                      } else if (sgstOn && numValue === 0) {
                        setSgstError("SGST percentage cannot be 0 when SGST is enabled.");
                      }
                    }
                  }}
                  style={styles.percentInput}
                />
              ) : (
                <Text>{sgstOn ? `${sgst}%` : "0%"}</Text>
              )}

              <TouchableOpacity onPress={() => setEditSgst(!editSgst)}>
                <AutoHeightImage source={IMAGES["editIcon"]} width={20} />
              </TouchableOpacity>

              <Switch
                value={sgstOn}
                onValueChange={(v) => {
                  setSgstOn(v);
                  setGstTypeError("");
                  // Check validation when toggling
                  if (v && sgst === 0) {
                    setSgstError("SGST percentage cannot be 0 when SGST is enabled.");
                  } else {
                    setSgstError("");
                  }
                }}
              />
            </View>
          </View>

          <Text style={styles.helperText}>Toggle to apply SGST.</Text>
          {sgstError ? <Text style={styles.errorText}>{sgstError}</Text> : null}

          {gstTypeError ? (
            <Text style={styles.errorText}>{gstTypeError}</Text>
          ) : null}

          <Text style={styles.totalText}>Total Applicable GST</Text>
          <Text style={styles.totalValue}>{total}%</Text>

          <Text style={styles.helperText}>
            {total === 0
              ? "No GST will be applied as GST is disabled."
              : "This is the sum of enabled CGST and SGST percentages."}
          </Text>

          <Button
            title="SAVE GST SETTINGS"
            btnStyles={styles.saveBtn}
            btnTxtStyles={{ color: "#fff" }}
            onPress={handleSave}
          />
        </View>
      </View>
    </Modal>
  );
};

/* ================= MAIN ================= */

const CreateOrganization = ({ navigation }: any) => {
  const [showGST, setShowGST] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [logoImageUri, setLogoImageUri] = useState("");
  const [isGstConfigured, setIsGstConfigured] = useState(false);
  const [gstResetKey, setGstResetKey] = useState(0);
  const [gstData, setGstData] = useState<any>(null);
 const [showTermsModal, setShowTermsModal] = useState(false);


  // Email OTP states
  const [emailValue, setEmailValue] = useState("");
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [showEmailOtpField, setShowEmailOtpField] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [lastSentEmail, setLastSentEmail] = useState("");
  const [emailOtpEverSent, setEmailOtpEverSent] = useState(false);
  const [emailEncryptedOtp, setEmailEncryptedOtp] = useState("");
  const [emailIv, setEmailIv] = useState("");
  const [isEmailOtpLoading, setIsEmailOtpLoading] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState("");
  const [isEmailOtpVerified, setIsEmailOtpVerified] = useState(false);


  // Phone OTP states
  const [phoneValue, setPhoneValue] = useState("");
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [showPhoneOtpField, setShowPhoneOtpField] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [lastSentPhone, setLastSentPhone] = useState("");
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneOtpEverSent, setPhoneOtpEverSent] = useState(false);
  const [phoneEncryptedOtp, setPhoneEncryptedOtp] = useState("");
  const [phoneIv, setPhoneIv] = useState("");
  const [isPhoneOtpLoading, setIsPhoneOtpLoading] = useState(false);
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);

  // Phone OTP Mutation
  const phoneOtpMutation = useOrganizationPhoneOtpVerificationMutation();
  const emailOtpMutation = useOrganizationEmailVerificationMutation();
  const validateOrgEmailPhoneMutation = useValidateOrgEmailPhoneMutation();
  const createOrganizationMutation = useCreateOrganizationMutation();
  // const validateOrgEmailPhoneMutation = useValidateOrgEmailPhoneMutation();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TCreateOrgForm>({
    defaultValues: {
      enableGst: "NO",
      acceptTerms: false,
    },
  });

  // Phone Timer Effect
  useEffect(() => {
    let interval: any;
    if (phoneTimer > 0) {
      interval = setInterval(() => {
        setPhoneTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

  // Logo Image Handler
  const handleSelectLogoImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.7
      },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
  
          if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            Alert.alert('Error', 'File size exceeds 5MB limit');
            return;
          }
  
          setLogoImageUri(`data:${asset.type};base64,${asset.base64}`);
          setLogoName(asset.fileName || "logo.png");
          setValue("logo", `data:${asset.type};base64,${asset.base64}`);
        }
      }
    );
  };

  const handleClearLogoImage = () => {
    setLogoImageUri('');
    setLogoName('');
    setValue("logo", "");
  };

  const onSubmit = async (data: TCreateOrgForm) => {
    console.log("FINAL PAYLOAD 👉", data);
    
    // Get customerId from auth store
    const authUser = store.getState().auth.authUser;
    const customerId = authUser?.customerId;
    
    if (!customerId) {
      Alert.alert("Error", "Customer ID not found. Please login again.");
      return;
    }
    
    // Validate that email and phone are filled and verified
    if (!emailValue || !phoneValue) {
      Alert.alert("Error", "Please fill and verify both email and phone number.");
      return;
    }
    
    if (!isEmailOtpVerified || !isPhoneOtpVerified) {
      Alert.alert("Error", "Please verify both email and phone number OTP.");
      return;
    }
    
    try {
      console.log("🔍 Step 1: Validating email and phone...");
      // Step 1: Call validation API
      const validationResponse = await validateOrgEmailPhoneMutation.mutateAsync({
        customerId: customerId,
        organizationPhoneNumber: phoneValue,
        organizationEmail: emailValue,
        flag: "create",
      });
      
      console.log("✅ Validation API Response:", validationResponse);
      
      // Handle validation response
      if (validationResponse?.statusCode !== 200) {
        Alert.alert("Error", validationResponse?.message || "Validation failed. Please try again.");
        return;
      }

      console.log("🔍 Step 2: Generating organization ID...");
      // Generate organization ID from organization name (like web app)
      // Extract prefix from organization name (first letters of words)
      const orgName = data.organizationName.trim();
      const words = orgName.split(/\s+/).filter(word => word.length > 0);
      let prefix = "";
      
      if (words.length > 0) {
        // Get first letter of each word (all words like web app)
        for (let i = 0; i < words.length; i++) {
          if (words[i] && words[i][0] !== undefined) {
            prefix += words[i][0].toUpperCase();
          }
        }
      }
      
      // If no prefix, use default
      if (!prefix) {
        prefix = "ORG";
      }
      
      // Generate 4 random digits (like web app)6 kar raha hu phele 4 tha
      let uniqueId = '';
      const chars = "0123456789";
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        uniqueId += chars[randomIndex];
      }
      
      // Final organization ID format: PREFIX-XXXX (e.g., BBC-3015)
      const generatedOrganizationId = `${prefix}-${uniqueId}`;
      
      console.log("📝 Generated Organization ID:", generatedOrganizationId);
      console.log("📝 Prefix:", prefix);
      console.log("📝 Random Digits:", uniqueId);

      console.log("🔍 Step 3: Building organization payload...");
      // Step 3: Build organization creation payload
      const organizationPayload = {
        organizationName: data.organizationName,
        organizationAddress: data.address,
        organizationCity: data.city,
        organizationState: data.state,
        organizationCountry: data.country,
        organizationPinCode: data.pincode,
        organizationEmail: emailValue,
        organizationPhoneNumber: phoneValue,
        organizationWebsiteUrl: data.website || "",
        organizationDetails: data.about || "",
        organizationLogo: logoImageUri || "",
        organizationId: generatedOrganizationId, // Generated ID
        organizationPlan: {
          planName: "demo plan",
        },
        // Add GST data if configured
        ...(isGstConfigured && gstData && {
          gstRuleData: gstData,
        }),
      };

      console.log("📦 Organization Payload:", JSON.stringify(organizationPayload, null, 2));
      console.log("🔍 Step 4: Calling create organization API...");

      // Step 4: Call create organization API
      const createResponse = await createOrganizationMutation.mutateAsync(organizationPayload);
      
      console.log("✅ Create Organization Response:", JSON.stringify(createResponse, null, 2));
      console.log("Status Code:", createResponse?.statusCode);
      console.log("Message:", createResponse?.message);
      console.log("Organization ID:", createResponse?.data?.organizationId);
      
      // Handle success response
      if (createResponse?.statusCode === 200) {
        const orgId = createResponse?.data?.organizationId;
        const orgName = createResponse?.data?.organizationName;
        
        console.log("🎉 Organization created successfully!");
        console.log("Organization ID:", orgId);
        console.log("Organization Name:", orgName);
        
        Alert.alert(
          "Success", 
          `Organization "${orgName}" created successfully!\nOrganization ID: ${orgId}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to SelectOrganization screen to choose the created organization
                navigation.navigate("SelectOrganization");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", createResponse?.message || "Failed to create organization. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ API Error:", error);
      console.error("Error Response:", error?.response?.data);
      console.error("Error Message:", error?.message);
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.data?.message ||
        error?.data ||
        error?.message ||
        "Failed to create organization. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  // Check if email is valid
  const isValidEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  // Check if phone is valid
  const isValidPhone = (phone: string) => {
    return /^[0-9]{10}$/.test(phone);
  };

  // Check if Email OTP button should be enabled
  const isEmailOtpButtonEnabled = () => {
    if (!isValidEmail(emailValue)) return false;
    if (isEmailOtpLoading) return false;
    if (isEmailOtpVerified) return false; // Disable if OTP is already verified
    if (isEmailOtpSent && emailValue === lastSentEmail) return false;
    return true;
  };

  // Check if Phone OTP button should be enabled
  const isPhoneOtpButtonEnabled = () => {
    if (!isValidPhone(phoneValue)) return false;
    if (phoneTimer > 0) return false;
    if (isPhoneOtpLoading) return false;
    if (isPhoneOtpVerified) return false; // Disable if OTP is already verified
    return true;
  };

  // Handle Email OTP send
 // Handle Email OTP send
 const handleSendEmailOtp = async () => {
  if (!isValidEmail(emailValue)) {
    Alert.alert("Error", "Please enter a valid email");
    return;
  }

  // Get organization name from form
  const organizationName = watch("organizationName") || "";

  setIsEmailOtpLoading(true);
  try {
    // Generate 6-digit OTP
    const otp = generateOTP();
    setGeneratedEmailOtp(otp);

    // Encrypt OTP
    const { encryptedOtp, iv } = encryptOTP(otp);
    setEmailEncryptedOtp(encryptedOtp);
    setEmailIv(iv);

    // Note: OTP generation should ideally be done on server side for security
    // Currently generating on client as API expects encrypted OTP to be sent
    console.log("🔐 Encrypted OTP sent to server");
    console.log("🔑 IV:", iv);

    // Send to backend - mutation hook expects flat object structure
    const response = await emailOtpMutation.mutateAsync({
      organizationName: organizationName,
      organizationEmail: emailValue,
      encryptedOtp: encryptedOtp,
      iv: iv,
    });

    console.log("📧 Email OTP Response:", response);
    console.log("📧 Response Type:", typeof response);
    console.log("📧 Response StatusCode:", response?.statusCode);
    console.log("📧 Response Message:", response?.message);

    // Handle different response formats:
    // API returns plain string "OTP has been delivered successfully" on success (status 200)
    const responseStr = typeof response === 'string' 
      ? response.trim().toLowerCase() 
      : String(response?.message || '').trim().toLowerCase();
    
    // Check for success indicators in response
    const hasSuccessKeyword = 
      responseStr.includes('success') ||
      responseStr.includes('delivered') ||
      responseStr.includes('sent');
    
    // Success conditions:
    // 1. statusCode is 200
    // 2. Response is a string containing success keywords
    // 3. Response message contains success keywords
    const isSuccess = 
      response?.statusCode === 200 ||
      (typeof response === 'string' && hasSuccessKeyword) ||
      (response?.message && String(response.message).trim().toLowerCase().includes('success')) ||
      (response?.message && String(response.message).trim().toLowerCase().includes('delivered'));

    console.log("📧 Response String:", responseStr);
    console.log("📧 Has Success Keyword:", hasSuccessKeyword);
    console.log("📧 Is Success:", isSuccess);
    console.log("📧 Response Object:", JSON.stringify(response));

    if (isSuccess) {
      const successMessage = typeof response === 'string' 
        ? response 
        : response?.message || `OTP sent to ${emailValue}`;
      
      console.log("✅ OTP Sent Successfully - Setting states");
      console.log("✅ Setting showEmailOtpField to true");
      console.log("✅ Setting isEmailOtpSent to true");
      
      Alert.alert("Success", successMessage);
      
      // Set states to show OTP verification field
      setIsEmailOtpSent(true);
      setShowEmailOtpField(true);
      setLastSentEmail(emailValue);
      setEmailOtpEverSent(true);
      
      console.log("✅ States set successfully");
    } else {
      console.log("❌ OTP Send Failed - Response:", response);
      const errorMsg = typeof response === 'string' 
        ? response 
        : response?.message || "Failed to send OTP";
      Alert.alert("Error", errorMsg);
    }
  } catch (error: any) {
    console.error("Email OTP Error:", error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.data?.message ||
      error?.data ||
      error?.message ||
      "Failed to send OTP. Please try again.";
    Alert.alert("Error", errorMessage);
  } finally {
    setIsEmailOtpLoading(false);
  }
};

  // Handle Phone OTP send
  const handleSendPhoneOtp = async () => {
    if (!isValidPhone(phoneValue)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsPhoneOtpLoading(true);
    try {
      const response = await phoneOtpMutation.mutateAsync({
        flag: "organization",
        organizationPhoneNumber: phoneValue,
      });

      if (response.statusCode === 200 && response.verificationCode) {
        // Store encrypted OTP and IV
        setPhoneEncryptedOtp(response.verificationCode.encryptedOtp);
        setPhoneIv(response.verificationCode.iv);
        
        Alert.alert("Success", response.message || `OTP sent successfully  ${phoneValue}`);
        setIsPhoneOtpSent(true);
        setShowPhoneOtpField(true);
        setLastSentPhone(phoneValue);
        setPhoneTimer(90); // Start 1 minute timer
        setPhoneOtpEverSent(true); // Mark that OTP has been sent at least once
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Phone OTP Error:", error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message || 
        error?.message || 
        "Failed to send OTP. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsPhoneOtpLoading(false);
    }
  };

  // Handle Email OTP verification
  const handleVerifyEmailOtp = () => {
    console.log("📧 === EMAIL OTP VERIFICATION START ===");
    const otp = emailOtpCode.trim();
    console.log("📧 Entered OTP Length:", otp.length);
    console.log("📧 Has Encrypted OTP:", !!emailEncryptedOtp);
    console.log("📧 Has IV:", !!emailIv);

    if (!otp) {
      console.log("❌ Email OTP Verification Failed: Empty OTP");
      Alert.alert("Error", "Please enter verification code");
      return;
    }

    if (!emailEncryptedOtp || !emailIv) {
      console.log("❌ Email OTP Verification Failed: Missing encrypted data");
      Alert.alert("Error", "OTP data not available. Please request OTP again.");
      return;
    }

    try {
      console.log("📧 Starting decryption process...");
      console.log("📧 Encrypted OTP:", emailEncryptedOtp.substring(0, 20) + "...");
      console.log("📧 IV:", emailIv);

      // Get SECRET_KEY from environment
      let SECRET_KEY_HEX =
        (Config as any).REACT_APP_SECRET_KEY ||
        (Config as any).NEXT_PUBLIC_SECRET_KEY;

      // Fallback hardcoded value
      if (!SECRET_KEY_HEX) {
        SECRET_KEY_HEX =
          "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        console.log("⚠️ Using fallback SECRET_KEY");
      } else {
        console.log("✅ Using SECRET_KEY from config");
      }

      // Parse IV from hex
      const iv = CryptoJS.enc.Hex.parse(emailIv);
      console.log("✅ IV parsed successfully");

      // Parse SECRET_KEY from hex
      const secretKey = CryptoJS.enc.Hex.parse(SECRET_KEY_HEX);
      console.log("✅ Secret key parsed successfully");

      // Parse encrypted OTP from hex
      const encrypted = CryptoJS.enc.Hex.parse(emailEncryptedOtp);
      console.log("✅ Encrypted OTP parsed successfully");

      // Create CipherParams object
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encrypted,
      });
      console.log("✅ CipherParams created");

      // Decrypt using AES-256-CBC
      console.log("📧 Decrypting OTP...");
      const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedOtp = decrypted.toString(CryptoJS.enc.Utf8).trim();
      console.log("✅ Decryption completed");
      console.log("📧 Decrypted OTP Length:", decryptedOtp.length);
      console.log("📧 Entered OTP Length:", otp.length);
      console.log("📧 OTP Match:", decryptedOtp === otp);

      // Security: Don't log actual OTP values in production
      if (decryptedOtp && decryptedOtp === otp) {
        console.log("✅ Email OTP Verification SUCCESS");
        console.log("📧 Setting email as verified");
        Alert.alert("Success", "Email verified successfully!");
        setIsEmailOtpVerified(true); // Mark email as verified
        setShowEmailOtpField(false);
        setIsEmailOtpSent(false);
        setEmailOtpCode("");
        console.log("📧 === EMAIL OTP VERIFICATION SUCCESS ===");
      } else {
        console.log("❌ Email OTP Verification FAILED: OTP mismatch");
        console.log("📧 Decrypted OTP exists:", !!decryptedOtp);
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("❌ Email OTP Verification Error:", error);
      console.error("📧 Error Details:", JSON.stringify(error));
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    }
  };

  // Handle Phone OTP verification
// Handle Phone OTP verification
const handleVerifyPhoneOtp = () => {
  console.log("📱 === PHONE OTP VERIFICATION START ===");
  const otp = phoneOtpCode.trim();
  console.log("📱 Entered OTP Length:", otp.length);
  console.log("📱 Has Encrypted OTP:", !!phoneEncryptedOtp);
  console.log("📱 Has IV:", !!phoneIv);

  if (!otp) {
    console.log("❌ Phone OTP Verification Failed: Empty OTP");
    Alert.alert("Error", "Please enter verification code");
    return;
  }

  if (!phoneEncryptedOtp || !phoneIv) {
    console.log("❌ Phone OTP Verification Failed: Missing encrypted data");
    Alert.alert("Error", "OTP data not available. Please request OTP again.");
    return;
  }

  try {
    console.log("📱 Starting decryption process...");
    console.log("📱 Encrypted OTP:", phoneEncryptedOtp.substring(0, 20) + "...");
    console.log("📱 IV:", phoneIv);

    // Get SECRET_KEY from environment
    let SECRET_KEY_HEX =
      (Config as any).REACT_APP_SECRET_KEY ||
      (Config as any).NEXT_PUBLIC_SECRET_KEY;

    // Fallback hardcoded value
    if (!SECRET_KEY_HEX) {
      SECRET_KEY_HEX =
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
      console.log("⚠️ Using fallback SECRET_KEY");
    } else {
      console.log("✅ Using SECRET_KEY from config");
    }

    // Parse IV from hex
    const iv = CryptoJS.enc.Hex.parse(phoneIv);
    console.log("✅ IV parsed successfully");

    // Parse SECRET_KEY from hex
    const secretKey = CryptoJS.enc.Hex.parse(SECRET_KEY_HEX);
    console.log("✅ Secret key parsed successfully");

    // Parse encrypted OTP from hex
    const encrypted = CryptoJS.enc.Hex.parse(phoneEncryptedOtp);
    console.log("✅ Encrypted OTP parsed successfully");

    // Create CipherParams object
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encrypted,
    });
    console.log("✅ CipherParams created");

    // Decrypt using AES-256-CBC
    console.log("📱 Decrypting OTP...");
    const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedOtp = decrypted.toString(CryptoJS.enc.Utf8).trim();
    console.log("✅ Decryption completed");
    console.log("📱 Decrypted OTP Length:", decryptedOtp.length);
    console.log("📱 Entered OTP Length:", otp.length);
    console.log("📱 OTP Match:", decryptedOtp === otp);

    // Security: Don't log actual OTP values in production
    if (decryptedOtp && decryptedOtp === otp) {
      console.log("✅ Phone OTP Verification SUCCESS");
      console.log("📱 Setting phone as verified");
      Alert.alert("Success", "Phone number verified successfully!");
      setIsPhoneOtpVerified(true); // Mark phone as verified
      setShowPhoneOtpField(false);
      setIsPhoneOtpSent(false);
      setPhoneOtpCode("");
      setPhoneTimer(0);
      console.log("📱 === PHONE OTP VERIFICATION SUCCESS ===");
    } else {
      console.log("❌ Phone OTP Verification FAILED: OTP mismatch");
      console.log("📱 Decrypted OTP exists:", !!decryptedOtp);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("❌ Phone OTP Verification Error:", error);
    console.error("📱 Error Details:", JSON.stringify(error));
    Alert.alert("Error", "Failed to verify OTP. Please try again.");
  }
};

  // Handle email change
  const handleEmailChange = (text: string, onChange: any) => {
    setEmailValue(text);
    onChange(text);
    
    // Reset verification state if email changes
    if (text !== lastSentEmail) {
      setIsEmailOtpVerified(false);
      if (isEmailOtpSent) {
        setIsEmailOtpSent(false);
      }
    }
  };

  // Handle phone change
  const handlePhoneChange = (text: string, onChange: any) => {
    setPhoneValue(text);
    onChange(text);
    
    // Reset verification state if phone changes
    if (text !== lastSentPhone) {
      setIsPhoneOtpVerified(false);
      if (isPhoneOtpSent) {
        setPhoneTimer(0);
        setIsPhoneOtpSent(false);
      }
    }
  };

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 90);
    const secs = seconds % 90;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderInput = (
    name: keyof TCreateOrgForm,
    placeholder: string,
    rules?: any,
    props?: any
  ) => (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <TextInput
            {...props}
            value={field.value}
            onChangeText={field.onChange}
            placeholder={placeholder}
            placeholderTextColor="#808080"
            style={[
              styles.input,
              errors[name] && styles.inputError,
            ]}
          />
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>
          {errors[name]?.message as string}
        </Text>
      )}
    </>
  );

  return (
    <SafeView>
      <AppHeader
        title="Create Organization"
        showDrawer={false}
        handleBackClick={() => navigation.goBack()}
      />

      <Flex justify="center" mt={20}>
        <AutoHeightImage source={IMAGES.approveImage} width={150} />
      </Flex>

      <ThemeScrollView contentContainerStyle={styles.scrollContent}>

        {/* Organization Name */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization name *" />
          {renderInput("organizationName", "Enter organization name", {
            required: "Organization name is required",
          })}
        </View>

        {/* Website */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization website URL" />
          {renderInput("website", "https://example.com")}
        </View>

        {/* Logo */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization logo" />
          <TouchableOpacity
            style={styles.certBtn}
            onPress={handleSelectLogoImage}
          >
            <Text style={styles.certTxt}>
              {logoImageUri ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>

          {logoImageUri ? (
            <>
              <Image source={{ uri: logoImageUri }} style={styles.preview} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleClearLogoImage}
              >
                <Text style={styles.removeTxt}>Remove Image</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* City */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization city *" />
          {renderInput("city", "Enter city", {
            required: "City is required",
          })}
        </View>

        {/* State */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization state *" />
          {renderInput("state", "Enter state", {
            required: "State is required",
          })}
        </View>

        {/* Country */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization country *" />
          {renderInput("country", "Enter country", {
            required: "Country is required",
          })}
        </View>

        {/* Pincode */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization pincode *" />
          {renderInput(
            "pincode",
            "Enter pincode",
            {
              required: "Pincode is required",
              pattern: {
                value: /^[0-9]{5,6}$/,
                message: "Enter valid pincode",
              },
            },
            { keyboardType: "numeric" }
          )}
        </View>

        {/* Email with OTP */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization e-mail *" />
          <View style={styles.emailInputContainer}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter valid email",
                },
              }}
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={(text) => handleEmailChange(text, field.onChange)}
                  placeholder="example@company.com"
                  placeholderTextColor="#808080"
                  keyboardType="email-address"
                  style={styles.emailInputWithButton}
                />
              )}
            />
            
            <TouchableOpacity
              style={[
                styles.otpButtonInside,
                !isEmailOtpButtonEnabled() && styles.otpButtonDisabled,
              ]}
              onPress={handleSendEmailOtp}
              disabled={!isEmailOtpButtonEnabled()}
            >
              <Text style={[
                styles.otpButtonText,
                !isEmailOtpButtonEnabled() && styles.otpButtonTextDisabled,
              ]}>
                {isEmailOtpLoading
                  ? "SENDING..."
                  : emailOtpEverSent
                  ? "RESEND"
                  : "OTP"}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.email && (
            <Text style={styles.errorText}>
              {errors.email.message as string}
            </Text>
          )}

          {/* Email OTP Verification Field */}
          {showEmailOtpField && (
            <View style={styles.otpVerifyWrapper}>
              <Label text="Verification code" />
              <View style={styles.verifyInputContainer}>
                <TextInput
                  value={emailOtpCode}
                  onChangeText={setEmailOtpCode}
                  placeholder="Enter code"
                  placeholderTextColor="#808080"
                  keyboardType="numeric"
                  style={styles.verifyInputWithButton}
                  maxLength={6}
                />
                <TouchableOpacity
                  style={styles.verifyButtonInside}
                  onPress={handleVerifyEmailOtp}
                >
                  <Text style={styles.verifyButtonText}>VERIFY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Phone with OTP */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization phone number *" />
          <View style={styles.emailInputContainer}>
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter valid phone number",
                },
              }}
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={(text) => handlePhoneChange(text, field.onChange)}
                  placeholder="Enter phone number"
                  placeholderTextColor="#808080"
                  keyboardType="phone-pad"
                  style={styles.emailInputWithButton}
                  maxLength={10}
                />
              )}
            />
            
            <TouchableOpacity
              style={[
                styles.otpButtonInside,
                !isPhoneOtpButtonEnabled() && styles.otpButtonDisabled,
              ]}
              onPress={handleSendPhoneOtp}
              disabled={!isPhoneOtpButtonEnabled()}
            >
              <Text style={[
                styles.otpButtonText,
                !isPhoneOtpButtonEnabled() && styles.otpButtonTextDisabled,
              ]}>
                {isPhoneOtpLoading ? "SENDING..." : phoneTimer > 0 ? formatTimer(phoneTimer) : phoneOtpEverSent ? "RESEND" : "OTP"}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>
              {errors.phone.message as string}
            </Text>
          )}

          {/* Phone OTP Verification Field */}
          {showPhoneOtpField && (
            <View style={styles.otpVerifyWrapper}>
              <Label text="Verification code" />
              <View style={styles.verifyInputContainer}>
                <TextInput
                  value={phoneOtpCode}
                  onChangeText={setPhoneOtpCode}
                  placeholder="Enter code"
                  placeholderTextColor="#808080"
                  keyboardType="numeric"
                  style={styles.verifyInputWithButton}
                  maxLength={6}
                />
                <TouchableOpacity
                  style={styles.verifyButtonInside}
                  onPress={handleVerifyPhoneOtp}
                >
                  <Text style={styles.verifyButtonText}>VERIFY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.fieldWrapper}>
          <Label text="Organization address *" />
          {renderInput(
            "address",
            "Enter address",
            { required: "Address is required" },
            { multiline: true }
          )}
        </View>

        {/* About */}
        <View style={styles.fieldWrapper}>
          <Label text="About organization" />
          {renderInput(
            "about",
            "Write about organization (max 500 words)",
            {},
            { multiline: true }
          )}
        </View>

        {/* GST */}
        <View style={styles.fieldWrapper}>
          <Label text="Enable GST?" />
          <Controller
            control={control}
            name="enableGst"
            render={({ field }) => (
              <Flex direction="row" mt={8} gap={40}>
                {["YES", "NO"].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.radioRow, { marginHorizontal: 4 }]}  
                    onPress={() => {
                      field.onChange(option);
                      
                      if (option === "YES" && !isGstConfigured) {
                        setShowGST(true);
                      }

                      if (option === "NO") {
                        setIsGstConfigured(false);
                        setGstResetKey((p) => p + 1);
                      }
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {field.value === option && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </Flex>
            )}
          />
        </View>

       {/* TERMS */}
        <View style={styles.fieldWrapper}>
          <Controller
            control={control}
            name="acceptTerms"
            rules={{ required: "Please accept terms and conditions" }}
            render={({ field }) => (
              <>
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => field.onChange(!field.value)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      field.value && styles.checkboxChecked,
                    ]}
                  >
                    {field.value && (
                      <Icon name="check" size={14} color={COLORS.white} />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    Accept{" "}
                    <Text 
                      style={styles.termsLink}
                      onPress={(e) => {
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                    >
                      Terms and Conditions
                    </Text>
                  </Text>
                </TouchableOpacity>
                {errors.acceptTerms && (
                  <Text style={styles.errorText}>
                    {errors.acceptTerms.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        {/* Submit */}
        <Button
          title="CREATE ORGANIZATION"
          btnStyles={styles.createBtn}
          btnTxtStyles={{ color: "#fff", fontSize: 16 }}
          onPress={handleSubmit(onSubmit)}
          loading={createOrganizationMutation.isPending || validateOrgEmailPhoneMutation.isPending}
          disabled={createOrganizationMutation.isPending || validateOrgEmailPhoneMutation.isPending}
        />
      </ThemeScrollView>

      <GSTModal
        visible={showGST}
        resetKey={gstResetKey}
        onSave={(gstData: any) => {
          setIsGstConfigured(true);
          setGstData(gstData);
        }}
        onClose={() => setShowGST(false)}
        onCancel={() => {
          setShowGST(false);
          setIsGstConfigured(false);
          setValue("enableGst", "NO");
          setGstResetKey((p) => p + 1);
        }}
      />
      {/* ✅ Terms Modal - YEH ADD KARO */}
      <TermsAndConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </SafeView>
  );
};

export default CreateOrganization;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  fieldWrapper: {
    width: 260,
    alignSelf: "center",
    marginTop: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000000",
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    
  },

  input: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    
  },

  inputError: { borderColor: "red" },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },

  logoBox: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 10,
    width: 260,
  },

  logoText: {
    color: "#888",
    fontSize: 14,
  },

  certBtn: {
    backgroundColor: '#004C93',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  certTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'contain',
  },
  removeBtn: {
    width: '100%',
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  removeTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Email/Phone OTP Styles
  emailInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
  },

  emailInputWithButton: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 80,
    fontSize: 14,
  },

  otpButtonInside: {
    position: "absolute",
    right: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 65,
    alignItems: "center",
  },

  otpButtonDisabled: {
    backgroundColor: "#ccc",
  },

  otpButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  otpButtonTextDisabled: {
    color: "#888",
  },

  otpVerifyWrapper: {
    marginTop: 12,
  },

  verifyInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },

  verifyInputWithButton: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 90,
    fontSize: 14,
  },

  verifyButtonInside: {
    position: "absolute",
    right: 4,
    backgroundColor: '#004C93',
   
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
  },

  verifyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  radioRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: { 
    backgroundColor: COLORS.primary,
  },

  termsText: { fontSize: 13 },

  termsLink: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },

  createBtn: {
    marginTop: 30,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#6C63FF",
    width: 260,
    alignSelf: "center",
  },

  // GST Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: { fontSize: 18, fontWeight: "bold" },

  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 10 },

  labelRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    marginTop: 12,
  },

  infoIcon: { fontSize: 14 },

  gstTypeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3FF",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  gstTypeText: { fontSize: 14, fontWeight: "500" },

  gstinInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },

  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 15 
  },

  rightRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },

  editIcon: { fontSize: 16 },

  percentInput: { 
    width: 40, 
    borderBottomWidth: 1, 
    textAlign: "center" 
  },

  helperText: { 
    fontSize: 12, 
    color: "#777", 
    marginTop: 4 
  },

  totalText: { 
    marginTop: 20, 
    fontWeight: "600" 
  },

  totalValue: { 
    fontSize: 26, 
    color: COLORS.primary 
  },

  saveBtn: {
    marginTop: 20,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#6C63FF",
  },
}); 
