## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - Over-instantiating Mongoose Documents on Read-only Routes
**Learning:** Routes that only read data and immediately send it as JSON (like `/popular`, `/recommendations`, `/matches`, `/watched` in `media.js` and `movies.js`) were fetching heavy Mongoose documents with internal state tracking. For arrays of results, this severely bloats memory usage and CPU time during serialization.
**Action:** Always append `.lean()` to Mongoose `find()`, `findOne()`, and `findById()` queries when the resulting object will not be mutated (`.save()`) or require virtuals/methods.
