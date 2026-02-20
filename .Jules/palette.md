## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-05-20 - Modal Accessibility Pattern
**Learning:** Multiple modals (`ConfirmationModal`, `AddScentModal`, `MediaSearchModal`) lack proper `role="dialog"` and focus management, trapping keyboard users outside or making navigation difficult.
**Action:** When creating or modifying modals, always include `role="dialog"`, `aria-modal="true"`, and ensure focus is trapped or directed to a safe element on open.
