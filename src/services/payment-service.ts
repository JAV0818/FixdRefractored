// Payment service — the only file that imports `@stripe/stripe-react-native`.
// Handles Stripe PaymentSheet presentation on the client and invokes Firebase
// Callable Functions for secret-key payment operations.

import { initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";
import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseApp } from "./firebase";

export type CreateStripePaymentIntentResult = { clientSecret: string };
export type ConfirmStripePaymentResult = { success: boolean; error?: string };

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

  // Initializes and presents the Stripe PaymentSheet using the supplied client secret.
  // Throws if the sheet fails to initialize or the user cancels/fails payment.
  async confirmStripePayment(clientSecret: string): Promise<ConfirmStripePaymentResult> {
    console.log("[confirmStripePayment] initializing sheet with client secret:", clientSecret.slice(0, 20) + "...");

    const initResult = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Fixd",
      returnURL: "fixd://stripe-redirect",
    });

    console.log("[confirmStripePayment] init result:", initResult);

    if (initResult.error) {
      throw new Error(initResult.error.message);
    }

    console.log("[confirmStripePayment] presenting sheet...");
    const presentResult = await presentPaymentSheet();
    console.log("[confirmStripePayment] present result:", presentResult);

    if (presentResult.error) {
      throw new Error(presentResult.error.message);
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
