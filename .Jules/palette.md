## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-27 - Modal Accessibility Patterns
**Learning:** Modals require specific focus management and ARIA roles to be accessible. Simply showing/hiding a div is insufficient.
**Action:** Always wrap modals in `role="dialog" aria-modal="true"`. Use `useEffect` to capture focus on the most "safe" action (like 'Cancel') when opened, and handle the `Escape` key for closing.
