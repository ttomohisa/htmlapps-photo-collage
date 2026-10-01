# Changelog

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
