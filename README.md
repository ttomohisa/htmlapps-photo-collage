# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.3.0**. In addition to photo-aware layout suggestions, each photo can now be reordered and adjusted without uploading it anywhere.

## Features

- JPEG / PNG / WebP input
- 2–20 photo workflow
- Multi-select and Drag & Drop input
- Photo-aware automatic layout suggestions
- Crop-loss, extreme-cell, area-balance, and featured-photo scoring
- Select photos from the list or directly on the Canvas preview
- Reorder photos by Drag & Drop or move buttons
- Drag a photo in the preview to adjust its crop position
- 1×–3× zoom
- Fill frame / Show all
- One featured photo with larger-layout preference
- Undo after removing a photo
- Japanese / English UI
- Desktop and smartphone layouts
- No runtime network access

## How to use

1. Add two or more photos.
2. Choose a suggested layout.
3. Select a photo in the list or preview.
4. Drag it in the preview, change zoom, or switch between Fill frame and Show all.
5. Use **Make this photo larger** when one photo should be featured.
6. Reorder photos with Drag & Drop or the move buttons.

Final image export is not available in v0.3.0 yet.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app.

The app does not automatically persist your photos. Reloading the page clears the current session.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. Direct `file://` opening is a release requirement.

## Limitations

v0.3.0 does not yet include:

- Canvas ratio presets
- Gap / outer margin
- Background color
- Rounded corners
- JPEG / PNG / WebP export

See `APP_SPEC.md` for the roadmap.

## Development

This app follows `ttomohisa/htmlapps-template`. `AGENTS.md` and `APP_SPEC.md` are the implementation contract.

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
