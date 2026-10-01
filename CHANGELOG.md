# Changelog

## 0.8.1 - 2026-10-02

### Changed

- Changed the privacy badge to `完全ローカル処理 / Fully local processing`.
- Changed the default canvas ratio from 1:1 to 4:3.
- Made More layouts immediately apply the first layout from the next candidate page.
- Added a page indicator to the More layouts button.
- Added a touch / pen drag handle for photo reordering while keeping desktop Drag & Drop and arrow controls.
- Aligned the app header with the current htmlapps-template header UI.
- Fixed the broken photo action-row CSS that caused controls to stack vertically and cards to grow with large blank areas.
- Kept photo cards content-height sized instead of stretching to the tallest card in the grid row.
- Simplified desktop dragging to use the photo thumbnail as the drag ghost and show the grip only on coarse-pointer devices.

## 0.8.0 - 2026-10-01

### Added

- Orientation-aware image decoding through `createImageBitmap(..., { imageOrientation: "from-image" })` when available.
- HTMLImageElement decode fallback for compatible browsers that cannot use the ImageBitmap path.
- Explicit ImageBitmap disposal after thumbnail creation and after each high-resolution export draw.
- History-aware thumbnail Object URL cleanup.
- Preview decoded-image cache cleanup when photos leave the current collage.
- Input and export recovery messages for device image-processing memory pressure.
- JPEG / PNG / WebP extension fallback when File.type is empty or `application/octet-stream`.
- Extreme portrait / panorama regression coverage.

### Changed

- Source images are released immediately after thumbnail drawing instead of waiting for thumbnail encoding.
- Export Canvas is reduced after encoding before download setup where possible.
- Hidden main / mobile preview canvases are reduced to 1×1 to release backing buffers.
- Input and export loops yield to the UI between photos.
- Thumbnail and export Canvas rendering request high-quality image smoothing.
- Transparent input images are flattened to white only for JPEG preview thumbnails.

## 0.7.0 - 2026-10-01

### Added

- Bounded 50-step Undo / Redo history.
- Undo / Redo toolbar controls with keyboard shortcut metadata.
- Ctrl / Cmd + Z, Ctrl / Cmd + Shift + Z, and Ctrl / Cmd + Y shortcuts.
- History grouping so continuous crop and range drags consume one history step.
- Undoable photo add, remove, reorder, layout selection, photo adjustment, canvas finish, and export setting changes.
- Confirmation dialog for Start over / Reset.
- Reset itself as an undoable history step.
- Keyboard photo positioning from the focused preview Canvas, with Shift for a larger step.
- Accessible preview Canvas label and Reset dialog labeling.
- Focus recovery after photo deletion and Reset dialog close.
- Session thumbnail URL tracking with pagehide cleanup.

### Changed

- Delete Toast Undo now uses the shared history engine and guards against stale Undo actions.
- Global history shortcuts no longer override browser text-input Undo behavior.
- Undo / Redo / Reset controls reflect current history and export state.

## 0.6.0 - 2026-10-01

### Added

- Dedicated smartphone page workflow: Photos / Layout / Finish / Save.
- Fixed bottom navigation based on the current template mobile-bottom-bar component pattern.
- Safe-area-aware bottom bar and body spacing.
- Disabled Layout / Finish / Save tabs until two photos are available.
- Automatic fallback to Photos when the collage drops below two photos.
- Compact output preview on Finish and Save pages without re-decoding photos.
- Coarse-pointer landscape smartphone detection in addition to <=600px portrait widths.
- Mobile help copy describing the four-page workflow.

### Changed

- Mobile Toast positioning now clears the fixed bottom navigation.
- Empty mobile state avoids showing a redundant empty card under the photo input.
- Mobile preview heights are constrained so controls remain reachable.

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
