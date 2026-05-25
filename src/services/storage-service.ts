// Storage service — the only file that reads/writes Firebase Storage.
// Hooks call these; views and components never import this directly.
// Path layout follows BACKEND_DESIGN.md §9.

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { storage } from "./firebase";

// Turn a local file URI (from expo-image-picker) into a Blob for upload.
const uriToBlob = async (uri: string): Promise<Blob> => {
  const res = await fetch(uri);
  return res.blob();
};

export const storageService = {
  // Upload a customer's order photos to repairOrders/{userId}/{orderId}/...
  // Returns the public download URLs to store on the order's mediaUrls.
  async uploadOrderImages(
    userId: string,
    orderId: string,
    uris: string[],
  ): Promise<string[]> {
    const uploads = uris.map(async (uri, index) => {
      const blob = await uriToBlob(uri);
      const fileRef = ref(
        storage,
        `repairOrders/${userId}/${orderId}/customer-upload-${index}.jpg`,
      );
      await uploadBytes(fileRef, blob);
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },
};
