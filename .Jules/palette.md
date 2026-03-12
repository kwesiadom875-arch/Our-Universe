## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-13 - Accessible Notification Actions
**Learning:** Generic `<div>` containers used for primary navigation elements (like notification bells) fail to communicate state (`aria-expanded`) and semantic role to screen readers, while default `<button>` elements introduce unwanted styles that break positioning.
**Action:** Convert generic interactive containers to native `<button>` elements with appropriate `aria-label`, `aria-expanded`, and `aria-haspopup` attributes. To prevent layout breakage (e.g., overriding `position: relative`), append `background: transparent; border: none;` to the element's existing CSS class rather than using inline style resets.
