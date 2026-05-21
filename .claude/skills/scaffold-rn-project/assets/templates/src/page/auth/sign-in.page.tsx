// SignInPage — composition only. Wraps the SignInView in a SafeAreaView.
// No logic. No state. No data fetching. The view does all of that.

import { SafeAreaView } from "react-native-safe-area-context";

import { SignInView } from "./views/sign-in.view";

export const SignInPage = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <SignInView />
  </SafeAreaView>
);
