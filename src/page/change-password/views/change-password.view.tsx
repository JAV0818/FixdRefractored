// ChangePasswordView — form to update the user's Firebase Auth password. Owns
// the form state, validation, and mutation. Shows inline error messages.

import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { AppButton, AppTextInput, KeyboardSafeView } from "@/components";
import { spacing } from "@/theme";

import { CHANGE_PASSWORD_COPY } from "../change-password.constants";
import { useChangePassword } from "../hooks/use-change-password";

export const ChangePasswordView = () => {
  const router = useRouter();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(CHANGE_PASSWORD_COPY.errorMismatch);
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(CHANGE_PASSWORD_COPY.errorTooShort);
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert(CHANGE_PASSWORD_COPY.success, "", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          const message =
            error instanceof Error && error.message.includes("wrong-password")
              ? CHANGE_PASSWORD_COPY.errorWrongPassword
              : CHANGE_PASSWORD_COPY.errorGeneric;
          Alert.alert(message);
        },
      },
    );
  };

  const isBusy = changePassword.isPending;

  return (
    <KeyboardSafeView contentContainerStyle={styles.content}>
      <AppTextInput
        label={CHANGE_PASSWORD_COPY.currentPassword}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
      />
      <AppTextInput
        label={CHANGE_PASSWORD_COPY.newPassword}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <AppTextInput
        label={CHANGE_PASSWORD_COPY.confirmPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <AppButton onPress={onSubmit} loading={isBusy} disabled={isBusy}>
        {CHANGE_PASSWORD_COPY.save}
      </AppButton>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
