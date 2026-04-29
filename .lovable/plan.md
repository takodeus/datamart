## Restore product zoom / detail view

The product data (`src/lib/kiosk-data.ts`) already carries everything a detail view needs — `images: [front, back]`, `description` (ingredients + nutrition), `category`, `price`, and `conflictPrice` — but on the Classification screen the imagery is just a 36px tile in the left list and a 32px thumbnail in the middle header. None of the rich detail is visible. This plan restores a tap-to-zoom detail modal.

### What the user will see

- The product thumbnail in the middle-panel header (next to "Selected · {item name}") becomes tappable, with a subtle "Zoom" affordance (magnifier icon + hover ring).
- The product tiles in the left "Sample Products" list also open the same modal on a second tap of the already-selected item (first tap still just selects).
- Tapping opens a centered modal with:
  - Large primary image (front) with thumbnail strip below to switch to the back image.
  - Product name, category pill, and the canonical `price` with the `conflictPrice` shown crossed-out / muted beside it (matches the existing "two answers" gag).
  - Description block: the multi-line `description` rendered with line breaks preserved (ingredients, nutrition facts, storage notes).
  - Close button (X) top-right, click-outside to dismiss, and Esc-to-close.
- Soft `click` sound on open, `softClick` on close — consistent with existing button-sound router in `Index.tsx` (uses `data-sound`).

### Files to add / change

1. **New** `src/components/kiosk/ProductDetailModal.tsx`
   - Props: `item: Item | null`, `open: boolean`, `onClose: () => void`.
   - Resolves image filenames through a small shared image map.
   - Local state for `activeImageIdx`. Resets to 0 when `item` changes.
   - Keyboard: Escape closes; Left/Right arrows switch images when >1.
   - Layout: 2-column on wide kiosk viewport (image left ~55%, text right ~45%), single column fallback. Reuses existing tokens (`bg-card`, `border-border`, `rounded-xl`, Cherre red accents, `font-mono` for the price/category meta line).
   - No Radix Dialog needed — a plain fixed overlay matches the kiosk aesthetic and avoids focus-trap quirks inside `DeviceBezel`. (We can use `@/components/ui/dialog` if preferred — flag this in the question below.)

2. **Extract** `src/components/kiosk/itemImages.ts`
   - Move the `ITEM_IMAGES` map currently inlined at the top of `ClassificationScreen.tsx` into its own module so both `ClassificationScreen` and the new modal import it. No behavior change.

3. **Edit** `src/components/kiosk/ClassificationScreen.tsx`
   - Import the extracted image map and the new modal.
   - Add `const [zoomOpen, setZoomOpen] = useState(false);`.
   - Wrap the middle-header thumbnail+name block in a `<button>` (with `data-sound="click"`, `aria-label="Zoom product details"`) that sets `zoomOpen=true`. Add a small magnifier glyph to signal interactivity.
   - In the left list, when a tile for the already-active item is tapped again, open the modal instead of re-selecting.
   - Render `<ProductDetailModal item={item} open={zoomOpen} onClose={() => setZoomOpen(false)} />` at the bottom of the component tree.

### Technical notes

- All static imagery already exists in `src/assets/` (front + back PNGs for all 6 items) and is bundled via `import` — no new assets required.
- `description` strings use `\n` separators; render with `whitespace-pre-line` like the existing `lookups` cards do.
- The modal must render *inside* `DeviceBezel` (so it stays within the simulated tablet frame), so it should be a normal child of `ClassificationScreen` using `position: absolute; inset: 0` over the panel — not a React Portal to `document.body`.
- Keep z-index below the persistent Cherre logo watermark (`z-[100]` in `Index.tsx`) by using `z-50` on the modal overlay, so the brand mark still reads through. Or use `z-[110]` if we want the modal to fully cover — see question below.

### Out of scope

- No data-model changes to `kiosk-data.ts`.
- No changes to other screens (False Resolution, Resolution, Receipt, etc.).
- No new sound effects — reuse existing `click` / `softClick` via `data-sound`.
