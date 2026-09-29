# Deferred

Things knowingly left for later. Each entry says why and what "done" looks like.

## Customers can't see inspection photos
- **What:** Mechanic inspection photos are uploaded and saved (`photoUrls` / `photoThumbUrls`
  on the inspection report) but no customer-facing screen displays them. Only the mechanic's
  edit screen shows them.
- **Why deferred:** Needs a design decision on where the report lives in the customer's order
  detail; out of scope for the photo-performance work.
- **Done when:** the customer's order detail shows the inspection report with a photo gallery
  (reuse `PhotoGallery` with `toPhotos(report.photoUrls, report.photoThumbUrls)`).

## Retrying a failed submit reuses the first order
- **What:** If photo upload fails after the order is created, tapping submit again re-uploads to
  the same order (no duplicate). But if the customer edits the form before retrying, those
  edits aren't applied — the order keeps the first submission's text.
- **Why deferred:** There's no customer "edit order" path yet.
- **Done when:** the retry updates the existing order with the current form values, or the form
  locks after the order is created.

## Existing photos stay full size
- **What:** Photos uploaded before compression/thumbnails shipped stay ~5 MB with no thumbnail
  (they fall back to the full image).
- **Done when:** a one-off backfill resizes them, or we accept it for test data.
