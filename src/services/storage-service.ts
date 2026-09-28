// Storage service — the only file that reads/writes Firebase Storage.
// Hooks call these; views and components never import this directly.
// Path layout follows BACKEND_DESIGN.md §9.
//
// Uses Firebase JS SDK (firebase/storage) — works with both Expo Go and
// production builds without requiring useFrameworks: static or New Architecture.
// Unlike @react-native-firebase's putFile(), uploadBytes() requires a Blob —
// we fetch() the local URI to convert it before uploading.

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "./firebase";

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

// Convert a local file URI (e.g. from expo-image-picker) to a Blob.
// Firebase JS SDK's uploadBytes() requires a Blob; fetch() handles local
// file:// URIs and content:// URIs on both iOS and Android in React Native.
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return response.blob();
};

const storage = getStorage(firebaseApp);

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
      const blob = await uriToBlob(uri);
      await uploadBytes(fileRef, blob, { contentType });
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
    const blob = await uriToBlob(uri);
    await uploadBytes(fileRef, blob, { contentType });
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
      const blob = await uriToBlob(uri);
      await uploadBytes(fileRef, blob, { contentType });
      return getDownloadURL(fileRef);
    });
    return Promise.all(uploads);
  },
};
