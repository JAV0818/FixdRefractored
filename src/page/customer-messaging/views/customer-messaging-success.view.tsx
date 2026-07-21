import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ConversationListItem } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import type { CometChatConversation } from "@/services/comet-chat-service";

import { CUSTOMER_MESSAGING_COPY } from "../customer-messaging.constants";

type CustomerMessagingSuccessViewProps = {
  conversations: CometChatConversation[];
};

export const CustomerMessagingSuccessView = ({
  conversations,
}: CustomerMessagingSuccessViewProps) => {
  const router = useRouter();

  const openChat = useCallback(
    (conversationId: string) => {
      router.push({
        // The dynamic chat route is implemented in TICKET-06; cast until it exists.
        pathname: "/(customer-tabs)/messages/[conversationId]" as any,
        params: { conversationId },
      });
    },
    [router],
  );

  if (conversations.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="chatbubble-outline" size={64} color={colors.textDisabled} />
        <Text style={styles.emptyTitle}>{CUSTOMER_MESSAGING_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{CUSTOMER_MESSAGING_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={conversations}
      keyExtractor={(conversation) => conversation.conversationId}
      renderItem={({ item }) => (
        <ConversationListItem
          conversation={item}
          onPress={() => openChat(item.conversationWith.uid)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  list: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
});
