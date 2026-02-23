## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-12 - Accessible Modals
**Learning:** Simple modals often lack basic accessibility features like focus trapping and Escape key support, making them unusable for keyboard users.
**Action:** When creating or refactoring modals, always implement `role="dialog"`, `aria-modal="true"`, initial focus management (e.g., to "Cancel"), and `Escape` key listener.
