# Test and Local Verification Results

## Backend automated tests

- Command: `cd backend; npm test`
- Runtime: Node.js v22.20.0, npm 10.9.3, local MongoDB
- Final result after the last-admin lock cleanup change: **38 passed, 0 failed, 0 skipped**
- Duration reported by Node test runner: 3.10 seconds
- Coverage includes the T01–T24 API behaviors, authentication and authorization, request validation, role/user lifecycle, BR-03/BR-04/BR-07, and utility parsing/escaping checks.
- The BR-04 tests include concurrent attempts to lock the remaining super-admin and confirm only one action is allowed.

This is a local integration/unit test run. It is not evidence that the hosted deployment, MongoDB Atlas, or the Postman Collection Runner has been tested.

## Other local checks recorded during implementation

- Seed was run twice against a temporary database: the first run created 10 permissions, 5 roles, and 4 demo users; the second run did not create duplicate users. The temporary seed database was removed after verification.
- Local CORS preflight returned HTTP 204 with the expected allow-origin, methods, headers, and exposed `Location` header.
- Browser smoke checks covered manager login, role loading, validation feedback, member permission-gated navigation, and a 375 px viewport.
- The Postman collection contains 24 requests with assertions, but has **not** been run against an online host.

## Not verified

- Online deployment, production URLs, host-specific CORS and health checks
- Postman T01–T24 against a deployed backend
- Atlas behavior, online performance measurements, or idle/sleep behavior
- Submission screenshots, student identity, and personal deployment choices

