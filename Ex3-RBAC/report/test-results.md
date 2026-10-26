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
- The Postman collection contains 24 requests with assertions, but has **not** been run against an online host.

## Hosted static frontend

- GitHub repository path: `Ex3-RBAC` on `master`; the duplicate `Ex3-RBAC-2025229M-PhamQuangAnh` directory was removed in commit `bee198c1104494ffdad75099a1da2c7e65ea32fc`.
- Pages workflow for the preceding published source commit `e8f5e696c35a1a942f383e85df439fbcd1055286` completed successfully.
- `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`: HTTP 200; browser loaded the RBAC login screen. The `/Ex3-RBAC/` directory URL renders the repository README instead.
- The Pages workflow for cleanup commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` completed successfully (build, deploy, and report jobs).
- `https://www.pqahust.dev/health` and `/Ex3-RBAC/health` return HTTP 404 from the static Pages site; these are not backend health responses and confirm no API service is mounted at those Pages routes.
- `/Ex3-RBAC/health` returns the static host's 404, not an API health response; use the Render service's `/health` endpoint instead.
- The currently published `frontend/config.js` still leaves the API base empty on non-local origins, so the live Pages page is not yet connected to Render. The local source has now been changed to use the Render API on non-loopback hosts; publish this update and verify it from the browser before claiming the hosted login UI is connected.
- Local browser testing previously verified the safe disabled-login state for an unconfigured remote API. The current source preserves the local API URL on loopback hosts and selects the Render API elsewhere.

## Hosted API and Atlas

- Render service URL: `https://web-and-services-rbac.onrender.com`.
- Render logs confirm the API started and the service became live on October 26, 2026 using commit `6002ff3da3e6c9a1ae7d57f741c5ce01412214e6`.
- `GET /health`: HTTP 200 with `{"status":"ok"}`. Because the server waits for `mongoose.connect()` before listening, successful startup also confirms the configured Atlas connection succeeded at that time.
- `GET /api/v1/users` without a token: HTTP 401, as expected for a protected API.
- OPTIONS preflight from `https://www.pqahust.dev` to the API: HTTP 204. Observed headers: `Access-Control-Allow-Origin: https://www.pqahust.dev`; `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`; `Access-Control-Allow-Headers: Authorization,Content-Type`; `Access-Control-Expose-Headers: Location`; `Access-Control-Max-Age: 600`; `Vary: Origin`.
- No authenticated online login or full Postman T01–T24 run has been recorded yet. Do not treat the anonymous 401/preflight checks as evidence for the full suite.
- During initial Render configuration, observed startup errors were `MONGODB_URI is required` and an Atlas network/IP allowlist connection failure. After environment/network configuration, the service started and the health check passed.

## Not verified

- Authenticated online login and Postman T01–T24 against the deployed API
- Atlas behavior, online performance measurements, or idle/sleep behavior
- Submission screenshots, student identity, and personal deployment choices
