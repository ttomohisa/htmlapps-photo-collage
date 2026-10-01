# Applying this v0.1.0 implementation to the current htmlapps-template

This package is intentionally an **overlay**, not a forked copy of the template.

The implementation was prepared against the current `ttomohisa/htmlapps-template` contract inspected on 2026-10-01. Create `ttomohisa/htmlapps-photo-collage` from the current template, then copy these paths over the generated repository:

```text
APP_SPEC.md
CHANGELOG.md
README.md
README.ja.md
app.config.json
dependencies.json
dependencies.lock.json
assets/favicon.svg
src/index.template.html
```

Keep all other current template files unchanged, especially:

- `AGENTS.md`
- `components/`
- `docs/`
- `schemas/`
- `scripts/`
- `.github/workflows/`
- `build-standalone.ps1`
- `build-standalone.bat`
- `LICENSE`
- `SECURITY.md`
- `THIRD_PARTY_NOTICES.md`

Then run the template-required Windows checks:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

`preview.html` is a local temporary rendering helper with build placeholders already substituted. It is **not** a repository source file and should not be committed.
