## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-24 - Inconsistent Indexing on User-Partitioned Data
**Learning:** While `MediaItem` was correctly indexed for user-scoped queries, `LibraryItem`—which has identical access patterns (fetch all by user, check existence)—was completely unindexed. This inconsistency suggests that new models might be added without performance review.
**Action:** When auditing models, explicitly check for the "User + sort field" and "User + unique identifier" index pattern on ALL user-owned collections.
