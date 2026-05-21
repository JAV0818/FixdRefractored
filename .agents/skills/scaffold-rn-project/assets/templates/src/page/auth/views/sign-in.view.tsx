// Sign-in view — wires the form to the useSignIn mutation.
//
// This is a *form* view rather than a *fetch* view, so it doesn't follow
// the loading/error/empty/success pattern exactly — instead it tracks the
// mutation's pending/error states and renders inline feedback.

import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

import { AuthButton, AuthInput } from "../components";
import { useSignIn } from "../hooks/use-sign-in";
import { AUTH_COPY } from "../auth.constants";
import { spacing } from "@/theme";

export const SignInView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignIn();

  const onSubmit = () => {
    signIn.mutate({ email, password });
  };

  return (
    <View style={{ padding: spacing.lg }}>
      <Text variant="headlineSmall" style={{ marginBottom: spacing.lg }}>
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
        <Text variant="bodySmall" style={{ color: "#D6394A", marginTop: spacing.xs }}>
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
