// ProviderProfileEditPage — edit bio, specialties, experience, and avatar.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { PROFILE_EDIT_COPY } from "./provider-profile-edit.constants";
import { ProviderProfileEditView } from "./views/provider-profile-edit.view";

export const ProviderProfileEditPage = () => (
  <SafeAreaView style={styles.container} edges={["bottom"]}>
    <Stack.Screen
      options={{
        headerShown: true,
        title: PROFILE_EDIT_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
    <ProviderProfileEditView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
