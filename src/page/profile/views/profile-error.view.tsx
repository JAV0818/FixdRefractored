// Error state for the profile screen. Keeps sign-out reachable so a user whose
// profile doc failed to load (or doesn't exist) can still get out.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppButton } from "@/components";
import { useSignOut } from "@/page/auth/hooks/use-sign-out";
import { colors, fontSize, spacing } from "@/theme";

import { PROFILE_COPY } from "../profile.constants";

type ProfileErrorViewProps = {
  onRetry: () => void;
};

export const ProfileErrorView = ({ onRetry }: ProfileErrorViewProps) => {
  const signOut = useSignOut();
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{PROFILE_COPY.error}</Text>
      <AppButton onPress={onRetry}>{PROFILE_COPY.retry}</AppButton>
      <AppButton
        variant="tertiary"
        onPress={() => signOut.mutate()}
        loading={signOut.isPending}
        disabled={signOut.isPending}
      >
        {PROFILE_COPY.signOut}
      </AppButton>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
