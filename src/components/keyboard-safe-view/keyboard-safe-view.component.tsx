import { memo } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type KeyboardSafeViewProps = {
  children: React.ReactNode;
  /** Style applied to the outer KeyboardAvoidingView */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the ScrollView's content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Set false if you don't want the content to scroll (e.g. short forms) */
  scrollable?: boolean;
};

export const KeyboardSafeView = memo(function KeyboardSafeView({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
}: KeyboardSafeViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 16 },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
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
