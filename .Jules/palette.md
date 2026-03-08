## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-13 - Modal Accessibility Patterns
**Learning:** Custom modals in this app often lack keyboard accessibility (Escape to close) and clickaway listeners. Users expect these standard interactions, and their absence breaks immersion and creates friction.
**Action:** When implementing or modifying custom modal overlays, ensure that a `useEffect` keyboard listener for `Escape` and an `onClick` background click handler are explicitly included.
