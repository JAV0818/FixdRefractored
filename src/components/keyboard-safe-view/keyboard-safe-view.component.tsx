// KeyboardSafeView — the one wrapper every form/chat screen uses to keep inputs
// clear of the keyboard. Built on react-native-keyboard-controller, which tracks
// the native keyboard frame by frame and animates on the UI thread, so content
// moves in step with the keyboard (RN's built-in KeyboardAvoidingView reacts to
// a single JS event and drifts out of sync). Needs <KeyboardProvider> at the root.

import { memo } from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";

import { spacing } from "@/theme";

type KeyboardSafeViewProps = {
  children: React.ReactNode;
  /** Style applied to the outer container (the scroll view, or the avoiding view) */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the ScrollView's content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Set false if the screen owns its own scrolling (e.g. a FlatList, or a chat
   *  with a pinned input bar): content is pushed up as one block instead. */
  scrollable?: boolean;
};

export const KeyboardSafeView = memo(function KeyboardSafeView({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
}: KeyboardSafeViewProps) {
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // Space below the content that clears the home indicator. The keyboard covers that
  // area, so it shrinks to 0 as the keyboard opens and content rests directly on it
  // instead of floating ~50pt above. Driven by the keyboard's real height (negative
  // while open), not its 0..1 progress: progress is measured against a target that
  // moves when iOS adds or drops the AutoFill strip, leaving leftover space in one
  // field and none in another.
  const bottomSpace = useAnimatedStyle(() => ({
    height: Math.max(0, insets.bottom + 16 + keyboardHeight.value),
  }));

  if (!scrollable) {
    return (
      <KeyboardAvoidingView style={[styles.flex, style]} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, style]}
      // Scrolls the focused input into view, leaving this much room above the keyboard.
      bottomOffset={spacing.lg}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
      <Reanimated.View style={bottomSpace} />
    </KeyboardAwareScrollView>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
