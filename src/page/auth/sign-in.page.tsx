// SignInPage — Lottie fills the screen, form floats at the bottom.
// KeyboardAvoidingView wraps everything so the form lifts above the keyboard.

import { StyleSheet, View, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import { colors } from "@/theme";
import { SignInView } from "./views/sign-in.view";

const { width, height } = Dimensions.get("window");

export const SignInPage = () => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Full-screen background animation — no overlay */}
      <LottieView
        source={require("../../../assets/animations/road-assist.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Spacer pushes form to the bottom */}
      <View style={styles.spacer} />

      {/* Form card with its own dark background */}
      <View style={[styles.formWrapper, { paddingBottom: insets.bottom + 16 }]}>
        <SignInView />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.scrim,
  },
  animation: {
    position: "absolute",
    width,
    height,
  },
  spacer: {
    flex: 1,
  },
  formWrapper: {
    left: 0,
    right: 0,
  },
});
