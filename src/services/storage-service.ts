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

// File extension per MIME type, so the stored name matches the actual content.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
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
      // Derive the content type from the blob so the name + metadata match the
      // actual image (a PNG no longer lands as customer-upload-0.jpg).
      const contentType = blob.type || "image/jpeg";
      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const fileRef = ref(
        storage,
        `repairOrders/${userId}/${orderId}/customer-upload-${index}.${ext}`,
      );
      await uploadBytes(fileRef, blob, { contentType });
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },

  // Mechanic's inspection photos → inspectionReports/{orderId}/...
  async uploadInspectionImages(orderId: string, uris: string[]): Promise<string[]> {
    const uploads = uris.map(async (uri, index) => {
      const blob = await uriToBlob(uri);
      const contentType = blob.type || "image/jpeg";
      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const fileRef = ref(storage, `inspectionReports/${orderId}/photo-${Date.now()}-${index}.${ext}`);
      await uploadBytes(fileRef, blob, { contentType });
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },
};
