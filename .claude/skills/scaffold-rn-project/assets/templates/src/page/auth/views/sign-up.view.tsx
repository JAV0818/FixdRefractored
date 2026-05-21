// Sign-up view — wires the form to the useSignUp mutation.

import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

import { AuthButton, AuthInput } from "../components";
import { useSignUp } from "../hooks/use-sign-up";
import { AUTH_COPY, AUTH_DEFAULTS } from "../auth.constants";
import { spacing } from "@/theme";

export const SignUpView = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUp = useSignUp();

  const passwordTooShort = password.length > 0 && password.length < AUTH_DEFAULTS.passwordMinLength;

  const onSubmit = () => {
    signUp.mutate({ email, password, displayName });
  };

  return (
    <View style={{ padding: spacing.lg }}>
      <Text variant="headlineSmall" style={{ marginBottom: spacing.lg }}>
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
        error={passwordTooShort ? `Password must be at least ${AUTH_DEFAULTS.passwordMinLength} characters` : undefined}
      />

      {signUp.isError ? (
        <Text variant="bodySmall" style={{ color: "#D6394A", marginTop: spacing.xs }}>
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
