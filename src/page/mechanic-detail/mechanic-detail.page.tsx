// Composition shell for the admin mechanic detail screen. Uses Stack.Screen to
// show a back-button header. The mechanicId is read from route params in the view.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { MECHANIC_DETAIL_COPY } from "./mechanic-detail.constants";
import { MechanicDetailView } from "./views";

export const MechanicDetailPage = () => (
  <>
    <Stack.Screen
      options={{
        headerShown: true,
        title: MECHANIC_DETAIL_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    />
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <MechanicDetailView />
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
