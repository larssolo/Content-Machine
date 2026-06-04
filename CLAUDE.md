# Content Machine — Development Rules

## Version number

The app version lives in **two places** that must always be in sync:

1. `package.json` → `"version"` field
2. `src/App.tsx` → the header subtitle span (`v1.0.0`) and the footer tagline (`· v1.0.0`)

**Rule: bump the patch version (e.g. 1.0.0 → 1.0.1) on every commit that changes visible behaviour or content.** Use minor bumps (1.0.x → 1.1.0) for new features, major bumps (1.x → 2.0.0) for breaking/architectural changes.

## Branding

The product is called **Content Machine**. Never use "Brand Surface" or "Brandsurface" anywhere in user-visible text, UI labels, export files, or AI prompts.

## Branch

All development goes on `claude/gracious-johnson-kTUEL`. Commit per logical change, push when done.
