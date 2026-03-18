## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-03-18 - Case-Insensitive Regex in MongoDB
**Learning:** In MongoDB, case-insensitive regex queries (e.g., using the 'i' flag) cannot efficiently use standard B-Tree indexes without a specific case-insensitive collation defined. Using them for string matching forces MongoDB to perform a full index scan (or a full collection scan), which severely degrades performance rather than optimizing it.
**Action:** Never use case-insensitive regex queries for performance optimizations when checking uniqueness or searching fields, as they trigger full index or collection scans.
