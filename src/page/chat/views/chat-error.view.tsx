// Error state for the shared chat screen.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { colors, spacing } from "@/theme";

import { CHAT_COPY } from "../chat.constants";

type ChatErrorViewProps = {
  onRetry: () => void;
};

export const ChatErrorView = ({ onRetry }: ChatErrorViewProps) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      Something went wrong
    </Text>
    <Text variant="bodyMedium" style={styles.message}>
      {CHAT_COPY.error}
    </Text>
    <AppButton onPress={onRetry}>{CHAT_COPY.retry}</AppButton>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg,
  },
  message: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  title: {
    color: colors.textPrimary,
  },
});
