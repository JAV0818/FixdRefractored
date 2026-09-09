// Storage service — the only file that reads/writes Firebase Storage.
// Hooks call these; views and components never import this directly.
// Path layout follows BACKEND_DESIGN.md §9.
//
// Uses @react-native-firebase/storage (v26 modular API) — native iOS/Android
// Firebase SDKs. No Blob conversion needed: putFile() accepts local file URIs
// directly from expo-image-picker.

import { getStorage, ref, putFile, getDownloadURL } from "@react-native-firebase/storage";

// Canonical MIME-type → file extension mapping.
// Preserved so storage path filenames accurately reflect image format.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

// Infer MIME type from a local file URI's extension so we can set contentType
// metadata and derive a normalised extension for the storage path.
const mimeFromUri = (uri: string): string => {
  const match = /\.([a-zA-Z0-9]+)(?:[?#]|$)/.exec(uri);
  const ext = match?.[1]?.toLowerCase() ?? "";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  return "image/jpeg";
};

const storage = getStorage();

export const storageService = {
  // Upload a customer's order photos to repairOrders/{userId}/{orderId}/...
  // Returns the public download URLs to store on the order's mediaUrls.
  async uploadOrderImages(
    userId: string,
    orderId: string,
    uris: string[],
  ): Promise<string[]> {
    const uploads = uris.map(async (uri, index) => {
      const contentType = mimeFromUri(uri);
      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const fileRef = ref(
        storage,
        `repairOrders/${userId}/${orderId}/customer-upload-${index}.${ext}`,
      );
      await putFile(fileRef, uri, { contentType });
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },

  // A user's profile photo → profileImages/{userId}/profile.{ext} (one file per
  // user; a new upload overwrites the old). Returns the public download URL.
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    const contentType = mimeFromUri(uri);
    const ext = EXT_BY_TYPE[contentType] ?? "jpg";
    const fileRef = ref(storage, `profileImages/${userId}/profile.${ext}`);
    await putFile(fileRef, uri, { contentType });
    return getDownloadURL(fileRef);
  },

  // Mechanic's inspection photos → inspectionReports/{orderId}/...
  async uploadInspectionImages(orderId: string, uris: string[]): Promise<string[]> {
    const uploads = uris.map(async (uri, index) => {
      const contentType = mimeFromUri(uri);
      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const fileRef = ref(
        storage,
        `inspectionReports/${orderId}/photo-${Date.now()}-${index}.${ext}`,
      );
      await putFile(fileRef, uri, { contentType });
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },
};
