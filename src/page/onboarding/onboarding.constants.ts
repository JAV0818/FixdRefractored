export const CUSTOMER_SLIDES = [
  {
    title: "Request in Minutes",
    subtitle: "Describe your issue, upload photos, and get connected with mechanics fast.",
    animation: require("../../../assets/animations/customer-request.json"),
  },
  {
    title: "Your Mechanic Comes to You",
    subtitle: "Mobile mechanics that fit your schedule, at your location.",
    animation: require("../../../assets/animations/customer-location.json"),
  },
  {
    title: "Transparent Pricing",
    subtitle: "No surprises. Review the quote before you commit.",
    animation: require("../../../assets/animations/customer-payment.json"),
  },
] as const;

export const MECHANIC_SLIDES = [
  {
    title: "Find Jobs Near You",
    subtitle: "Browse repair requests and claim the ones that fit your skills.",
    animation: require("../../../assets/animations/mechanic-find.json"),
  },
  {
    title: "Manage Your Queue",
    subtitle: "Accept, schedule, and complete jobs all from one place.",
    animation: require("../../../assets/animations/mechanic-queue.json"),
  },
  {
    title: "Get Paid Faster",
    subtitle: "Transparent earnings on every job. Your work, your rates.",
    animation: require("../../../assets/animations/mechanic-earnings.json"),
  },
] as const;

export const ROLE_OPTIONS = [
  {
    role: "customer" as const,
    title: "I Need a Repair",
    subtitle: "Find mechanics and get your car fixed fast",
    icon: "🚗",
  },
  {
    role: "provider" as const,
    title: "I'm a Mechanic",
    subtitle: "Find jobs and grow your business",
    icon: "🔧",
  },
];
