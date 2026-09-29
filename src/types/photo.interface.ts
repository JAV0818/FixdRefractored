// A photo stored in Firebase Storage: the full (compressed) image plus a small
// thumbnail for grids and lists. Firestore keeps these as two parallel arrays
// (e.g. mediaUrls + mediaThumbUrls); see utils/photos.ts.

export type Photo = {
  url: string;
  thumbUrl: string;
};
