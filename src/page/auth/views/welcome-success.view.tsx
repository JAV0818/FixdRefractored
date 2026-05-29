// Success view — renders the signed-in user's profile.
//
// This is the "view" that the user actually sees when everything works.
// Empty cases (e.g., a freshly-created account with no profile fields)
// are handled inline at the top — empty is a sub-state of success, not a
// peer.

import { Card, Text } from "react-native-paper";

import { spacing } from "@/theme";

import { AUTH_COPY } from "../auth.constants";
import type { UserProfile } from "@/types/user.interface";

type WelcomeSuccessViewProps = {
  profile: UserProfile | null;
};

export const WelcomeSuccessView = ({ profile }: WelcomeSuccessViewProps) => {
  // Empty-as-sub-state: if there's no profile doc yet or no name, render an
  // onboarding nudge inline instead of an awkward "Hello, undefined".
  if (!profile?.firstName) {
    return (
      <Card mode="contained" style={{ margin: spacing.md }}>
        <Card.Content>
          <Text variant="titleLarge">{AUTH_COPY.welcome.title}</Text>
          <Text variant="bodyMedium" style={{ marginTop: spacing.xs, opacity: 0.7 }}>
            {AUTH_COPY.welcome.bodyEmpty}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card mode="contained" style={{ margin: spacing.md }}>
      <Card.Content>
        <Text variant="titleLarge">Hello, {profile.firstName}</Text>
        <Text variant="bodyMedium" style={{ marginTop: spacing.xs, opacity: 0.7 }}>
          {profile.email}
        </Text>
      </Card.Content>
    </Card>
  );
};
