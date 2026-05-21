// Design tokens — typography scale.

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
} as const;

export type TypographyToken = keyof typeof typography;
