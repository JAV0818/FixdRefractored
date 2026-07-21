// SignInPage — Lottie fills the screen, form floats at the bottom.
// The form itself is wrapped in KeyboardSafeView inside SignInView.

import { StyleSheet, View, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

import { colors } from "@/theme";
import { SignInView } from "./views/sign-in.view";

const { width, height } = Dimensions.get("window");

export const SignInPage = () => (
  <View style={styles.container}>
    {/* Full-screen background animation — no overlay */}
    <LottieView
      source={require("../../../assets/animations/road-assist.json")}
      autoPlay
      loop
      style={styles.animation}
    />

    {/* Form card with its own dark background and keyboard-aware wrapper */}
    <SignInView />
  </View>
);

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
});
