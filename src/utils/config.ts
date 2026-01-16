// Safe wrapper for react-native-config
// Since react-native-config tries to access native module at require time,
// we avoid requiring it and use fallback values instead

// Fallback values from .env.production file
// These match the values in your .env.production file
const fallbackConfig = {
  REACT_APP_MODE: "prod",
  REACT_APP_API_BASE_QUERY: "https://karomanage-prod-apim.azure-api.net",
  REACT_APP_SUBSCRIPTION_HEADER: "Ocp-Apim-Subscription-Key",
  REACT_APP_SUBSCRIPTION_KEY: "0fd48d1f43c74b52af8792574b7978d1",
  REACT_APP_ENQUIRY_FORM: "https://enquiry.karomanage.com/",
  REACT_APP_FORM_BASE_URL: "https://enquiry.karomanage.com/",
  REACT_APP_MSAL_URL: "https://karomanageprod.b2clogin.com/karomanageprod.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_SignUp_SignIn_flow&client_id=98e97f52-89a9-436e-a459-5d24725f281c&nonce=defaultNonce&redirect_uri=com.karomanage.app%3A%2F%2Fcom.karomanage.app%2FAj1qDIwWtSiBfbTjlvfR8MJ91po&scope=openid&response_type=id_token&prompt=login",
  REACT_APP_NOTIFICATION_API_URL: "https://karomanage-prod-apim.azure-api.net/notification-hub-fnp-prod/getNotificationDetails",
  REACT_APP_BASE_URL_PROD: "https://karomanage-prod-apim.azure-api.net/EnquiryDetails-prod/getAllLeadsMobile",
};

// We don't try to load react-native-config because it throws errors when native module isn't initialized
// Instead, we use the fallback values directly which match .env.production

// Export the config object directly
// Since react-native-config native module isn't working, we use fallback values
export const AppConfig = new Proxy(fallbackConfig, {
  get(target, prop: string | symbol) {
    // Skip React internal properties and symbols
    if (typeof prop === "symbol" || prop.startsWith("$$") || prop.startsWith("__")) {
      return undefined;
    }
    
    // Return from fallback values (which match .env.production)
    if (prop in target) {
      return (target as any)[prop];
    }
    
    // Only warn for actual config properties, not React internals
    if (!prop.startsWith("$") && !prop.startsWith("_")) {
      // Silently return undefined for missing properties - don't spam console
      // console.warn(`Config property "${String(prop)}" not found, returning undefined`);
    }
    return undefined;
  },
});

export default AppConfig;
