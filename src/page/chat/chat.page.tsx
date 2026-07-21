// Composition shell for the shared 1:1 chat screen (customer + provider).

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";

import { colors } from "@/theme";

import { ChatView } from "./views/chat.view";

export const ChatPage = () => {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ChatView conversationId={conversationId} orderId={orderId} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
