// Error state for the provider profile edit screen.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, fontSize, spacing } from "@/theme";

import { PROFILE_EDIT_COPY } from "../provider-profile-edit.constants";

type ProviderProfileEditErrorViewProps = {
  onRetry: () => void;
};

export const ProviderProfileEditErrorView = ({
  onRetry,
}: ProviderProfileEditErrorViewProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{PROFILE_EDIT_COPY.errorGeneric}</Text>
    <AppButton onPress={onRetry}>Retry</AppButton>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
