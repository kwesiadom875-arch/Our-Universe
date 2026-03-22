## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - N+1 Queries on Sequential Field Generation
**Learning:** Generating unique fields (like `username` and `inviteCode`) using sequential `findOne` queries inside a `while` loop caused a massive N+1 query problem, especially under contention or when many similar usernames existed. This adds unnecessary latency and database load.
**Action:** When creating unique sequential text fields (like `baseName1`, `baseName2`), use a single regex `find()` anchored to the base name combined with `.lean()` and `.select()`, then resolve collisions locally using a `Set`. For random code generation with collision retry, generate a batch of candidates and check them in a single query using `$in`.
