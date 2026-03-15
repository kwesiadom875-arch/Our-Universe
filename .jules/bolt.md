## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - Over-fetching Mongoose Documents
**Learning:** Across multiple core backend routes, the full `User` object was fetched via `findById(req.user.id)` merely to check for or retrieve the `partnerId`. This wastes DB memory and network bandwidth.
**Action:** When only specific fields are needed, always append `.select('fieldName')` combined with `.lean()` to reduce memory footprint and database transfer load.
