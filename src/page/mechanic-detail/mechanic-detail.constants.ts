// Copy + defaults for the admin mechanic detail screen.

export const MECHANIC_DETAIL_COPY = {
  title: "Mechanic Detail",
  loading: "Loading mechanic profile\u2026",
  error: "We couldn\u2019t load this mechanic\u2019s profile.",
  retry: "Try again",

  // Sections
  contactTitle: "Contact",
  email: "Email",
  name: "Name",

  aboutTitle: "About",
  bioLabel: "Bio",
  noBio: "No bio yet.",
  specialties: "Specialties",
  noSpecialties: "No specialties listed.",

  availabilityTitle: "Availability",
  availableLabel: "Available for jobs",

  statsTitle: "Stats",
  rating: "Rating",
  jobsCompleted: "Jobs completed",
  earnings: "Earnings",
  experience: "Experience",
  yearsLabel: (years: number) => `${years} yr${years === 1 ? "" : "s"}`,

  // Active toggle
  accountTitle: "Account",
  activeLabel: "Account active",
  activeHint: "Disable to prevent this mechanic from receiving orders.",

  // Fallback
  noRating: "\u2014",
} as const;
