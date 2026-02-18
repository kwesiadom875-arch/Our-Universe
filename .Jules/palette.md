## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-12 - Grid Navigation Accessibility
**Learning:** Using `div` with `onClick` for grid items prevents keyboard users from navigating to content. This pattern was found in multiple grid layouts.
**Action:** Use semantic `<Link>` components wrapping the card content for navigation, ensuring the entire card is a focusable, interactive element.
