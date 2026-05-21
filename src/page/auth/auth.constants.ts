// Copy, defaults, labels for the auth feature. Keep user-facing strings here
// so they're easy to swap (and easy to localize later).

export const AUTH_COPY = {
  signIn: {
    title: "Welcome back",
    submit: "Sign in",
    emailLabel: "Email",
    passwordLabel: "Password",
    switchPrompt: "Don't have an account?",
    switchAction: "Sign up",
    genericError: "Could not sign you in. Check your credentials and try again.",
  },
  signUp: {
    title: "Create your account",
    submit: "Sign up",
    emailLabel: "Email",
    passwordLabel: "Password",
    displayNameLabel: "Display name",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
    genericError: "Could not create your account. Try again in a moment.",
  },
  welcome: {
    title: "You're in",
    bodyLoading: "Loading your profile…",
    bodyError: "Something went wrong loading your profile.",
    bodyEmpty: "We couldn't find your profile yet. Try refreshing.",
    retry: "Try again",
  },
} as const;

export const AUTH_DEFAULTS = {
  passwordMinLength: 8,
} as const;
