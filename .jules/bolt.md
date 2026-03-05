## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2025-03-05 - Missing Indexes on LibraryItem and Milestone
**Learning:** `LibraryItem` and `Milestone` models lacked composite indexes for user-specific time-based sorting and duplicate prevention. This resulted in unoptimized database queries.
**Action:** Adding `{ user: 1, createdAt: -1 }` and `{ user: 1, googleBookId: 1 }` to `LibraryItem` and `{ user1: 1, date: 1 }` and `{ user2: 1, date: 1 }` to `Milestone` reduces the need for expensive full collection scans and prevents duplicates.
