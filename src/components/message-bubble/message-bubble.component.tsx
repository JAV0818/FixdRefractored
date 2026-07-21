// MessageBubble — A chat message bubble aligned by sender, showing text and timestamp.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, fontSize, fontWeight, lineHeight, radii, spacing } from "@/theme";

import type { MessageBubbleProps } from "./message-bubble.interface";

const formatMessageTime = (sentAt: number): string => {
  return new Date(sentAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const MessageBubble = memo(function MessageBubble({
  isOwnMessage,
  message,
}: MessageBubbleProps) {
  const { text, sentAt } = message;

  return (
    <View
      style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}
      testID="message-bubble"
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
          {text}
        </Text>
        <Text style={[styles.timestamp, isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatMessageTime(sentAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    borderRadius: radii.lg,
    gap: spacing.xs,
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  otherBubble: {
    backgroundColor: colors.surfaceVariant,
  },
  otherContainer: {
    justifyContent: "flex-start",
  },
  otherText: {
    color: colors.textPrimary,
  },
  otherTimestamp: {
    color: colors.textSecondary,
  },
  ownBubble: {
    backgroundColor: colors.primary,
  },
  ownContainer: {
    justifyContent: "flex-end",
  },
  ownText: {
    color: colors.onPrimary,
  },
  ownTimestamp: {
    color: colors.onDarkMuted,
  },
  timestamp: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: "right",
  },
});
