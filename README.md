# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.6.0**. It adds a dedicated smartphone workflow with four bottom-bar pages instead of stacking the complete desktop editor into one long mobile screen.

## Features

- JPEG / PNG / WebP input and export
- 2–20 photo workflow
- Photo-aware automatic layout suggestions
- Reorder, crop, zoom, Fill / Fit, and featured photo
- Canvas ratio, spacing, background, transparency, and rounded corners
- High-resolution export from original source photos
- 1080 / 2160 / 4096px and custom output resolution
- Editable sanitized filename
- Smartphone pages: Photos / Layout / Finish / Save
- Template-based fixed mobile bottom navigation
- Safe-area-aware mobile layout and Toast positioning
- Compact preview on Finish and Save pages
- Portrait and coarse-pointer landscape smartphone workflow
- Japanese / English UI
- No runtime network access

## Smartphone workflow

On supported smartphone layouts, use the bottom bar:

1. **Photos** — add, review, reorder, or remove photos.
2. **Layout** — choose a layout and adjust individual photos.
3. **Finish** — adjust ratio, spacing, background, transparency, and corners.
4. **Save** — choose export settings and save the image.

Layout, Finish, and Save stay disabled until at least two photos are loaded.

Desktop keeps the full editor visible in normal document flow.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app. Export is rendered from Canvas and source EXIF / GPS metadata is not copied into the output image.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. Direct `file://` opening remains a release requirement.

## Development

This app follows `ttomohisa/htmlapps-template`. The smartphone navigation copies/adapts the current template `components/mobile-bottom-bar.html` pattern.

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
