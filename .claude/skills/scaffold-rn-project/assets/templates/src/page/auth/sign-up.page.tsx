// SignUpPage — composition only.

import { SafeAreaView } from "react-native-safe-area-context";

import { SignUpView } from "./views/sign-up.view";

export const SignUpPage = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <SignUpView />
  </SafeAreaView>
);
