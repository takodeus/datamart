---
name: solution-screen-no-cherre-qr
description: ResolutionScreen (Solution tab) must never show a Cherre QR code or "Scan to connect with the Cherre team" block
type: constraint
---
The ResolutionScreen.tsx (Solution tab) must NOT contain any QR code or "Scan to connect with the Cherre team" text. The CTA row should only have the "Talk to the team" and "Complete checkout" buttons.

Also: the stats tiles (4B+, 160M, 120+) use `bg-primary-foreground/25` with `border-primary-foreground/20` dividers (lighter pink), not /10.

**Why:** User has repeatedly asked for the Cherre QR removal — do not re-add it under any circumstance.
