# Photo Collage

Combine 2–20 photos into one collage directly in the browser, with photo-aware layout suggestions and local image export.

![Photo Collage screenshot](assets/screenshot.png)

## Features

- JPEG / PNG / WebP input
- Photo-aware automatic layout suggestions with additional candidate pages
- Desktop Drag & Drop and touch-friendly photo reordering
- Crop position, 1×–3× zoom, Fill / Fit, and featured photo
- 4:3 default canvas plus 1:1, 4:5, 9:16, 16:9, 3:2, and custom ratio
- Photo spacing, outer margin, background color, PNG transparency, and rounded corners
- JPEG / PNG / WebP export from the original source photos
- 1080 / 2160 / 4096px and custom output resolution
- Up to 50 Undo / Redo steps
- Smartphone workflow with Photos / Layout / Finish / Save pages
- Japanese / English UI
- Failed photos are kept separate by filename without discarding successfully loaded photos
- No runtime network access

## How to use

1. Add 2–20 JPEG, PNG, or WebP photos.
2. Choose one of the suggested layouts. Use **More layouts** when additional candidate pages are available.
3. Reorder photos or select a photo to adjust crop position, zoom, Fill / Fit, or featured-photo status.
4. Adjust the canvas ratio, spacing, background, transparency, and rounded corners.
5. Choose JPEG, PNG, or WebP, set the output resolution and quality, edit the filename, and select **Save image**.

The default canvas ratio is **4:3**.

## Privacy / local processing

Photo Collage processes selected photos in the browser. The app does not upload photos, use analytics or telemetry, call an external API, load a runtime CDN, or use remote fonts.

The runtime Content Security Policy keeps `connect-src 'none'`.

Exported images are newly encoded from Canvas. The app does not intentionally copy source EXIF, GPS, camera metadata, or original filenames into the exported image. This should not be treated as a general-purpose metadata sanitization guarantee.

Photos and edit state are kept in the current page session only. Reloading or closing the page clears the current work.

## Supported browsers / devices

Target browsers are current stable Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome.

Desktop and smartphone layouts are both supported. Smartphone editing uses the fixed Photos / Layout / Finish / Save workflow.

## Limitations

- 2–20 photos per collage.
- HEIC / HEIF is not officially supported in v1.0.0.
- No text, stickers, filters, background removal, free placement, arbitrary rotation, or cloud project storage.
- Custom canvas ratio is limited to 1:10 through 10:1.
- Export is limited to 8192px on either edge and 32MP total.
- Very large source photos may exceed the browser or device image-processing memory. The app processes photos sequentially and shows a recovery suggestion when resource pressure is detected.
- WebP export is available only when the browser can encode WebP from Canvas.

## Single HTML / offline behavior

The build produces:

- `dist/index.html` — readable self-contained HTML
- `dist/index.self-extract.html` — gzip self-extracting single HTML
- `photo-collage.html` — readable root copy

The release target includes direct `file://` opening. Runtime application behavior does not require network access.

## Development / verification

This app follows `ttomohisa/htmlapps-template`.

```powershell
node .\scripts\check-photo-collage-rc.cjs
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

The RC regression covers layout generation, extreme aspect ratios, file-type fallback, export pixel limits, reorder logic, Undo / Redo, translation-key parity, CSP, and template contracts. Real-browser and real-device smoke testing is still required before v1.0.0.

## License and third-party notices

MIT License. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
