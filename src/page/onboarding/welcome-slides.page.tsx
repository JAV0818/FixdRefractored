import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Onboarding from "react-native-onboarding-swiper";

import { colors, spacing } from "@/theme";
import { CUSTOMER_SLIDES, MECHANIC_SLIDES } from "./onboarding.constants";
import type { UserRole } from "@/types/user.interface";

const { width } = Dimensions.get("window");

const LottieImage = ({ source }: { source: unknown }) => (
  <View style={styles.animationContainer}>
    <LottieView
      source={source as object}
      autoPlay
      loop
      style={styles.animation}
    />
  </View>
);

export const WelcomeSlidesPage = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const insets = useSafeAreaInsets();
  const slides = role === "provider" ? MECHANIC_SLIDES : CUSTOMER_SLIDES;
  const nextRoute = role === "provider"
    ? "/(onboarding)/mechanic-profile"
    : "/(onboarding)/vehicle-setup";

  const pages = slides.map((slide) => ({
    backgroundColor: colors.background,
    image: <LottieImage source={slide.animation} />,
    title: slide.title,
    subtitle: slide.subtitle,
  }));

  return (
    <View style={styles.wrapper}>
      <Onboarding
        pages={pages}
        onDone={() => router.push({ pathname: nextRoute as never, params: { role } })}
        onSkip={() => router.push({ pathname: nextRoute as never, params: { role } })}
        bottomBarColor={colors.background}
        dotColor={colors.outline}
        dotColorSelected={colors.primary}
        titleStyles={styles.slideTitle}
        subTitleStyles={styles.slideSubtitle}
        containerStyles={styles.slideContainer}
        imageContainerStyles={styles.imageContainer}
      />
      {/* Fills the home indicator region with the background color */}
      <View style={[styles.safeAreaFill, { height: insets.bottom }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  slideSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeAreaFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  slideContainer: {
    paddingBottom: spacing.lg,
  },
  imageContainer: {
    paddingBottom: 0,
  },
});
