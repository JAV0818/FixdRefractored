// MessageInputBar — A bottom bar with a text input and send button for composing messages.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo, useCallback, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppTextInput } from "@/components/app-text-input";
import { colors, spacing } from "@/theme";

import type { MessageInputBarProps } from "./message-input-bar.interface";

export const MessageInputBar = memo(function MessageInputBar({
  isLoading,
  onSend,
}: MessageInputBarProps) {
  const [text, setText] = useState("");
  const trimmedText = text.trim();
  const canSend = trimmedText.length > 0 && !isLoading;

  const handleSend = useCallback(() => {
    if (!canSend) return;

    onSend(trimmedText);
    setText("");
    Keyboard.dismiss();
  }, [canSend, onSend, trimmedText]);

  return (
    <View style={styles.container} testID="message-input-bar">
      <AppTextInput
        containerStyle={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!isLoading}
        multiline={false}
      />
      <AppButton
        variant="primary"
        onPress={handleSend}
        disabled={!canSend}
        loading={isLoading}
      >
        Send
      </AppButton>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.outline,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  input: {
    flex: 1,
  },
});
