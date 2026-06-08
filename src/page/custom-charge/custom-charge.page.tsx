// Composition shell for the mechanic's custom-charge screen.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { CUSTOM_CHARGE_COPY } from "./custom-charge.constants";
import { CustomChargeView } from "./views";

export const CustomChargePage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: CUSTOM_CHARGE_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <CustomChargeView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
