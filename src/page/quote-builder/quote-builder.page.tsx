// Composition shell for the mechanic's quote builder.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { QUOTE_BUILDER_COPY } from "./quote-builder.constants";
import { QuoteBuilderView } from "./views";

export const QuoteBuilderPage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: QUOTE_BUILDER_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <QuoteBuilderView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
