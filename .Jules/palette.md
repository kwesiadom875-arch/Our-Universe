## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-12 - Tab Interface Accessibility
**Learning:** Manually implemented tab interfaces often lack ARIA roles (`tablist`, `tab`, `tabpanel`) and states (`aria-selected`), making them confusing for screen reader users who can't see the visual "active" state.
**Action:** When building custom tabs, always ensure `role="tablist"` is on the container, `role="tab"` on buttons with `aria-selected`, and `role="tabpanel"` on content areas.
