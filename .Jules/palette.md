## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.
## 2026-03-01 - Timetable Add Button Accessibility
**Learning:** Icon-only floating action buttons (like the Add New Adventure button in Timetable.jsx) often lack context for screen reader users when constructed with generic `button` tags and internal SVGs.
**Action:** Consistently apply `aria-label` attributes to all icon-only interactive elements across the application to ensure screen reader compatibility.
