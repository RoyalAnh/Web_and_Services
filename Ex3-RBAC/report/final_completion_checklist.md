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
| Static frontend deployment | PASS | GitHub Pages serves the login UI at `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`; HTTP 200, browser smoke check, and Pages deployment workflow succeeded for commit `bee198c`. |
| Preventing login attempts without a configured remote API | PASS (local change only) | Local browser check confirms the warning and disabled login controls; not yet published. |
| Backend/API and database deployment | BLOCKED | No backend/database host or API URL is available. The published commit still uses localhost; the unpushed frontend change blocks login on remote origins until configured. |
| Online CORS, API health and Postman T01–T24 | BLOCKED | Cannot run without an online backend/API. |
| Online screenshots and performance measurements | UNVERIFIED | Must be captured/measured on the student's actual deployment. |
| Student name, ID, account credentials, and self-evaluation | BLOCKED | Supply and complete privately; do not include real passwords in submitted documentation. |
| Removal of mistakenly pushed duplicate old folder | PASS | Commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` deletes only the 27 old-path files; `Ex3-RBAC` remains. |

Before submission, deploy the backend and database using authorized accounts, update the frontend API URL, run the Postman collection against the actual API, and add genuine screenshots/results. Personally review and answer the reflection prompts; do not present local results as online evidence.
