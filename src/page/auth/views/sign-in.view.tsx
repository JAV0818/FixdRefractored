import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";

import { KeyboardSafeView } from "@/components";
import { AuthButton, AuthInput } from "../components";
import { useSignIn } from "../hooks/use-sign-in";
import { AUTH_COPY } from "../auth.constants";
import { colors, fontFamily, fontSize, fontWeight, spacing, radii } from "@/theme";

export const SignInView = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignIn();

  return (
    <KeyboardSafeView contentContainerStyle={styles.contentContainer}>
      <View style={styles.spacer} />
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
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  spacer: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.overlayDark,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 32, // one-off display heading — no matching token
    fontFamily: fontFamily.displayBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
