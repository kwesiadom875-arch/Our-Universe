## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-24 - Missing Indexes on Relationship Models
**Learning:** `Milestone` (user relationships) and `LibraryItem` (user collections) were missing indexes on `user` and sort fields (`date`, `createdAt`). This causes full collection scans for basic user profile/dashboard views.
**Action:** When creating models that belong to a user, ALWAYS index `{ user: 1, [sortField]: -1 }` immediately. Don't wait for the dataset to grow.
