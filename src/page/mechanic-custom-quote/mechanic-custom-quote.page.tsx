// Composition shell for the mechanic's custom-quote wizard.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { MECHANIC_CUSTOM_QUOTE_COPY } from "./mechanic-custom-quote.constants";
import { MechanicCustomQuoteView } from "./views";

export const MechanicCustomQuotePage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: MECHANIC_CUSTOM_QUOTE_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <MechanicCustomQuoteView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
