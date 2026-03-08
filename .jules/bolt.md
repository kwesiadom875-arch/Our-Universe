## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2025-03-08 - Optimize User Queries for partnerId Retrieval
**Learning:** Found an anti-pattern across backend routes where the entire `User` document was retrieved using `User.findById(req.user.id)` merely to check for or retrieve `user.partnerId`. For a potentially large user document, this increases DB transfer overhead and slows down server-side Mongoose hydration.
**Action:** When querying the `User` object solely to retrieve `partnerId`, append `.select('partnerId')` to the query in combination with `.lean()` to minimize database transfer load and skip Mongoose instantiation overhead.
