## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2026-02-15 - Missing Indexes on LibraryItem
**Learning:** `LibraryItem` queries were unoptimized. Sorting by `createdAt` and checking for duplicates by `googleBookId` were likely causing collection scans or inefficient index usage.
**Action:** Always verify indexes for list views (sort order) and uniqueness checks (compound keys). Added `{ user: 1, createdAt: -1 }` and `{ user: 1, googleBookId: 1 }`.
