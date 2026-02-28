## 2025-02-12 - The Importance of Semantics
**Learning:** Using `<div>` instead of `<button>` for interactive elements like close buttons creates significant accessibility barriers, as they lack keyboard focus and semantic meaning.
**Action:** Always use `<button>` for clickable actions and ensure they have `aria-label` if they only contain an icon.
\n## 2025-02-28 - Custom Interface Accessibility\n**Learning:** Custom reading interfaces like Epub readers often use icon-only buttons for navigation and settings. These are critical functionality but easily overlooked for screen readers when they lack text context.\n**Action:** Always ensure `aria-label` and `title` are added to icon-only buttons in custom tools and widgets to provide both screen-reader context and visual tooltips.
