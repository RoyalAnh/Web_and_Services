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
- No backend host/API URL or database host is configured. The published commit's `frontend/config.js` still defaults to `http://localhost:3001/api/v1`; therefore hosted login/API behavior, online CORS, and Postman cannot be verified. A request to `/Ex3-RBAC/health` returns the static host's 404, not an API health response.
- A local, unpushed change now leaves the API base empty on non-local origins and disables login with an explicit message. This prevents credentials from being sent to a visitor's own localhost; the change is not live until the project changes are committed and pushed.
- Local browser smoke check at `http://rbac.localhost:8734/index.html` showed the missing-backend warning and disabled email, password, and submit controls. A Node VM check confirmed loopback hosts retain the local API URL while `rbac.localhost` and `www.pqahust.dev` remain unconfigured.

## Not verified

- Backend/API and database deployment, production API URL, backend CORS and health checks
- Postman T01–T24 against a deployed backend
- Atlas behavior, online performance measurements, or idle/sleep behavior
- Submission screenshots, student identity, and personal deployment choices
