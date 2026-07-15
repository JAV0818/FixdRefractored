// ChangePasswordPage — update Firebase Auth password screen.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { colors } from "@/theme";

import { CHANGE_PASSWORD_COPY } from "./change-password.constants";
import { ChangePasswordView } from "./views/change-password.view";

export const ChangePasswordPage = () => (
  <SafeAreaView style={styles.container} edges={["bottom"]}>
    <Stack.Screen
      options={{
        headerShown: true,
        title: CHANGE_PASSWORD_COPY.title,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
    <ChangePasswordView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
