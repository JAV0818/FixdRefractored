import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { ConversationListItem } from "@/components";
import { TAB_BAR_CLEARANCE } from "@/constants/layout";
import { colors, fontSize, fontWeight, spacing } from "@/theme";
import type { CometChatConversation } from "@/services/comet-chat-service";

import { PROVIDER_MESSAGING_COPY } from "../provider-messaging.constants";

type ProviderMessagingSuccessViewProps = {
  conversations: CometChatConversation[];
};

export const ProviderMessagingSuccessView = ({ conversations }: ProviderMessagingSuccessViewProps) => {
  const router = useRouter();

  const openConversation = useCallback(
    (conversationId: string) => {
      router.push({
        // The dynamic chat route is implemented in TICKET-06; cast until it exists.
        pathname: "/(provider-tabs)/messages/[conversationId]" as any,
        params: { conversationId },
      });
    },
    [router],
  );

  if (conversations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{PROVIDER_MESSAGING_COPY.emptyTitle}</Text>
        <Text style={styles.emptyBody}>{PROVIDER_MESSAGING_COPY.emptyBody}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(conversation) => conversation.conversationId}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ConversationListItem
          conversation={item}
          onPress={() => openConversation(item.conversationWith.uid)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
  },
});
