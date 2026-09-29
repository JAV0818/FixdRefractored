// Convert between the two parallel URL arrays stored in Firestore and Photo
// objects. Photos saved before thumbnails existed have no thumb, so they fall
// back to the full image.

import type { Photo } from "@/types/photo.interface";

export const toPhotos = (urls: string[] = [], thumbUrls: string[] = []): Photo[] =>
  urls.map((url, index) => ({ url, thumbUrl: thumbUrls[index] ?? url }));

export const splitPhotos = (photos: Photo[]) => ({
  urls: photos.map((p) => p.url),
  thumbUrls: photos.map((p) => p.thumbUrl),
});
