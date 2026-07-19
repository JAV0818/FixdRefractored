// Order-detail success view. Shared by customer + provider: it renders the order
// (identical for both) and delegates the role-specific actions to CustomerActions
// / ProviderActions, so each role only mounts its own hooks + side-effects.

import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { OrderStatusBadge } from "@/components";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { formatDateTime } from "@/utils/format";
import { useAuthContext } from "@/providers/auth-provider";
import { useUserProfile } from "@/page/auth/hooks/use-user-profile";
import type { RepairOrder } from "@/types/order.interface";

import { ORDER_DETAIL_COPY } from "../order-detail.constants";
import { DetailSection, OrderParty, PhotoGallery, QuoteSummary } from "../components";
import { AdminActions } from "./order-detail-admin-actions.view";
import { CustomerActions } from "./order-detail-customer-actions.view";
import { ProviderActions } from "./order-detail-provider-actions.view";

type OrderDetailSuccessViewProps = {
  order: RepairOrder;
};

const formatLocation = (order: RepairOrder): string =>
  [
    order.locationDetails.address,
    order.locationDetails.city,
    order.locationDetails.state,
    order.locationDetails.zip,
  ]
    .filter(Boolean)
    .join(", ");

export const OrderDetailSuccessView = ({ order }: OrderDetailSuccessViewProps) => {
  const { role, currentUser } = useAuthContext();
  const hasQuote = order.totalPrice > 0 || order.items.length > 0;

  // Show the other party — the mechanic to the customer, the customer to the
  // mechanic. Photo/phone come from their profile (not denormalized on the
  // order). The customer's phone is only shown to the assigned mechanic, not to
  // every mechanic browsing the pool.
  const isOwner = !!order.providerId && order.providerId === currentUser?.id;
  const otherPartyId = role === "customer" ? order.providerId : order.customerId;
  const otherParty = useUserProfile(otherPartyId ?? undefined);
  const partyName = role === "customer" ? order.providerName : order.customerName;
  const partyPhone =
    role === "customer" ? (otherParty.data?.phone ?? null) : isOwner ? order.customerPhone : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <OrderStatusBadge status={order.status} />
        <Text style={styles.heading}>{order.vehicleInfo}</Text>
      </View>

      {otherPartyId && partyName && (
        <DetailSection
          title={
            role === "customer"
              ? ORDER_DETAIL_COPY.sections.mechanic
              : ORDER_DETAIL_COPY.sections.customer
          }
        >
          <OrderParty name={partyName} photoUrl={otherParty.data?.photoUrl} phone={partyPhone} />
        </DetailSection>
      )}

      <DetailSection title={ORDER_DETAIL_COPY.sections.details}>
        <Text style={styles.body}>{order.description}</Text>
        {order.categories.length > 0 && (
          <Text style={styles.muted}>{order.categories.join(" · ")}</Text>
        )}
      </DetailSection>

      <DetailSection title={ORDER_DETAIL_COPY.sections.location}>
        <Text style={styles.body}>{formatLocation(order) || "—"}</Text>
      </DetailSection>

      {order.scheduledAt !== null && (
        <DetailSection title={ORDER_DETAIL_COPY.sections.when}>
          <Text style={styles.body}>{formatDateTime(order.scheduledAt)}</Text>
        </DetailSection>
      )}

      {order.mediaUrls.length > 0 && (
        <DetailSection title={ORDER_DETAIL_COPY.sections.photos}>
          <PhotoGallery uris={order.mediaUrls} />
        </DetailSection>
      )}

      {hasQuote && (
        <DetailSection title={ORDER_DETAIL_COPY.sections.quote}>
          <QuoteSummary
            items={order.items}
            laborCost={order.laborCost}
            partsCost={order.partsCost}
            totalPrice={order.totalPrice}
            depositAmount={order.depositAmount}
          />
        </DetailSection>
      )}

      {role === "owner" && <AdminActions order={order} />}
      {role === "customer" && <CustomerActions order={order} />}
      {role === "provider" && <ProviderActions order={order} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    // Clear the floating tab bar so the action buttons / hints aren't hidden.
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  header: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
