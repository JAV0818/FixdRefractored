import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { AuthButton, AuthInput } from "../components";
import { useSignIn } from "../hooks/use-sign-in";
import { AUTH_COPY } from "../auth.constants";
import { colors, fontFamily, spacing, radii } from "@/theme";

export const SignInView = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignIn();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your Fixd account</Text>

      <AuthInput
        label={AUTH_COPY.signIn.emailLabel}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <AuthInput
        label={AUTH_COPY.signIn.passwordLabel}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {signIn.isError ? (
        <Text style={styles.errorText}>{AUTH_COPY.signIn.genericError}</Text>
      ) : null}

      <AuthButton
        label={AUTH_COPY.signIn.submit}
        isLoading={signIn.isPending}
        disabled={!email || !password}
        onPress={() => signIn.mutate({ email, password })}
      />

      <TouchableOpacity
        style={styles.signUpRow}
        onPress={() => router.push("/(auth)/sign-up")}
      >
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <Text style={[styles.signUpText, styles.signUpLink]}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.overlayDark,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily.displayBold,
    color: colors.onPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.onDarkMuted,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.dangerOnDark,
    fontSize: 13,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: 14,
    color: colors.onDarkMuted,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
