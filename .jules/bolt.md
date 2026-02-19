## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2026-02-19 - Missing Indexes on LibraryItem
**Learning:** `LibraryItem` collection, a core user-centric collection, was missing indexes entirely, causing O(n) scans for "My Library" views.
**Action:** Always verify indexes for core user-centric collections, especially `{ user: 1, createdAt: -1 }` for sorting.
