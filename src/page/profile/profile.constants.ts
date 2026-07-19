// Copy + defaults for the shared profile screen (customer + mechanic).

export const PROFILE_COPY = {
  title: "Profile",
  loading: "Loading your profile…",
  error: "We couldn't load your profile.",
  retry: "Try again",
  signOut: "Sign out",

  // Contact card
  contactTitle: "Contact",
  email: "Email",
  name: "Name",
  phone: "Phone",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  phoneLabel: "Phone",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  notSet: "Not set",

  // Customer
  vehiclesTitle: "Your vehicles",
  noVehicles: "No vehicles saved yet.",
  customerStatsTitle: "Your activity",
  completedOrders: "Completed orders",

  // Mechanic
  availabilityTitle: "Availability",
  availabilityLabel: "Available for jobs",
  availabilityHint: "Turn off to stop appearing for new work.",
  aboutTitle: "About",
  bioLabel: "Bio",
  noBio: "No bio yet.",
  specialties: "Specialties",
  noSpecialties: "No specialties listed.",
  addSpecialtyLabel: "Add a specialty",
  add: "Add",
  mechanicStatsTitle: "Your stats",
  jobsCompleted: "Jobs completed",
  earnings: "Earnings",

  // Navigation
  editProfile: "Edit Profile",
  viewPerformance: "Performance",
  changePassword: "Change Password",

  // Provider icon toolbar
  editProfileLabel: "Edit",
  performanceLabel: "Stats",
  changePasswordLabel: "Security",
  signOutLabel: "Sign out",

  // Shared stats
  rating: "Rating",
  noRatingYet: "—",
} as const;

// Subtitle shown under the name in the header when the user has no ratings yet.
export const NEW_CUSTOMER_LABEL = "Customer";
export const NEW_MECHANIC_LABEL = "New mechanic";
