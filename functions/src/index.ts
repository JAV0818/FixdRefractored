import { initializeApp } from "firebase-admin/app";

import { createStripePaymentIntent } from "./payments/create-stripe-payment-intent";
import { captureDepositAndApproveQuote } from "./payments/capture-deposit-and-approve-quote";
import { recordCashPayment } from "./payments/record-cash-payment";

initializeApp();

export { createStripePaymentIntent, captureDepositAndApproveQuote, recordCashPayment };
