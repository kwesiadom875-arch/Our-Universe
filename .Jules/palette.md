## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-23 - Accessible Disclosure Patterns
**Learning:** Elements that toggle complex panels (like notification bells) require WAI-ARIA disclosure attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`) mapping to a container with `role="dialog"` to correctly communicate state to screen readers.
**Action:** Always convert generic div wrappers for such interactive elements to `<button>` with native WAI-ARIA properties, ensuring a CSS reset (`background: transparent; border: none;`) is applied to preserve the design.