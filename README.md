# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.4.0**. You can now adjust the canvas ratio, spacing, background, transparency, and rounded corners in addition to the photo-aware layout and per-photo editing controls.

## Features

- JPEG / PNG / WebP input
- 2–20 photo workflow
- Multi-select and Drag & Drop input
- Photo-aware automatic layout suggestions
- Reorder photos by Drag & Drop or move buttons
- Crop-position adjustment directly on the Canvas
- 1×–3× zoom
- Fill frame / Show all
- One featured photo with larger-layout preference
- Undo after removing a photo
- Canvas ratios: 1:1, 4:5, 9:16, 16:9, 3:2, 4:3, and custom
- Photo spacing and outer margin
- Background color and transparent background preview
- Per-photo rounded corners
- Japanese / English UI
- Desktop and smartphone layouts
- No runtime network access

## How to use

1. Add two or more photos.
2. Choose a suggested layout.
3. Select and adjust individual photos as needed.
4. Choose the canvas ratio.
5. Adjust photo spacing, outer margin, background, transparency, and rounded corners.
6. Reorder or feature a photo when needed.

Final image export is not available in v0.4.0 yet. Transparent background is prepared for PNG export in v0.5.0.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app.

The app does not automatically persist your photos. Reloading the page clears the current session.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. Direct `file://` opening is a release requirement.

## Limitations

v0.4.0 does not yet include:

- JPEG / PNG / WebP export
- Export quality controls
- Export resolution presets
- Editable output filename UI

See `APP_SPEC.md` for the roadmap.

## Development

This app follows `ttomohisa/htmlapps-template`. `AGENTS.md` and `APP_SPEC.md` are the implementation contract.

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
