// Copy + defaults for the customer Services home.

export const CUSTOMER_HOME_COPY = {
  greeting: (name: string) => `Hi ${name},`,
  subtitle: "What can we help you fix today?",
  emergency: {
    title: "Need help now?",
    subtitle: "Request urgent roadside assistance",
  },
  sections: {
    maintenance: "Maintenance",
    emergency: "Emergency",
  },
  ctaTitle: "Not sure what you need?",
  ctaSubtitle: "Describe the issue and get quotes from mechanics near you.",
  ctaButton: "Request a Quote",
  loading: "Loading your services…",
  error: "We couldn't load your home screen.",
  retry: "Try again",
} as const;
