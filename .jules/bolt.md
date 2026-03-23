## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - Avoiding OOM on Name Generation Optimization
**Learning:** Optimizing iterative `findOne` sequential username generation by fetching all matching prefixes (e.g. `User.find({ username: new RegExp('^base[0-9]*$', 'i') })`) creates a severe memory exhaustion risk if the base name is common or evaluates to empty. Furthermore, batch-generating candidates for high-entropy unique fields (like invite codes) via `$in` queries is an unnecessary pessimization compared to simple targeted generation.
**Action:** Do not use unbounded regex queries to resolve sequential name-based unique fields. Stick to targeted `findOne` existence checks, but optimize them by chaining `.select('_id').lean()` to minimize payload and bypass Mongoose document hydration.
