# Changelog

## 0.5.0 - 2026-10-01

### Added

- High-resolution JPEG, PNG, and WebP export rendered from original source photos.
- JPEG / WebP quality controls from 10–100.
- Long-side resolution presets for 1080, 2160, and 4096px plus custom output.
- Exact 8192px maximum-edge and 32MP maximum-pixel safety enforcement after integer rounding.
- PNG-only transparent background export.
- Editable output filenames with invalid-character, reserved-name, and duplicate-extension sanitization.
- Sequential original-photo decoding during export to avoid keeping all source images decoded at once.
- Export progress, encoding state, output dimensions, format, and file-size result.
- WebP Canvas encode feature detection.
- Blob URL and temporary Canvas cleanup after export.

## 0.4.0 - 2026-10-01

### Added

- Canvas ratio presets for 1:1, 4:5, 9:16, 16:9, 3:2, and 4:3.
- Custom canvas ratio input from 1:10 through 10:1.
- Ratio-aware automatic layout scoring based on actual canvas cell aspect ratios.
- Adjustable photo spacing and outer margin.
- Background color picker and validated hex color input.
- Transparent Canvas background preview for future PNG export.
- Per-photo rounded corners using a browser-independent Canvas path.
- Checkerboard preview behind transparent Canvas regions.
- Finish controls that scale consistently with the Canvas short side.

## 0.3.0 - 2026-10-01

### Added

- Photo selection from both the thumbnail list and Canvas preview.
- Desktop Drag & Drop reordering plus move-earlier / move-later controls for touch and keyboard use.
- Per-photo crop position adjustment by dragging directly on the Canvas preview.
- Per-photo 1×–3× zoom.
- Fill frame / Show all display modes.
- Single featured-photo mode with layout generation and scoring that prefer a larger cell.
- Undo after photo removal using the template AppToast pattern.
- Thumbnail-backed preview rendering to avoid decoding original files during every edit.

## 0.2.0 - 2026-10-01

### Added

- Deterministic automatic layout generation for 2–20 photos.
- Row- and column-based candidate layouts derived from actual photo aspect ratios.
- Candidate scoring based on estimated crop loss, extreme cell shapes, and area balance.
- Similar-layout deduplication and row / column diversity.
- Up to six visible layout suggestions with a “More layouts” / 「別の配置を見る」 control.
- Photo-backed candidate thumbnails and selectable main Canvas preview.
- Automatic candidate regeneration after photo addition or removal.

## 0.1.0 - 2026-10-01

### Added

- Initial Photo Collage application foundation based on the current `htmlapps-template` contract.
- JPEG, PNG, and WebP multi-file input.
- Drag & Drop input and incremental photo addition.
- 2–20 photo workflow with explicit overflow feedback.
- Per-photo thumbnails, filename, pixel dimensions, and remove action.
- Partial-failure handling so invalid images do not discard valid photos.
- Browser-memory-only photo handling with no runtime network access.
- Temporary equal-grid Canvas preview foundation for 2 or more photos.
- Japanese / English UI and application-specific help.
- Responsive desktop and smartphone layout.
