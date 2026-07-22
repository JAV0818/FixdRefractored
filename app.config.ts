import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fixd",
  slug: "fixd",
  version: "0.1.0",
  sdkVersion: "54.0.0",
  orientation: "portrait",
  scheme: "fixd",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kingjuju.fixd",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
    },
    package: "com.kingjuju.fixd",
  },
  web: {
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "@react-native-community/datetimepicker",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 36,
          kotlinVersion: "2.0.21",
        },
      },
    ],
    [
      "@stripe/stripe-react-native",
      {
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: null,
        enableGooglePay: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "0f4ae8c0-e60d-454e-b2b6-e4cd49d3b7c5",
    },
  },
});
