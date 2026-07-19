// AssignMechanicDialog — a Paper Dialog listing active mechanics for the
// owner/admin to assign one to an order. Presentational: data + callbacks in,
// pixels out.

import { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Dialog, Portal, Text, TouchableRipple } from "react-native-paper";

import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";
import type { MechanicProfile } from "@/types/user.interface";

const DIALOG_MAX_HEIGHT = 400;

type AssignMechanicDialogProps = {
  assigningId: string | null;
  error: string | null;
  loading: boolean;
  mechanics: MechanicProfile[];
  onDismiss: () => void;
  onSelect: (mechanic: MechanicProfile) => void;
  visible: boolean;
};

const listContainerStyle = { maxHeight: DIALOG_MAX_HEIGHT };

export const AssignMechanicDialog = memo(function AssignMechanicDialog({
  assigningId,
  error,
  loading,
  mechanics,
  onDismiss,
  onSelect,
  visible,
}: AssignMechanicDialogProps) {
  const activeMechanics = mechanics.filter((m) => m.isActive);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Assign to mechanic</Dialog.Title>
        <Dialog.Content>
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading mechanics...</Text>
            </View>
          )}

          {error && (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && activeMechanics.length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No active mechanics available.</Text>
            </View>
          )}

          {!loading && !error && activeMechanics.length > 0 && (
            <ScrollView style={listContainerStyle} showsVerticalScrollIndicator={false}>
              {activeMechanics.map((mechanic) => (
                <TouchableRipple
                  key={mechanic.uid}
                  onPress={() => onSelect(mechanic)}
                  style={styles.row}
                  disabled={assigningId === mechanic.uid}
                >
                  <View style={styles.rowContent}>
                    <View style={styles.rowInfo}>
                      <Text style={styles.mechanicName}>{mechanic.name}</Text>
                      <Text style={styles.mechanicEmail}>{mechanic.email}</Text>
                    </View>
                    {assigningId === mechanic.uid && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                  </View>
                </TouchableRipple>
              ))}
            </ScrollView>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <TouchableRipple onPress={onDismiss} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableRipple>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
});

const styles = StyleSheet.create({
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  mechanicEmail: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  mechanicName: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  row: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
});
