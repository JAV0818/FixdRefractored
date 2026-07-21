import { memo } from "react";
import { InputAccessoryView, Keyboard, Platform, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { colors, spacing } from "@/theme";

import type { InputAccessoryDoneBarProps } from "./input-accessory-done-bar.interface";

export const InputAccessoryDoneBar = memo(function InputAccessoryDoneBar({
  nativeID,
}: InputAccessoryDoneBarProps) {
  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.toolbar}>
        <AppButton variant="tertiary" onPress={Keyboard.dismiss}>
          Done
        </AppButton>
      </View>
    </InputAccessoryView>
  );
});

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outline,
  },
});
