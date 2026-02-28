## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2026-02-28 - Missing Compound Indexes for Multi-field $or Queries
**Learning:** The `Milestone` model had no explicit indexes, yet it was being queried with an `$or` condition on `user1` and `user2`, followed by a sort on `date`. Without indexes, this requires a full collection scan and in-memory sort, which scales poorly.
**Action:** Always add explicit compound indexes for fields used in `$or` queries that are also combined with sorting (e.g., `{ user1: 1, date: 1 }` and `{ user2: 1, date: 1 }`).
