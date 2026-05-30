// Copy for the shared (customer + provider) order-detail screen.

export const ORDER_DETAIL_COPY = {
  loading: "Loading order…",
  error: "We couldn't load this order.",
  retry: "Try again",
  notFound: "This order no longer exists.",
  sections: {
    details: "What's wrong",
    vehicle: "Vehicle",
    location: "Location",
    when: "When",
    photos: "Photos",
    quote: "Quote",
  },
  customer: {
    approve: "Approve & schedule",
    decline: "Decline",
    declineTitle: "Decline this quote?",
    declineBody: "The mechanic will be notified and your $20 hold released. You won't be charged.",
    declineConfirm: "Decline",
    cancel: "Keep quote",
    waitingMechanic: "We're finding a mechanic for your request.",
    waitingQuote: "Your mechanic is preparing a quote.",
    scheduledFor: (date: string) => `Scheduled for ${date}`,
  },
  provider: {
    accept: "Accept job",
    buildQuote: "Build quote",
    waitingApproval: "Waiting for the customer to approve your quote.",
    acceptErrorTitle: "Couldn't accept job",
    acceptErrorFallback: "Something went wrong. Please try again.",
  },
  depositNote: (deposit: string) =>
    `Includes a ${deposit} booking deposit, captured only when the customer approves.`,
} as const;
