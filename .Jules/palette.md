## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-13 - Keyboard Accessibility & Discovery
**Learning:** Adding a visual hint (like `/`) for keyboard shortcuts significantly improves feature discoverability for power users without cluttering the interface.
**Action:** When implementing shortcuts, always couple them with a subtle visual cue or tooltip to teach the user.
