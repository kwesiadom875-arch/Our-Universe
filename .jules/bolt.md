## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2025-05-24 - Missing Indexes on LibraryItem and Milestone
**Learning:** `LibraryItem` (high volume user data) and `Milestone` (frequently sorted by date) were missing indexes on foreign keys (`user`) and sort fields (`createdAt`, `date`). This causes full collection scans for basic user queries.
**Action:** Always verify `Schema.index()` definitions for any field used in `find()` filters or `sort()` operations. Use `Model.schema.indexes()` in tests to enforce this.
