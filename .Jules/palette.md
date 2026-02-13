## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-18 - Contextual Aria Labels
**Learning:** Generic `aria-label="Delete"` is insufficient when multiple delete buttons exist on a page (e.g., in a list). Screen reader users need to know *what* they are deleting.
**Action:** Use specific labels like "Delete character" or "Delete note" to provide necessary context.
