# Photo Collage

A Browser Kitty tool for combining multiple photos into one collage directly in the browser.

The current development release is **v0.7.0**. It adds bounded Undo / Redo history, keyboard editing, reset confirmation, and accessibility polish to the existing desktop and smartphone workflow.

## Features

- JPEG / PNG / WebP input and export
- 2–20 photo workflow
- Photo-aware automatic layout suggestions
- Reorder, crop, zoom, Fill / Fit, and featured photo
- Canvas ratio, spacing, background, transparency, and rounded corners
- High-resolution export from original source photos
- Smartphone pages: Photos / Layout / Finish / Save
- Up to 50 Undo / Redo steps
- Ctrl / Cmd + Z, Ctrl / Cmd + Shift + Z, and Ctrl / Cmd + Y
- One history step per pointer drag for crop and range controls
- Undoable reset with confirmation dialog
- Keyboard photo positioning from the focused preview Canvas
- Accessible names, disabled states, visible focus, and dialog labeling
- Japanese / English UI
- No runtime network access

## Undo / Redo

The editor keeps up to 50 edit steps without duplicating the photo binary for every history entry.

Undo covers photo add/remove/reorder, layout selection, photo adjustments, canvas finish settings, and export settings. Selecting a photo, switching language, or moving between smartphone pages does not consume history.

When a slider or crop gesture is dragged continuously, the complete gesture is stored as one history step.

## Keyboard

- **Ctrl / Cmd + Z** — Undo
- **Ctrl / Cmd + Shift + Z** — Redo
- **Ctrl / Cmd + Y** — Redo
- **Arrow keys on the focused preview** — reposition the selected Fill photo
- **Shift + Arrow** — larger position step

Global Undo / Redo shortcuts are ignored while a text or form input is being edited.

## Reset

**Start over** opens a confirmation dialog. Reset clears the photos and current edit settings, but the reset itself is stored in history, so it can be undone immediately afterward.

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
