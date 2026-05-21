// Sign-in view - wires the form to the useSignIn mutation.
//
// Theme-aware: pulls colors from useTheme() rather than hardcoding literals.
// Container fills the screen and centers content.

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { AuthButton, AuthInput } from "../components";
import { useSignIn } from "../hooks/use-sign-in";
import { AUTH_COPY } from "../auth.constants";
import { fontFamily, spacing } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamily.displayBold,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});

export const SignInView = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignIn();

  const onSubmit = () => {
    signIn.mutate({ email, password });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={styles.title}>
        {AUTH_COPY.signIn.title}
      </Text>

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
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {AUTH_COPY.signIn.genericError}
        </Text>
      ) : null}

      <AuthButton
        label={AUTH_COPY.signIn.submit}
        isLoading={signIn.isPending}
        disabled={!email || !password}
        onPress={onSubmit}
      />
    </View>
  );
};
