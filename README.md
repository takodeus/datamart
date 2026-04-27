# Cherre Data Mart

Self-checkout kiosk experience for the Brookfield EDGE Summit. Built around the **Classification Console** mechanic from the brief: an attendee plays admin, classifies six grocery items into the "right" categories and aisles, sees the system report success, and then watches downstream exceptions cascade. Punchline: classification alone can't fix disconnected systems. Cherre's ontology can.

## Stack

Vite · React 18 · TypeScript · Tailwind · shadcn/ui · React Router · Web Audio API for kiosk sound effects.

## Local development

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production bundle
npm test         # vitest
```

## Deploy

GitHub Actions deploys `dist/` to the `gh-pages` branch on every push to `main` (`.github/workflows/deploy.yml`). Live URL: `https://takodeus.github.io/datamart/`.

Production base path is set to `/datamart/` in `vite.config.ts`. If the repo or Pages URL changes, update:

1. `vite.config.ts` — `base` value
2. `index.html` — `og:image` and `twitter:image`

## House rules

- **Push to `main` only.** GitHub Actions handles `gh-pages`. Never push to `gh-pages` directly.
- **`git fetch origin` before pushing.**
- **Always `npm run build` before committing.** The build must end on `✓ built in`.
- **No smart quotes (`" "`) in JSX string literals.** They break the build. Use straight quotes only.
- **No QR code on the Resolution screen.** Confirmed by stakeholder. See `mem/index.md`.

## Flow

| Screen | File | Purpose |
|---|---|---|
| 1 | `WelcomeScreen.tsx` | POS framing, "Log In" CTA |
| 2 | `ClassificationScreen.tsx` | Three-panel admin console: products / system descriptions / classification controls |
| 3 | `FalseResolutionScreen.tsx` | Staged exception cascade after the user "fixes" the classifications |
| 4 | `ResolutionScreen.tsx` | Cherre value-prop screen with stats |
| 5 | `TeamScreen.tsx` | Talk to the team |
| 6 | `ReceiptScreen.tsx` | Shareable receipt with TRUSTED total, Data Superstar callout, Realcomm 2026 easter egg |

## Data

Items, categories, aisles, and exception copy live in `src/lib/kiosk-data.ts`. The four "system descriptions" per item (the conflicting legacy classifications) are the `lookups` array on each item.
