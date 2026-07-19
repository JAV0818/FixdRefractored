import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: npx ts-node scripts/make-owner.ts <uid>");
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function main() {
  await db
    .collection("users")
    .doc(uid)
    .set(
      {
        role: "owner",
        hasCompletedOnboarding: true,
        updatedAt: Date.now(),
      },
      { merge: true },
    );

  console.log(`users/${uid} promoted to owner.`);
}

main().catch((error) => {
  console.error("Failed to promote user:", error);
  process.exit(1);
});
