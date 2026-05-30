// Copy + tunables for the quote-request wizard.

export const MAX_QUOTE_IMAGES = 5;

export const QUOTE_REQUEST_COPY = {
  steps: [
    { title: "What's wrong?", subtitle: "Describe the issue and pick the services you need." },
    { title: "Your vehicle", subtitle: "Which vehicle is this for?" },
    { title: "Where & when?", subtitle: "Where should the mechanic meet you, and when works best?" },
    { title: "Add photos", subtitle: "Photos help mechanics quote more accurately. Optional." },
    { title: "Review & submit", subtitle: "Make sure everything looks right before you send it." },
  ],
  back: "Back",
  next: "Next",
  submit: "Submit request",
  submitting: "Submitting…",
  photosHint: "Tap the camera tile to add up to 5 photos.",
  submitError: "We couldn't submit your request. Please try again.",
  review: {
    description: "Issue",
    categories: "Services",
    vehicle: "Vehicle",
    location: "Location",
    when: "Preferred time",
    photos: "Photos",
    none: "—",
  },
} as const;
