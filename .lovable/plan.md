## Let users pick the next product themselves

Right now, after a user finishes classifying an item, the selection auto-jumps to the next unclassified product after ~850ms, and the right-panel footer shows a "Next product →" button that walks through items in order. Both of these decide *for* the user. This plan removes the automatic and sequential nudges and replaces them with a clear inline picker that lets the user choose any remaining product.

### Behavior changes

- **Remove auto-advance.** Drop the `useEffect` that schedules `onSelectItem(next)` after the current item is classified. The selection stays where the user put it.
- **Remove the "Next product →" CTA** from the right-panel footer. It implied a fixed sequence.
- **Remove `findNextUnclassified` / `goToNext` / `hasNextUnclassified` / `justClassifiedRef`** — no longer needed.
- **Keep the existing left "Sample Products" list** as the always-available picker. It already shows status dots and is the natural place to pick freely.
- **Keep the threshold** (`MIN_TO_SUBMIT = 3`) and the "Update System" button in the right-panel footer, restored to a single full-width primary button (its original look).

### New: inline "Pick the next product" panel

When the current item is classified and at least one other item is still unclassified, show a small inline picker just below the right-panel footer hint (or replace the hint with it). It contains:

- A short prompt: "Classified — pick another product to continue."
- A horizontal row of compact tiles, one per **unclassified** item, showing the thumbnail + name. Each is a button that calls `onSelectItem(idx)`. No fixed order is implied — the user chooses.
- If every item is classified, replace the picker with the "All items classified. Ready to apply." line that already exists.

This keeps the choice visible right next to the "Update System" CTA, so the user can decide each time whether to keep classifying or submit now.

### Footer hint copy

- `< MIN_TO_SUBMIT` classified: "Classify N more product(s) to unlock Update System (X/6 done)."
- `>= MIN_TO_SUBMIT` and not all done: "X/6 classified — pick another product to continue, or submit now."
- All done: "All items classified. Ready to apply."

### Files

- `src/components/kiosk/ClassificationScreen.tsx` — only file touched.
  - Delete: `findNextUnclassified`, `goToNext`, `hasNextUnclassified`, `justClassifiedRef`, the auto-advance `useEffect`.
  - Add: derived `unclassifiedIndices` (excluding the current item) + `currentDone` boolean.
  - Footer JSX: drop the "Next product →" button; restore "Update System" to a single full-width primary; render the inline picker tiles when `currentDone && unclassifiedIndices.length > 0`.
  - Imports: remove `useRef` if no other usage remains; remove `useEffect` if no other usage remains (it is still used for the scroll reset, so keep it).

### Out of scope

- No changes to the `Item` data model, the left list, the middle lookups panel, or the ProductDetailModal.
- No new sounds (the inline tile buttons use the existing `data-sound="click"`).
- No changes to the threshold or the "Update System" gating logic.
