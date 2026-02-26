## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2026-02-26 - LibraryItem Missing Indexes
**Learning:** `LibraryItem` was missing indexes on `user` and `createdAt`, causing inefficient sorting and existence checks (`O(n)` scan per user or full collection). This is a common pattern in this repo where new models are added without performance considerations.
**Action:** When working on `LibraryItem` or similar user-centric collections, always verify and add compound indexes for `{ user: 1, sortField: -1 }` and `{ user: 1, uniqueIdentifier: 1 }`.
