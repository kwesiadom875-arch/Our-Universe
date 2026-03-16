## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - Over-Fetching Mongoose Documents
**Learning:** Fetching the full `User` object (which is often large and frequently requested) simply to check or retrieve `partnerId` in multiple GET routes adds unnecessary Mongoose hydration and network overhead.
**Action:** Always append `.select('partnerId').lean()` when only checking for partner associations, and ensure `.lean()` is applied to downstream read-only database fetches (e.g., arrays returned to frontend) to reduce memory footprint.
