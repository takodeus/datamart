# Project Memory

## Core
Cherre self-checkout kiosk (6 screens). Montserrat font, Cherre red (#E12132) accent, white/light grey palette.
UI uses 0.75rem rounded corners. No truncation in lookup cards (auto-expand height).
Deployed to GitHub Pages at `/cherre-data-explorer/` — dynamic base paths required.
ResolutionScreen (Solution tab) must NEVER show a Cherre QR code — do not re-add.

## Memories
- [Project Overview](mem://project/overview) — Full 6-screen flow details and kiosk terminal UX context
- [Aesthetic](mem://style/aesthetic) — Core visual design system rules and elevation
- [Branding](mem://style/branding) — Brand colors, typography, and accent guidelines
- [Audio](mem://technical/audio) — Interactive UI sound effects via Web Audio API
- [Deployment Config](mem://deployment/github-pages) — GitHub Pages hosting and Vite/Router base paths
- [Terminal Experience](mem://ux/terminal-experience) — Cart sidebar and retail scanning animations
- [Hardware Bezel](mem://style/hardware-frame) — Physical tablet-style UI wrapper (DeviceBezel.tsx)
- [Lookup Constraints](mem://constraints/lookup-display) — Rules against truncation for item descriptions
- [Logo Placement](mem://style/logo-placement) — Specific watermark positioning and opacity per screen
- [Interactions](mem://style/interaction) — Hover and active state dynamic styling rules
- [Solution Screen](mem://constraints/solution-screen) — No Cherre QR on ResolutionScreen; lighter pink stat tiles
