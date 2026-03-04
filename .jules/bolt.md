## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2026-03-04 - Mongoose .lean() for Read-Only Queries
**Learning:** Found several frequent read-only Mongoose queries (e.g. `GET /api/memories`, `GET /api/milestones`, `GET /api/timetable`) retrieving arrays of documents without using `.lean()`. This meant Mongoose was unnecessarily instantiating heavy Document objects, increasing memory usage and execution time on basic API fetches.
**Action:** Always append `.lean()` to Mongoose `find()` or `findOne()` queries in `GET` routes when the returned data only needs to be serialized to JSON and no document methods (like `save()`) are required.
