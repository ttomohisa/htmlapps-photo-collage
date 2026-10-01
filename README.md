# Photo Collage

A Browser Kitty tool for loading multiple photos in the browser and combining them into one collage.

The current development release is **v0.1.0**. It establishes photo input, thumbnails, application states, and the Canvas preview foundation. Photo-aware automatic layouts are planned for v0.2.0.

## Features

- JPEG / PNG / WebP input
- 2–20 photo workflow
- Multi-select and Drag & Drop
- Add and remove photos
- Thumbnails, filenames, and pixel dimensions
- Partial-failure handling for invalid images
- Temporary equal-grid Canvas preview for 2+ photos
- Japanese / English UI
- Desktop and smartphone layouts
- No runtime network access

## How to use

1. Choose multiple photos with **Choose photos**.
2. Review the loaded photos in the list.
3. With two or more photos, the temporary Canvas preview is shown.
4. Remove unwanted photos from their cards.

Final image export is not available in v0.1.0 yet.

## Privacy

Photos are processed in the browser and are not sent to an external server by this app.

The app does not automatically persist your photos. Reloading the page clears the current session.

## Supported browsers

Current stable Chrome, Edge, Firefox, and Safari, including major mobile browsers. Direct `file://` opening is a release requirement.

## Limitations

v0.1.0 does not yet include automatic photo-aware layouts, reordering, crop/zoom, hero photos, finish settings, or JPEG/PNG/WebP export. See `APP_SPEC.md` for the roadmap.

## Development

This app follows `ttomohisa/htmlapps-template`. `AGENTS.md` and `APP_SPEC.md` are the implementation contract. Edit `src/index.template.html`; do not manually edit generated `dist` or repository-root HTML files.

Run the template checks on Windows:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

## License

MIT License
