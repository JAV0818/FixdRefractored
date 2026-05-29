// Composition shell for the customer Services home. No logic, no fetching —
// wraps the view in a SafeAreaView.

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

import { CustomerHomeView } from "./views";

export const CustomerHomePage = () => (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <CustomerHomeView />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
