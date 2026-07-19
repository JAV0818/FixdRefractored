// Composition shell for the owner Earnings tab.

import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { SignOutButton } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { useSignOut } from "@/page/auth/hooks/use-sign-out";

import { ADMIN_EARNINGS_COPY } from "./admin-earnings.constants";
import { AdminEarningsView } from "./views";

export const AdminEarningsPage = () => {
  const signOut = useSignOut();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{ADMIN_EARNINGS_COPY.title}</Text>
        <SignOutButton
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
          disabled={signOut.isPending}
        />
      </View>
      <AdminEarningsView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize["2.5xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
