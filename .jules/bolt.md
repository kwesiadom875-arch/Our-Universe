## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-22 - Missing Indexes on LibraryItem
**Learning:** The `LibraryItem` collection was missing indexes on `user` and `googleBookId`. This causes full collection scans for every user library fetch and duplicate check.
**Action:** Added compound indexes `{ user: 1, createdAt: -1 }` and `{ user: 1, googleBookId: 1 }` to optimize sorting and lookups. Always verify schema indexes for core user-centric models.
