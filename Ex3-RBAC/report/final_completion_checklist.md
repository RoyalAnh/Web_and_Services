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
| Postman T01–T24 collection | PARTIAL | 24 requests/assertions created; run against the deployed URL remains outstanding. |
| Main report (Markdown) | PARTIAL | Written from available evidence; personal identity, deployment facts, real screenshots, and student answers remain placeholders. |
| Word report generated from the provided template | PASS | The builder reads the repository-root report Markdown and writes `Ex3-RBAC-2025229M-PhamQuangAnh.docx` beside it. |
| Test results and evidence boundaries documented | PASS | See `test-results.md`. |
| Static frontend deployment | PASS | GitHub Pages serves the RBAC UI at `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`; HTTP 200 and browser smoke check. |
| Backend and MongoDB Atlas deployment | PASS | Render service `https://web-and-services-rbac.onrender.com` started successfully; `/health` returned HTTP 200. |
| Frontend-to-API configuration | PARTIAL | Source config now targets Render API on non-local hosts; Pages deployment and browser network check after this latest source change still need confirmation. |
| Anonymous API authorization and CORS preflight | PASS | Protected `/api/v1/users` returns 401 without token; allowed-origin OPTIONS preflight returns 204 with expected CORS headers. |
| Authenticated online login and Postman T01–T24 | UNVERIFIED | Needs seeded demo users and an online collection run. |
| Online screenshots and performance measurements | UNVERIFIED | Must be captured/measured on the student's actual deployment. |
| Student name, ID, account credentials, and self-evaluation | BLOCKED | Supply and complete privately; do not include real passwords in submitted documentation. |
| Removal of mistakenly pushed duplicate old folder | PASS | Commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` deletes only the 27 old-path files; `Ex3-RBAC` remains. |

Before submission, verify the latest GitHub Pages config is live, seed authorized demo accounts, run the Postman collection against the actual API, and add genuine screenshots/results. Personally review and answer the reflection prompts; do not present local results as online evidence.
