# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.5.0**. The complete desktop editing flow now ends with high-resolution JPEG, PNG, or WebP export rendered from the original source photos.

## Features

- JPEG / PNG / WebP input
- 2–20 photo workflow
- Multi-select and Drag & Drop input
- Photo-aware automatic layout suggestions
- Reorder, crop position, zoom, Fill / Fit, and one featured photo
- Canvas ratios: 1:1, 4:5, 9:16, 16:9, 3:2, 4:3, and custom
- Photo spacing, outer margin, background, transparency, and rounded corners
- JPEG / PNG / WebP export
- JPEG / WebP quality from 10–100
- Long-side presets: 1080 / 2160 / 4096px plus custom
- 8192px edge and 32MP safety limits
- Editable and sanitized output filename
- Export rendered sequentially from original source photos
- Export progress and completion details
- Source EXIF / GPS metadata is not copied to the exported Canvas image
- Japanese / English UI
- No runtime network access

## How to use

1. Add two or more photos.
2. Choose a suggested layout.
3. Adjust individual photos and the canvas finish.
4. Choose JPEG, PNG, or WebP.
5. Choose output resolution and quality.
6. Edit the filename if needed.
7. Select **Save image**.

Transparent background is available for PNG export.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app.

The exported image is newly encoded from Canvas. The app does not copy EXIF, GPS, camera metadata, or the original filenames into the output image.

The app does not automatically persist your photos. Reloading the page clears the current session.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. WebP export is enabled only when supported by the browser. Direct `file://` opening is a release requirement.

## Export limits

- Maximum edge: 8192px
- Maximum total pixels: 32MP
- JPEG / WebP quality: 10–100
- PNG transparency: supported

## Development

This app follows `ttomohisa/htmlapps-template`. `AGENTS.md` and `APP_SPEC.md` are the implementation contract.

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
