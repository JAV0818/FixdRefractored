// Storage service — the only file that reads/writes Firebase Storage.
// Hooks call these; views and components never import this directly.
// Path layout follows BACKEND_DESIGN.md §9.

import { Image } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { mapWithLimit } from "@/utils/map-with-limit";

import { storage } from "./firebase";

// Camera photos are ~5 MB each. Downscale + recompress before upload so a
// 12-photo inspection is a few MB instead of 60 — faster upload, faster load.
const PHOTO_MAX_DIMENSION = 1600;
const AVATAR_MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.7;
const UPLOAD_CONCURRENCY = 3;

const getImageSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  );

// Turn a local file URI (from expo-image-picker) into a compressed JPEG Blob.
// Only shrinks — a small image (e.g. a screenshot) is re-encoded, never upscaled.
const uriToBlob = async (uri: string, maxDimension = PHOTO_MAX_DIMENSION): Promise<Blob> => {
  const { width, height } = await getImageSize(uri);
  const longSide = Math.max(width, height);
  const resize =
    longSide > maxDimension
      ? width >= height
        ? { width: maxDimension }
        : { height: maxDimension }
      : null;

  const compressed = await manipulateAsync(uri, resize ? [{ resize }] : [], {
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  const res = await fetch(compressed.uri);
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
    return mapWithLimit(uris, UPLOAD_CONCURRENCY, async (uri, index) => {
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
  },

  // A user's profile photo → profileImages/{userId}/profile.{ext} (one file per
  // user; a new upload overwrites the old). Returns the public download URL.
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    const blob = await uriToBlob(uri, AVATAR_MAX_DIMENSION);
    const contentType = blob.type || "image/jpeg";
    const ext = EXT_BY_TYPE[contentType] ?? "jpg";
    const fileRef = ref(storage, `profileImages/${userId}/profile.${ext}`);
    await uploadBytes(fileRef, blob, { contentType });
    return getDownloadURL(fileRef);
  },

  // Mechanic's inspection photos → inspectionReports/{orderId}/...
  async uploadInspectionImages(orderId: string, uris: string[]): Promise<string[]> {
    return mapWithLimit(uris, UPLOAD_CONCURRENCY, async (uri, index) => {
      const blob = await uriToBlob(uri);
      const contentType = blob.type || "image/jpeg";
      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const fileRef = ref(storage, `inspectionReports/${orderId}/photo-${Date.now()}-${index}.${ext}`);
      await uploadBytes(fileRef, blob, { contentType });
      return getDownloadURL(fileRef);
    });
  },
};
