// Success state for the shared chat screen. Renders the conversation header,
// message list, order snippet (when linked), and the message input bar.

import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text } from "react-native-paper";

import { AppCard, KeyboardSafeView, MessageBubble, MessageInputBar } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { useConversations } from "@/page/chat/hooks/use-conversations";
import { useAuthContext } from "@/providers/auth-provider";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
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
    ({ item }: { item: CometChatMessage }) => (
      <MessageBubble message={item} isOwnMessage={item.senderUid === currentUserId} />
    ),
    [currentUserId],
  );

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
        {orderId ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleOrderPress}>
            <AppCard style={styles.orderSnippet}>
              <Text variant="bodySmall" style={styles.orderSnippetLabel}>
                {CHAT_COPY.orderSnippetLabel}
              </Text>
              <Text variant="bodyMedium" style={styles.orderSnippetValue} numberOfLines={1}>
                #{orderId}
              </Text>
            </AppCard>
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
  orderSnippet: {
    margin: spacing.md,
    marginBottom: 0,
  },
  orderSnippetLabel: {
    color: colors.textSecondary,
  },
  orderSnippetValue: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
});
