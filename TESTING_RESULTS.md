# Coursework 2 — Initial Verification Record

Verification performed during project update on 25 November 2026.

| Check | Result | Evidence / note |
|---|---|---|
| JavaScript syntax: `server/store.js` | PASS | `node --check server/store.js` |
| JavaScript syntax: `server/index.js` | PASS | `node --check server/index.js` |
| SQLite initial seed | PASS | Database initialized with 2 demo users, 6 events and 7 artist records |
| Event / venue relation mapping | PASS | Event primary key remains distinct from venue foreign key |
| Ticket and seat persistence | PASS | Ticket and selected seat were written and read back from SQLite |
| Duplicate seat constraint | PASS | Attempt to add the same event/seat combination was rejected by SQLite |
| Full frontend build and HTTP integration | NOT RUN | Dependency installation timed out in the preparation environment; run `npm install`, `npm run build` and the manual tests on the submission machine |

**Important:** Do not present the NOT RUN check as passed. Complete the remaining tests on your own computer after installing the dependencies and add screenshots of the results to the final submission.

## Follow-up deployment preparation (25 November 2026)

| Check | Result | Evidence / note |
|---|---|---|
| Node.js runtime | PASS | Node v22.16.0 and npm 10.9.2 available in validation environment |
| Server JavaScript syntax | PASS | `node --check server/index.js` |
| Store JavaScript syntax | PASS | `node --check server/store.js` |
| Frontend production build | BLOCKED | `npm ci` could not complete because package registry access timed out; `vite` therefore was not available |
| Render configuration | PREPARED, NOT DEPLOYED | `render.yaml` defines a Starter web service, Frankfurt region, health check and persistent SQLite disk |
| Live HTTP integration | NOT RUN | Requires successful dependency installation and a running service |
