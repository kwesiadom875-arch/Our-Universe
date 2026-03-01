## 2024-05-22 - Missing Indexes on Core Models
**Learning:** The `Swipe` collection, which grows linearly with user activity, had no indexes defined. This caused O(n) scans for every `/popular` request (filtering seen items) and every match check. This is a critical scalability bottleneck often overlooked in early prototypes.
**Action:** Always check schema definitions for indexes on foreign keys (`user`) and frequently queried fields (`tmdbId`, `action`) during initial code review. Use `explain()` (or schema inspection if DB is offline) to verify.

## 2024-05-22 - Missing Indexes on LibraryItem Model
**Learning:** The `LibraryItem` model was queried heavily by `user` and sorted by `createdAt` in library fetches, but it lacked the appropriate compound index `{ user: 1, createdAt: -1 }`. Furthermore, inserting an item checked for uniqueness using `user` and `googleBookId`, yet there was no index for this.
**Action:** Always verify that every database model being heavily fetched by user and ordered by date or verified for uniqueness via two fields, has the proper corresponding compound indexes, such as `{ user: 1, createdAt: -1 }` and `{ user: 1, externalId: 1 }` respectively.
