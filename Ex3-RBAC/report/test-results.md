# Test and Local Verification Results

## Backend automated tests

- Command: `cd backend; npm test`
- Runtime: Node.js v22.20.0, npm 10.9.3, local MongoDB
- Final result after the last-admin lock cleanup change: **38 passed, 0 failed, 0 skipped**
- Latest rerun from the renamed `Ex3-RBAC/backend` folder: 38 passed, 0 failed, 0 skipped; 27.04 seconds including local MongoDB integration setup.
- Coverage includes the T01–T24 API behaviors, authentication and authorization, request validation, role/user lifecycle, BR-03/BR-04/BR-07, and utility parsing/escaping checks.
- The BR-04 tests include concurrent attempts to lock the remaining super-admin and confirm only one action is allowed.

This is a local integration/unit test run. It is not evidence that the hosted API, MongoDB Atlas, or the Postman Collection Runner has been tested.

## Other local checks recorded during implementation

- Seed was run twice against a temporary database: the first run created 10 permissions, 5 roles, and 4 demo users; the second run did not create duplicate users. The temporary seed database was removed after verification.
- Local CORS preflight returned HTTP 204 with the expected allow-origin, methods, headers, and exposed `Location` header.
- Browser smoke checks covered manager login, role loading, validation feedback, member permission-gated navigation, and a 375 px viewport.
- The Postman collection contains 24 requests with assertions. An independent HTTP harness exercised all 24 corresponding API scenarios against the hosted service; the measured results are recorded below.

## Hosted static frontend

- GitHub repository path: `Ex3-RBAC` on `master`; the duplicate `Ex3-RBAC-2025229M-PhamQuangAnh` directory was removed in commit `bee198c1104494ffdad75099a1da2c7e65ea32fc`.
- Pages workflow for the preceding published source commit `e8f5e696c35a1a942f383e85df439fbcd1055286` completed successfully.
- `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`: HTTP 200; browser loaded the RBAC login screen. The `/Ex3-RBAC/` directory URL renders the repository README instead.
- The Pages workflow for cleanup commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` completed successfully (build, deploy, and report jobs).
- `https://www.pqahust.dev/health` and `/Ex3-RBAC/health` return HTTP 404 from the static Pages site; these are not backend health responses and confirm no API service is mounted at those Pages routes.
- `/Ex3-RBAC/health` returns the static host's 404, not an API health response; use the Render service's `/health` endpoint instead.
- Commit `fdd3c285c94320d20a4e64cbbaf1fd833cae1694` configures the frontend to use Render on non-loopback hosts. After publishing, a cache-busted fetch of the live Pages config returned `https://web-and-services-rbac.onrender.com/api/v1`; the hosted login page loaded in the browser.
- Local browser testing previously verified the safe disabled-login state for an unconfigured remote API. The live source now preserves the local API URL on loopback hosts and selects the Render API elsewhere.

## Hosted API and Atlas

- Render service URL: `https://web-and-services-rbac.onrender.com`.
- Render logs confirm the API started and the service became live on October 26, 2026 using commit `6002ff3da3e6c9a1ae7d57f741c5ce01412214e6`.
- `GET /health`: HTTP 200 with `{"status":"ok"}`. Because the server waits for `mongoose.connect()` before listening, successful startup also confirms the configured Atlas connection succeeded at that time.
- `GET /api/v1/users` without a token: HTTP 401, as expected for a protected API.
- OPTIONS preflight from `https://www.pqahust.dev` to the API: HTTP 204. Observed headers: `Access-Control-Allow-Origin: https://www.pqahust.dev`; `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`; `Access-Control-Allow-Headers: Authorization,Content-Type`; `Access-Control-Expose-Headers: Location`; `Access-Control-Max-Age: 600`; `Vary: Origin`.
- The deployed API was checked with the corresponding hosted HTTP regression suite and the seeded-account checks documented below.
- During initial Render configuration, observed startup errors were `MONGODB_URI is required` and an Atlas network/IP allowlist connection failure. After environment/network configuration, the service started and the health check passed.

## Online demo account verification

- Seeded the configured Atlas database: 10 permissions, 5 roles, and 4 new users.
- A local strength check found the initial seed password values were not suitable for the public demo service. Before final login verification, four unique stronger values were set in the ignored local `.env` and the existing account password hashes were updated in a database transaction. No credential values or tokens were logged or included here.
- Tested each account against hosted `POST /api/v1/auth/tokens` and authenticated `GET /api/v1/me`: all four login requests and `/me` requests returned HTTP 200.
- Permission checks passed: super-admin has 10 permissions including `users:delete` and `roles:update`; user-manager has 6 including `users:create` and excluding `users:delete`; auditor has 3 including `users:read` and excluding `users:update`; member has 0 permissions.
- These targeted login/authorization checks passed online.

## Hosted T01–T24 API scenarios

- Executed all 24 corresponding HTTP scenarios and status/error assertions against the Render API using a temporary local harness and disposable test accounts: **24/24 passed**.
- The run covered unauthenticated and role-limited access, pagination/search/validation, create/update and duplicate behavior, privilege escalation prevention, idempotent role assignment, immediate permission revocation, soft-delete behavior, protected system roles, invalid permissions, spoofed role headers, and malformed JSON.
- Refined T04 to search for the actual seeded `Demo` accounts and require at least one matching result. Reordered T16 before T15 so manager delete denial is checked before revoking the disposable manager's role; verified both cases and immediate revocation against the live API.
- Temporary test users were deleted or soft-deleted; a follow-up query found no active disposable accounts. All four seeded demo accounts were then re-verified successfully.
- The hosted regression run used a temporary HTTP harness against the deployed API and recorded **24/24 passed**. The Postman collection remains available as the reproducible request and assertion definition for T01–T24.
- Three role-specific frontend screenshots are included in `report/evidence/`: `admin.png`, `manager.png`, and `member.png`. They show the super-admin user list, manager user list without delete controls, and member profile without admin permissions.

## Verification scope

- Functional API, authentication, authorization, seed repeatability, CORS, hosted deployment, demo-account access, and the 24 corresponding hosted API scenarios are covered by the results above.
- No performance claim is made; credentials, tokens, and personal identity data are intentionally excluded.
