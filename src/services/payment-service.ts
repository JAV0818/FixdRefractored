// Payment service — the only file that imports `@stripe/stripe-react-native`.
// Handles Stripe PaymentSheet presentation on the client and invokes Firebase
// Callable Functions for secret-key payment operations.

import { initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";
import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseApp } from "./firebase";

export type CreateStripePaymentIntentResult = { clientSecret: string };

type CreateStripePaymentIntentData = { orderId: string };
type CaptureDepositAndApproveQuoteData = { orderId: string };
type RecordCashPaymentData = { orderId: string; amount: number };
type VerifyDepositHoldData = { orderId: string };
type ReleaseDepositHoldData = { orderId: string };
type StartOrderAndCaptureData = { orderId: string };
type CancelOrderWithPolicyData = { orderId: string };
type CancelOrderWithPolicyResult = { success: boolean; charged: boolean };
type AddCustomChargesData = { orderId: string; newItems: { description: string | null; name: string; price: number; quantity: number }[] };

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

  // Initializes and presents Stripe's PaymentSheet (Apple Pay, Google Pay,
  // cards, Link, etc.). Resolves when the customer completes payment.
  async openPaymentSheet(clientSecret: string): Promise<{ cancelled: boolean }> {
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Fixd",
      googlePay: { merchantCountryCode: "US", testEnv: __DEV__ },
      defaultBillingDetails: { address: { country: "US" } },
    });

    if (initError) {
      throw new Error(initError.message);
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === "Canceled") return { cancelled: true };
      throw new Error(presentError.message);
    }

    return { cancelled: false };
  },

  // Calls the Firebase Callable Function `captureDepositAndApproveQuote` with { orderId }.
  // Captures the authorized $20 hold and marks the order as Scheduled.
  async captureDepositAndApproveQuote(orderId: string): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<CaptureDepositAndApproveQuoteData, { success: boolean }>(
      functions,
      "captureDepositAndApproveQuote",
    );
    await callable({ orderId });
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

  // Verifies with Stripe that the $20 auth hold is real, then writes
  // paymentStatus: "authorized" server-side. Replaces the old client-side
  // markDepositAuthorized call.
  async verifyDepositHold(orderId: string): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<VerifyDepositHoldData, { success: boolean }>(
      functions,
      "verifyDepositHold",
    );
    await callable({ orderId });
  },

  // Releases a Stripe auth hold (cancels the PaymentIntent). Idempotent —
  // returns success if no hold exists or it was already released.
  async releaseDepositHold(orderId: string): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<ReleaseDepositHoldData, { success: boolean }>(
      functions,
      "releaseDepositHold",
    );
    await callable({ orderId });
  },

  // Captures the authorized $20 hold and starts the job. Called when the
  // mechanic taps "Start job".
  async startOrderAndCapture(orderId: string): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<StartOrderAndCaptureData, { success: boolean }>(
      functions,
      "startOrderAndCapture",
    );
    await callable({ orderId });
  },

  // Cancels a Scheduled order with 48-hour policy enforcement. If >= 48h
  // before appointment the hold is released; if < 48h the deposit is captured.
  async cancelOrderWithPolicy(orderId: string): Promise<{ charged: boolean }> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<CancelOrderWithPolicyData, CancelOrderWithPolicyResult>(
      functions,
      "cancelOrderWithPolicy",
    );
    const result = await callable({ orderId });
    return { charged: result.data.charged };
  },

  // Adds custom charges to an in-progress order. Runs server-side so
  // remainingBalance can't be manipulated by the client.
  async addCustomCharges(orderId: string, newItems: AddCustomChargesData["newItems"]): Promise<void> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<AddCustomChargesData, { success: boolean }>(
      functions,
      "addCustomCharges",
    );
    await callable({ orderId, newItems });
  },
};
