# Final Completion Checklist

Status meanings: **PASS** = completed and verified; **PARTIAL** = implementation exists but a required portion remains; **UNVERIFIED** = no evidence was collected; **BLOCKED** = requires user-provided identity, credentials, or external access.

| Item | Status | Evidence / remaining action |
|---|---|---|
| Implementation is contained in the renamed Ex3 project folder | PASS | Backend, frontend, docs, Postman, and supporting report files are under `Ex3-RBAC`; the main report and DOCX are deliberately kept at repository root. |
| Backend API, JWT authentication, RBAC and business rules | PASS | Implemented; local integration tests cover the requested flows and BR-03/04/07. |
| Frontend login, profile, user/role management and responsive layout | PASS | Local browser smoke checks covered manager/member paths and 375 px viewport. |
| Backend test suite after final lock change | PASS | `npm test`: 38 passed, 0 failed, 0 skipped. |
| Seed repeatability | PASS | Two local runs produced no duplicate users; temporary seed database removed. |
| Local CORS preflight | PASS | Local OPTIONS returned 204 with expected CORS headers. |
| Hosted API scenarios corresponding to T01–T24 | PASS | Separate local HTTP harness executed all 24 expected cases against Render: 24/24 passed; disposable data was cleaned and demo accounts re-verified. |
| Postman Collection Runner screenshot | UNVERIFIED | Collection Runner UI was not run/captured; use it if the submission requires that specific evidence. |
| Main report (Markdown) | PARTIAL | Written from available evidence; personal identity, deployment facts, real screenshots, and student answers remain placeholders. |
| Word report generated from the provided template | PASS | The builder reads the repository-root report Markdown and writes `Ex3-RBAC-2025229M-PhamQuangAnh.docx` beside it. |
| Test results and evidence boundaries documented | PASS | See `test-results.md`. |
| Static frontend deployment | PASS | GitHub Pages serves the RBAC UI at `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`; HTTP 200 and browser smoke check. |
| Backend and MongoDB Atlas deployment | PASS | Render service `https://web-and-services-rbac.onrender.com` started successfully; `/health` returned HTTP 200. |
| Frontend-to-API configuration | PASS | Commit `fdd3c28` is published; live Pages config targets the Render API on non-local hosts and browser loads the hosted login page. |
| Anonymous API authorization and CORS preflight | PASS | Protected `/api/v1/users` returns 401 without token; allowed-origin OPTIONS preflight returns 204 with expected CORS headers. |
| Four online demo account logins and role permissions | PASS | Each seeded demo account logged in (HTTP 200), `/me` returned HTTP 200, and expected role permission checks passed. Passwords are not included in this report. |
| Postman Collection Runner on the hosted API | UNVERIFIED | A separate HTTP harness verified the corresponding API cases; capture a Postman Runner result only if required. |
| Three role-specific UI screenshots requested by assignment | UNVERIFIED | Capture super-admin, user-manager, and member screens from the deployed frontend. |
| Additional online screenshots and performance measurements | UNVERIFIED | Capture only if required by the report/teacher and measure on the student's actual deployment. |
| Student name, ID, account credentials, and self-evaluation | BLOCKED | Supply and complete privately; do not include real passwords in submitted documentation. |
| Removal of mistakenly pushed duplicate old folder | PASS | Commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` deletes only the 27 old-path files; `Ex3-RBAC` remains. |

Before submission, capture the three genuine role-specific UI screenshots requested in the assignment, then add any extra evidence the report/teacher requires. Personally review and answer the reflection prompts; do not present local results as online evidence.
