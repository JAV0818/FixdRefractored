// MessageBubble — A chat message bubble aligned by sender.
// Own messages on the right, other messages on the left.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { Avatar } from "@/components/avatar";
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
  senderName,
  senderPhotoUrl,
}: MessageBubbleProps) {
  const { senderAvatar, senderName: messageSenderName, sentAt, text } = message;
  const own = Boolean(isOwnMessage);
  const displayName = senderName ?? messageSenderName;
  const photoUrl = senderPhotoUrl ?? senderAvatar;

  return (
    <View
      style={[styles.container, own ? styles.ownContainer : styles.otherContainer]}
      testID="message-bubble"
    >
      {!own && (
        <View style={styles.avatar}>
          <Avatar name={displayName} photoUrl={photoUrl} size={32} />
        </View>
      )}
      <View style={[styles.bubble, own ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, own ? styles.ownText : styles.otherText]}>{text}</Text>
        <Text style={[styles.timestamp, own ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatMessageTime(sentAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    marginRight: spacing.sm,
  },
  bubble: {
    borderRadius: radii.xl,
    gap: spacing.xxs,
    maxWidth: "78%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    width: "100%",
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  otherBubble: {
    backgroundColor: colors.glassSurface,
    borderBottomLeftRadius: radii.sm,
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  otherContainer: {
    alignItems: "flex-end",
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
    borderBottomRightRadius: radii.sm,
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
