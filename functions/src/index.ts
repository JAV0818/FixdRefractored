import { initializeApp } from "firebase-admin/app";

import { createStripePaymentIntent } from "./payments/create-stripe-payment-intent";
import { recordCashPayment } from "./payments/record-cash-payment";

initializeApp();

export { createStripePaymentIntent, recordCashPayment };
