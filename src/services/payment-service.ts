// Payment service — the only file that imports `@stripe/stripe-react-native`.
// Handles Stripe PaymentSheet presentation on the client and invokes Firebase
// Callable Functions for secret-key payment operations.

import { confirmPayment as stripeConfirmPayment, CardField } from "@stripe/stripe-react-native";
import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseApp } from "./firebase";

export { CardField };

export type CreateStripePaymentIntentResult = { clientSecret: string };
export type ConfirmStripePaymentResult = { success: boolean };

type CreateStripePaymentIntentData = { orderId: string };
type RecordCashPaymentData = { orderId: string; amount: number };

export const paymentService = {
  // Calls the Firebase Callable Function `createStripePaymentIntent` with { orderId }.
  async createStripePaymentIntent(orderId: string): Promise<CreateStripePaymentIntentResult> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<CreateStripePaymentIntentData, CreateStripePaymentIntentResult>(
      functions,
      "createStripePaymentIntent",
    );
    try {
      const result = await callable({ orderId });
      return result.data;
    } catch (err) {
      console.error("[paymentService.createStripePaymentIntent] failed:", err);
      throw err;
    }
  },

  // Confirms the PaymentIntent with the card details collected by CardField.
  // Throws if Stripe returns an error.
  async confirmStripePayment(clientSecret: string): Promise<ConfirmStripePaymentResult> {
    // eslint-disable-next-line no-console
    console.log("[confirmStripePayment] calling confirmPayment with client secret:", clientSecret.slice(0, 20) + "...");

    const { paymentIntent, error } = await stripeConfirmPayment(clientSecret, {
      paymentMethodType: "Card",
    });

    // eslint-disable-next-line no-console
    console.log("[confirmStripePayment] result error:", error);
    // eslint-disable-next-line no-console
    console.log("[confirmStripePayment] result paymentIntent:", paymentIntent);

    if (error) {
      throw new Error(error.message);
    }

    if (!paymentIntent) {
      throw new Error("Payment confirmation failed.");
    }

    return { success: true };
  },

  // Calls the Firebase Callable Function `recordCashPayment` with { orderId, amount }.
  async recordCashPayment(orderId: string, amount: number): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<RecordCashPaymentData, { success: boolean }>(
      functions,
      "recordCashPayment",
    );
    await callable({ orderId, amount });
  },
};
