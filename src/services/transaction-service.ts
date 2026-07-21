// Transaction service — the only file that reads the `transactions` Firestore
// collection. Hooks call these; views and components never import this directly.

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "./firebase";
import type {
  Transaction,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from "@/types/transaction.interface";

const TRANSACTIONS = "transactions";

const snapToTransaction = (snap: { id: string; data: () => Record<string, unknown> }): Transaction =>
  ({ id: snap.id, ...snap.data() }) as Transaction;

export type { Transaction, TransactionMethod, TransactionStatus, TransactionType };

export const transactionService = {
  async getTransactionsByOrder(orderId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, TRANSACTIONS),
      where("orderId", "==", orderId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(snapToTransaction);
  },

  async getTransactionsByProvider(providerId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, TRANSACTIONS),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(snapToTransaction);
  },
};
