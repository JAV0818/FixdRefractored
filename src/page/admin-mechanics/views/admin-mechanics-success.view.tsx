import { memo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import type { MechanicProfile } from "@/types/user.interface";

import { ADMIN_MECHANICS_COPY } from "../admin-mechanics.constants";
import { MechanicListItem } from "../components";

type AdminMechanicsSuccessViewProps = {
  mechanics: MechanicProfile[];
};

type MechanicRowProps = {
  mechanic: MechanicProfile;
  onPress: (mechanicId: string) => void;
};

const MechanicRow = memo(function MechanicRow({ mechanic, onPress }: MechanicRowProps) {
  const handlePress = useCallback(() => onPress(mechanic.uid), [onPress, mechanic.uid]);
  return <MechanicListItem mechanic={mechanic} onPress={handlePress} />;
});

export const AdminMechanicsSuccessView = ({ mechanics }: AdminMechanicsSuccessViewProps) => {
  const router = useRouter();

  const openMechanic = useCallback(
    (mechanicId: string) => {
      router.push({
        pathname: "/(admin-tabs)/mechanics/[mechanicId]",
        params: { mechanicId },
      });
    },
    [router],
  );

  if (mechanics.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{ADMIN_MECHANICS_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{ADMIN_MECHANICS_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={mechanics}
      keyExtractor={(mechanic) => mechanic.uid}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <MechanicRow mechanic={item} onPress={openMechanic} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
