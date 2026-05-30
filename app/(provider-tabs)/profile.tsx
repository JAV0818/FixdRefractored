import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components";

import { colors, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { useSignOut } from "@/page/auth/hooks/use-sign-out";

export default function ProviderProfileScreen() {
  const signOut = useSignOut();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text variant="headlineMedium" style={styles.title}>Profile</Text>
        <Text variant="bodyMedium" style={styles.sub}>Coming in M6</Text>
        <AppButton
          icon="logout"
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
          disabled={signOut.isPending}
          style={styles.signOut}
        >
          Sign Out
        </AppButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, paddingBottom: TAB_BAR_CLEARANCE },
  title: { fontWeight: "700", color: colors.textPrimary },
  sub: { marginTop: 8, color: colors.textSecondary },
  signOut: { marginTop: spacing.xl },
});
