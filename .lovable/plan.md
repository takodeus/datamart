## Problem

Sounds currently fire on `pointerdown`, which triggers the moment a finger or mouse button touches a button — even if the user is starting a scroll/swipe gesture and never actually meant to "click." On a touch kiosk, any tap that begins on a button (even one that turns into a scroll) plays a beep.

## Fix

Switch the global sound router in `src/pages/Index.tsx` from `pointerdown` to a true "click was completed on this button" signal:

1. **Use `click` instead of `pointerdown`** as the trigger event. The browser only fires `click` when the pointer goes down AND up on the same element without being interpreted as a scroll/drag — which is exactly the "button was selected" semantic the user wants.

2. **Keep `pointerdown` only for `initAudio()`** (a separate, silent listener). Audio contexts must be unlocked by a user gesture, and `pointerdown` is the earliest reliable one. This listener does not play any sound — it just primes the AudioContext so the later `click`-triggered beeps aren't delayed.

3. **Preserve all existing behavior**: `data-sound` opt-in, sound-on toggle, disabled-button check, the `switch` mapping for `start` / `scan` / `error` / `success` / `checkout` / `click`, and the soft-click default.

### Technical detail

In `src/pages/Index.tsx`, the `useEffect` at lines ~68–106:
- Rename the handler and attach it via `document.addEventListener('click', handler, true)` instead of `pointerdown`.
- Drop the `e.pointerType` / `e.button` guard (not applicable to `MouseEvent` from `click`; the browser already filters non-primary clicks out of `click`).
- Move the `initAudio()` call into a small, separate `pointerdown` listener that does nothing else (or fold it into the existing "Initialize audio on first interaction" effect already present lower in the file — that one already handles it, so the inline `initAudio()` in the sound router can simply be removed).

No other files need to change. Buttons keep their existing `data-sound` attributes.

## Result

- Tapping and releasing on a button → beep (as today).
- Touching a button and dragging to scroll → no beep (the browser cancels the `click`).
- Right-clicks, middle-clicks, keyboard focus, hover → no beep.
- Sound-off toggle still mutes everything.