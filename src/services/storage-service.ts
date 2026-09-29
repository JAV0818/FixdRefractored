// Storage service — the only file that reads/writes Firebase Storage.
// Hooks call these; views and components never import this directly.
// Path layout follows BACKEND_DESIGN.md §9.

import { Image } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { StorageReference } from "firebase/storage";

import type { Photo } from "@/types/photo.interface";
import { mapWithLimit } from "@/utils/map-with-limit";

import { storage } from "./firebase";

// Camera photos are ~5 MB each. Downscale + recompress before upload so a
// 12-photo inspection is a few MB instead of 60 — faster upload, faster load.
// Everything is re-encoded as JPEG, so stored files are always .jpg.
const PHOTO_MAX_DIMENSION = 1600;
const THUMB_MAX_DIMENSION = 400;
const AVATAR_MAX_DIMENSION = 512;
const PHOTO_QUALITY = 0.7;
const THUMB_QUALITY = 0.6;
const UPLOAD_CONCURRENCY = 3;

// (done, total) photos uploaded — lets the UI show "Uploading 3 of 8".
export type UploadProgress = (done: number, total: number) => void;

const getImageSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  );

// Shrink to `maxDimension` on the long side and re-encode as JPEG. Only shrinks:
// a small image (e.g. a screenshot) is re-encoded, never upscaled.
const compressImage = async (
  uri: string,
  maxDimension: number,
  quality: number,
  size?: { width: number; height: number },
) => {
  const { width, height } = size ?? (await getImageSize(uri));
  const resize =
    Math.max(width, height) > maxDimension
      ? width >= height
        ? { width: maxDimension }
        : { height: maxDimension }
      : null;

  return manipulateAsync(uri, resize ? [{ resize }] : [], {
    compress: quality,
    format: SaveFormat.JPEG,
  });
};

const uriToBlob = async (uri: string): Promise<Blob> => {
  const res = await fetch(uri);
  return res.blob();
};

// Resumable upload → download URL. The SDK retries transient network errors
// itself (capped by storage.maxUploadRetryTime, set in firebase.ts).
const uploadJpeg = async (fileRef: StorageReference, uri: string): Promise<string> => {
  const blob = await uriToBlob(uri);
  await new Promise<void>((resolve, reject) => {
    uploadBytesResumable(fileRef, blob, { contentType: "image/jpeg" }).on(
      "state_changed",
      undefined,
      reject,
      () => resolve(),
    );
  });
  return getDownloadURL(fileRef);
};

// Upload one picked photo as `${basePath}.jpg` plus a small `${basePath}-thumb.jpg`.
const uploadPhoto = async (basePath: string, uri: string): Promise<Photo> => {
  const full = await compressImage(uri, PHOTO_MAX_DIMENSION, PHOTO_QUALITY);
  // Thumbnail from the already-shrunk image — much cheaper than from the original.
  const thumb = await compressImage(full.uri, THUMB_MAX_DIMENSION, THUMB_QUALITY, full);

  const [url, thumbUrl] = await Promise.all([
    uploadJpeg(ref(storage, `${basePath}.jpg`), full.uri),
    uploadJpeg(ref(storage, `${basePath}-thumb.jpg`), thumb.uri),
  ]);
  return { url, thumbUrl };
};

// Upload a batch with limited concurrency, reporting progress per finished photo.
const uploadPhotos = (
  uris: string[],
  basePathFor: (index: number) => string,
  onProgress?: UploadProgress,
): Promise<Photo[]> => {
  let done = 0;
  return mapWithLimit(uris, UPLOAD_CONCURRENCY, async (uri, index) => {
    const photo = await uploadPhoto(basePathFor(index), uri);
    onProgress?.(++done, uris.length);
    return photo;
  });
};

export const storageService = {
  // Upload a customer's order photos to repairOrders/{userId}/{orderId}/...
  // Paths are deterministic, so retrying a failed submit overwrites rather than
  // duplicates. Returns the photos to store on the order.
  uploadOrderImages(
    userId: string,
    orderId: string,
    uris: string[],
    onProgress?: UploadProgress,
  ): Promise<Photo[]> {
    return uploadPhotos(
      uris,
      (index) => `repairOrders/${userId}/${orderId}/customer-upload-${index}`,
      onProgress,
    );
  },

  // A user's profile photo → profileImages/{userId}/profile.jpg (one file per
  // user; a new upload overwrites the old). Returns the public download URL.
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    const avatar = await compressImage(uri, AVATAR_MAX_DIMENSION, PHOTO_QUALITY);
    return uploadJpeg(ref(storage, `profileImages/${userId}/profile.jpg`), avatar.uri);
  },

  // Mechanic's inspection photos → inspectionReports/{orderId}/...
  uploadInspectionImages(
    orderId: string,
    uris: string[],
    onProgress?: UploadProgress,
  ): Promise<Photo[]> {
    const batch = Date.now();
    return uploadPhotos(
      uris,
      (index) => `inspectionReports/${orderId}/photo-${batch}-${index}`,
      onProgress,
    );
  },
};
