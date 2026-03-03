## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-23 - Read-Only Query Overheads
**Learning:** Returning large arrays of Mongoose documents from read-only routes (like feeds or lists) uses significantly more memory and CPU than necessary because Mongoose creates full, tracking instances. This overhead was observed across the `/memories`, `/media`, and `/milestones` endpoints where data is only serialized to JSON.
**Action:** Always append `.lean()` to `find()` queries when the returned documents will not be modified (`save()`, `remove()`). This skips document instantiation and returns plain JavaScript objects, offering a measurable performance boost.
