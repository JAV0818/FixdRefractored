// PerformanceDetailsPage — mechanic's earnings and job history screen.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { PERFORMANCE_COPY } from "./performance-details.constants";
import { PerformanceDetailsView } from "./views/performance-details.view";

export const PerformanceDetailsPage = () => (
  <SafeAreaView style={styles.container} edges={["bottom"]}>
    <Stack.Screen
      options={{
        headerShown: true,
        title: PERFORMANCE_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
    <PerformanceDetailsView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
