## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.

## 2025-02-13 - Optimizing Media Libraries
**Learning:** Using `<div>` with `background-image` for item lists (like movie posters) prevents native lazy loading and missing `alt` text.
**Action:** Use `<img>` with `object-fit: cover` and `loading="lazy"` (with eager loading for above-the-fold items) for better performance and accessibility.
