// AdminActions — the owner/admin's status-aware actions on an order. View-tier:
// owns the admin-only hooks + side-effects (assign mechanic dialog).
// The shared order-detail-success view renders this only when role === "owner".

import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components";
import { spacing } from "@/theme";
import type { RepairOrder } from "@/types/order.interface";
import type { MechanicProfile } from "@/types/user.interface";

import { useMechanics } from "@/page/admin-mechanics/hooks/use-mechanics";

import { useAssignOrder } from "../hooks/use-assign-order";
import { AssignMechanicDialog } from "../components/assign-mechanic-dialog.component";

type AdminActionsProps = {
  order: RepairOrder;
};

export const AdminActions = ({ order }: AdminActionsProps) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const mechanics = useMechanics();
  const assignOrder = useAssignOrder();

  const showDialog = useCallback(() => setDialogVisible(true), []);
  const hideDialog = useCallback(() => {
    setDialogVisible(false);
    assignOrder.reset();
  }, [assignOrder]);

  const onSelectMechanic = useCallback(
    (mechanic: MechanicProfile) => {
      assignOrder.mutate(
        { orderId: order.id, providerId: mechanic.uid },
        { onSuccess: () => setDialogVisible(false) },
      );
    },
    [assignOrder, order.id],
  );

  const isPending = order.status === "Pending";
  const isAssigned = !!order.providerId;
  const buttonLabel = isAssigned ? "Re-assign mechanic" : "Assign to mechanic";

  // Only show assign button when order is Pending (no mechanic yet) or already
  // assigned (re-assign scenario).
  if (!isPending && !isAssigned) return null;

  return (
    <View style={styles.actions}>
      <AppButton onPress={showDialog}>{buttonLabel}</AppButton>

      <AssignMechanicDialog
        assigningId={assignOrder.isPending ? (assignOrder.variables?.providerId ?? null) : null}
        error={assignOrder.isError ? (assignOrder.error?.message ?? "Assignment failed") : null}
        loading={mechanics.isLoading}
        mechanics={mechanics.data ?? []}
        onDismiss={hideDialog}
        onSelect={onSelectMechanic}
        visible={dialogVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
