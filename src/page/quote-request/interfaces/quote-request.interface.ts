// Quote-request form schema. Validation lives in Zod (best_practices.md:
// "Forms: React Hook Form + Zod"). The form's flat shape is mapped to the
// service's CreateOrderInput (nested locationDetails) at submit time.

import { z } from "zod";

export const quoteRequestSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in a little more detail (10+ characters)."),
  categories: z.array(z.string()).min(1, "Pick at least one service category."),
  vehicleInfo: z
    .string()
    .trim()
    .min(2, "Tell us which vehicle this is for (e.g. 2019 Toyota Camry)."),
  address: z.string().trim().min(3, "Enter the service address."),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  scheduledAt: z
    .number({
      required_error: "Pick a preferred date and time.",
      invalid_type_error: "Pick a preferred date and time.",
    })
    .refine((v) => v > Date.now(), "Pick a time in the future."),
});

export type QuoteRequestForm = z.infer<typeof quoteRequestSchema>;

// The field names belonging to each wizard step, used to validate one step at
// a time with react-hook-form's `trigger` before advancing.
export const QUOTE_STEP_FIELDS: readonly (keyof QuoteRequestForm)[][] = [
  ["description", "categories"], // Step 1 — what's wrong
  ["vehicleInfo"], // Step 2 — vehicle
  ["address", "city", "state", "zip", "scheduledAt"], // Step 3 — location & timing
  [], // Step 4 — photos (no text fields to validate)
  [], // Step 5 — review
];
