// WelcomePage — composition only. Wraps the WelcomeView in a SafeAreaView.
// The view is where the four-state pattern lives.

import { SafeAreaView } from "react-native-safe-area-context";

import { WelcomeView } from "./views/welcome.view";

export const WelcomePage = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <WelcomeView />
  </SafeAreaView>
);
