import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";

import { AUTH_COPY } from "../auth.constants";
import { spacing } from "@/theme";

type WelcomeErrorViewProps = {
  onRetry: () => void;
};

export const WelcomeErrorView = ({ onRetry }: WelcomeErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium">Something went wrong</Text>
    <Text variant="bodyMedium" style={styles.message}>
      {AUTH_COPY.welcome.bodyError}
    </Text>
    <AppButton onPress={onRetry}>
      {AUTH_COPY.welcome.retry}
    </AppButton>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
  },
});
