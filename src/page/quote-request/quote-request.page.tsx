// Composition shell for the quote-request wizard. Configures a minimal header
// (back caret only, no title, background matched to the page) and wraps the
// view in a SafeAreaView.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { QuoteRequestView } from "./views";

export const QuoteRequestPage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: "",
        headerBackButtonDisplayMode: "minimal", // caret only — no "index" label
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false, // drop the divider line
        headerStyle: { backgroundColor: colors.background }, // match the page
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <QuoteRequestView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
