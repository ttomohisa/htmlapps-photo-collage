# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.8.1**. This milestone focuses on high-resolution photo robustness: orientation-aware decoding, explicit bitmap and Object URL cleanup, sequential processing, and recovery when a device cannot allocate enough image-processing resources.

## Features

- JPEG / PNG / WebP input and export
- 2–20 photo workflow
- Photo-aware automatic layout suggestions
- Reorder, crop, zoom, Fill / Fit, and featured photo
- Canvas ratio, spacing, background, transparency, and rounded corners
- High-resolution export from original source photos
- Smartphone pages: Photos / Layout / Finish / Save
- Up to 50 Undo / Redo steps
- Orientation-aware `createImageBitmap` decoding when available
- Explicit `ImageBitmap.close()` and Object URL cleanup
- Sequential input thumbnail generation and sequential original-photo export
- Preview decode cache cleanup when photos leave the current collage
- 8192px edge and 32MP export safety limits
- Recovery messages for image-processing memory failures
- MIME-empty local JPEG / PNG / WebP extension fallback
- Japanese / English UI
- No runtime network access

## Performance and memory behavior

Photo Collage intentionally avoids keeping all original photos decoded at once.

For input, each source image is decoded, drawn to a small preview thumbnail, released, and then the app proceeds to the next photo. High-resolution export similarly decodes one original photo at a time and releases it immediately after drawing it into the output Canvas.

When supported, decoding uses `createImageBitmap(..., { imageOrientation: "from-image" })` and closes the bitmap after use. The HTML image path remains as a compatibility fallback.

Thumbnail Object URLs remain alive only while the current editor or Undo / Redo history can still reference them. Decoded preview images that are no longer current are dropped from the cache.

## Robustness

- Custom canvas ratios remain limited to 1:10 through 10:1.
- Export remains limited to 8192px on either edge and 32MP total.
- Files with no MIME type can still be accepted by a recognized JPEG / PNG / WebP extension.
- Explicit non-image MIME types are not accepted only because of the filename extension.
- Resource-pressure failures show a recovery suggestion instead of silently failing.

The release-candidate stage will still perform final real-device stress checks for the 20 × 12MP desktop and 10 × 12MP smartphone targets.

## v0.8.1 UX changes

- The default canvas ratio is now **4:3**.
- **More layouts** now switches to the next candidate page and immediately applies the first layout on that page to the preview.
- The More layouts button shows the current candidate page.
- Added photos can be reordered by desktop Drag & Drop or by a touch-friendly drag handle.
- The privacy badge now says **Fully local processing**.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app. Export is rendered from Canvas and source EXIF / GPS metadata is not copied into the output image.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. Direct `file://` opening remains a release requirement.

## Development

This app follows `ttomohisa/htmlapps-template`.

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
