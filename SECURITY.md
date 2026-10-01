# Security Policy

## Supported version

Security fixes target the latest Photo Collage version on the default branch.

## Reporting a vulnerability

Do not publish sensitive vulnerability details in a public issue. Use the repository owner's private security reporting channel when available.

Include the affected commit/version, reproduction steps, expected and actual behavior, security impact, and a minimal test image when file parsing is involved.

## Photo Collage trust model

Photo Collage is a static browser application with no application backend.

- Selected photos are processed in the browser.
- Runtime CSP keeps `connect-src 'none'`.
- There is no runtime CDN, remote font, analytics, telemetry, external API, signaling service, or silent update request.
- Downloads are initiated by the user.
- The app does not automatically persist selected photos to localStorage, IndexedDB, or Cache Storage.
- Exported images are newly encoded from Canvas and source EXIF / GPS metadata is not intentionally copied.

The repository currently declares no bundled third-party runtime library dependencies.

A generated HTML file is executable code. Distribute it through a trusted channel and verify hashes for high-trust workflows.

## Input files and resource limits

Local image files are untrusted input.

The implementation:

- accepts JPEG / PNG / WebP only;
- limits one collage to 20 photos;
- rejects stale async results through generation tokens;
- processes original images sequentially rather than decoding all full-resolution files at once;
- releases Object URLs, decoded images, ImageBitmap resources, and large Canvas buffers where practical;
- limits export to 8192px per edge and 32MP total;
- keeps destructive editing recoverable through Undo / Redo where practical;
- reports partial decode failures without exposing stack traces to the user.

Browser and device memory limits still vary. A sufficiently large or malformed image can fail to decode; this should produce a recoverable error rather than an upload or external fallback.

## Dependency review

If a third-party package is added later, pin an exact version in `dependencies.json`, sync `dependencies.lock.json`, review its license and browser bundle, embed every runtime support asset, update THIRD_PARTY_NOTICES.md, and retest with the network disabled.
