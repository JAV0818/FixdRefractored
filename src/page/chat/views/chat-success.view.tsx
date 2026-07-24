// Success state for the shared chat screen. Renders the conversation header,
// message list, order context header (when linked), and the message input bar.

import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { GlassCard, KeyboardSafeView, MessageBubble, MessageInputBar } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { useConversations } from "@/page/chat/hooks/use-conversations";
import { useOrder } from "@/hooks/use-order";
import { useAuthContext } from "@/providers/auth-provider";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import { formatDateTime } from "@/utils/format";
import type { CometChatMessage } from "@/services/comet-chat-service";

import { CHAT_COPY } from "../chat.constants";

type ChatSuccessViewProps = {
  conversationId: string;
  currentUserId?: string;
  isSending: boolean;
  messages: CometChatMessage[];
  onSend: (text: string) => void;
  orderId?: string;
};

export const ChatSuccessView = ({
  conversationId,
  currentUserId,
  isSending,
  messages,
  onSend,
  orderId,
}: ChatSuccessViewProps) => {
  const { role } = useAuthContext();
  const router = useRouter();
  const { data: conversations } = useConversations();
  const { data: order } = useOrder(orderId);

  // eslint-disable-next-line no-console
  console.log("[ChatSuccessView] orderId:", orderId, "order loaded:", !!order, "currentUserId:", currentUserId);

  const otherPartyName = useMemo(() => {
    const match = conversations?.find(
      (conversation) => conversation.conversationWith.uid === conversationId,
    );

    return match?.conversationWith.name ?? CHAT_COPY.headerPlaceholder;
  }, [conversations, conversationId]);

  const handleOrderPress = useCallback(() => {
    if (!orderId) return;

    const path =
      role === "provider"
        ? `/(provider-tabs)/queue/${orderId}`
        : `/(customer-tabs)/requests/${orderId}`;

    router.push(path as any);
  }, [orderId, role, router]);

  const renderItem = useCallback(
    ({ item }: { item: CometChatMessage }) => {
      // eslint-disable-next-line no-console
      console.log("[ChatSuccessView] message sender:", item.senderUid, "currentUser:", currentUserId);
      return <MessageBubble message={item} isOwnMessage={item.senderUid === currentUserId} />;
    },
    [currentUserId],
  );

  const orderLocation = useMemo(() => {
    if (!order?.locationDetails) return null;
    const { address, city, state, zip } = order.locationDetails;
    return [address, city, state, zip].filter(Boolean).join(", ");
  }, [order?.locationDetails]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: otherPartyName,
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <KeyboardSafeView scrollable={false} style={styles.container}>
        {order ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleOrderPress}>
            <GlassCard style={styles.orderHeader}>
              <View style={styles.orderHeaderRow}>
                <Ionicons name="car-outline" size={20} color={colors.primary} />
                <Text style={styles.orderHeaderTitle}>{order.vehicleInfo}</Text>
              </View>

              <View style={styles.orderHeaderRow}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.orderHeaderText}>{order.customerName}</Text>
              </View>

              {orderLocation ? (
                <View style={styles.orderHeaderRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.orderHeaderText} numberOfLines={1}>
                    {orderLocation}
                  </Text>
                </View>
              ) : null}

              {order.scheduledAt ? (
                <View style={styles.orderHeaderRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.orderHeaderText}>{formatDateTime(order.scheduledAt)}</Text>
                </View>
              ) : null}
            </GlassCard>
          </TouchableOpacity>
        ) : null}

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {CHAT_COPY.emptyTitle}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyBody}>
              {CHAT_COPY.emptyBody}
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputBarContainer}>
          <MessageInputBar onSend={onSend} isLoading={isSending} />
        </View>
      </KeyboardSafeView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyBody: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  inputBarContainer: {
    marginBottom: TAB_BAR_CLEARANCE,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  orderHeader: {
    gap: spacing.xs,
    margin: spacing.md,
    marginBottom: 0,
  },
  orderHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  orderHeaderText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSize.sm,
  },
  orderHeaderTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
