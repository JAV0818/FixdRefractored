// Sign-up view - wires the form to the useSignUp mutation.

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { AuthButton, AuthInput } from "../components";
import { useSignUp } from "../hooks/use-sign-up";
import { AUTH_COPY, AUTH_DEFAULTS } from "../auth.constants";
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

export const SignUpView = () => {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUp = useSignUp();

  const passwordTooShort = password.length > 0 && password.length < AUTH_DEFAULTS.passwordMinLength;

  const onSubmit = () => {
    signUp.mutate({ email, password, displayName });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={styles.title}>
        {AUTH_COPY.signUp.title}
      </Text>

      <AuthInput
        label={AUTH_COPY.signUp.displayNameLabel}
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />
      <AuthInput
        label={AUTH_COPY.signUp.emailLabel}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <AuthInput
        label={AUTH_COPY.signUp.passwordLabel}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={passwordTooShort ? "Password must be at least " + AUTH_DEFAULTS.passwordMinLength + " characters" : undefined}
      />

      {signUp.isError ? (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {AUTH_COPY.signUp.genericError}
        </Text>
      ) : null}

      <AuthButton
        label={AUTH_COPY.signUp.submit}
        isLoading={signUp.isPending}
        disabled={!email || passwordTooShort || !password}
        onPress={onSubmit}
      />
    </View>
  );
};
