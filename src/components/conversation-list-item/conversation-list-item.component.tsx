// ConversationListItem — A tappable row showing the other party in a conversation,
// last message preview, timestamp, and unread badge.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { Avatar } from "@/components/avatar";
import { colors, fontSize, fontWeight, radii, spacing } from "@/theme";

import type { ConversationListItemProps } from "./conversation-list-item.interface";

const FALLBACK_MESSAGE = "No messages yet";

const formatMessageTime = (sentAt: number): string => {
  return new Date(sentAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const ConversationListItem = memo(function ConversationListItem({
  conversation,
  onPress,
}: ConversationListItemProps) {
  const { conversationWith, lastMessage, unreadMessageCount } = conversation;
  const hasUnread = unreadMessageCount > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
      testID="conversation-list-item"
    >
      <Avatar name={conversationWith.name} size={48} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {conversationWith.name}
          </Text>
          {lastMessage ? (
            <Text style={styles.timestamp}>{formatMessageTime(lastMessage.sentAt)}</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {lastMessage?.text ?? FALLBACK_MESSAGE}
          </Text>
          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadMessageCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    height: spacing.lg,
    justifyContent: "center",
    minWidth: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  lastMessage: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSize.sm,
  },
  name: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  timestamp: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
});
