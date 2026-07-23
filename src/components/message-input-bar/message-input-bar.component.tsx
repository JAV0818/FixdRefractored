// MessageInputBar — Glassmorphism bottom bar with a text input and send button.
//
// Dumb component: props in, JSX out. No data fetching. No services. No
// load-bearing state. References theme tokens, never literal values.

import { memo, useCallback, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { colors, fontSize, radii, shadows, spacing } from "@/theme";

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
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          mode="flat"
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textDisabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isLoading}
          multiline
          numberOfLines={1}
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{ colors: { background: "transparent", onSurface: colors.textPrimary } }}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        >
          <Ionicons name="send" size={20} color={canSend ? colors.onPrimary : colors.textDisabled} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.glassSurface,
    borderColor: colors.glassBorder,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.glass,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: colors.textPrimary,
    fontSize: fontSize.base,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 0,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sendButtonDisabled: {
    backgroundColor: colors.glassSurfaceHighlight,
  },
});
