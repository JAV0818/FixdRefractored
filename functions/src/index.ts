import { initializeApp } from "firebase-admin/app";

import { createStripePaymentIntent } from "./payments/create-stripe-payment-intent";
import { captureDepositAndApproveQuote } from "./payments/capture-deposit-and-approve-quote";
import { recordCashPayment } from "./payments/record-cash-payment";
import { verifyDepositHold } from "./payments/verify-deposit-hold";
import { releaseDepositHold } from "./payments/release-deposit-hold";
import { addCustomCharges } from "./payments/add-custom-charges";
import { expireStaleOrders } from "./scheduled/expire-stale-orders";
import { expireQuoteWindows } from "./scheduled/expire-quote-windows";

initializeApp();

export {
  createStripePaymentIntent,
  captureDepositAndApproveQuote,
  recordCashPayment,
  verifyDepositHold,
  releaseDepositHold,
  addCustomCharges,
  expireStaleOrders,
  expireQuoteWindows,
};
