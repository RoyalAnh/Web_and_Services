# Final Completion Checklist

Status meanings: **PASS** = completed and verified; **PARTIAL** = implementation exists but a required portion remains; **UNVERIFIED** = no evidence was collected; **BLOCKED** = requires user-provided identity, credentials, or external access.

| Item | Status | Evidence / remaining action |
|---|---|---|
| Implementation is contained in the Ex3 project folder | PASS | Backend, frontend, docs, Postman, and report files are under this folder. |
| Backend API, JWT authentication, RBAC and business rules | PASS | Implemented; local integration tests cover the requested flows and BR-03/04/07. |
| Frontend login, profile, user/role management and responsive layout | PASS | Local browser smoke checks covered manager/member paths and 375 px viewport. |
| Backend test suite after final lock change | PASS | `npm test`: 38 passed, 0 failed, 0 skipped. |
| Seed repeatability | PASS | Two local runs produced no duplicate users; temporary seed database removed. |
| Local CORS preflight | PASS | Local OPTIONS returned 204 with expected CORS headers. |
| Postman T01–T24 collection | PARTIAL | 24 requests/assertions created; run against the deployed URL remains outstanding. |
| Main report (Markdown) | PARTIAL | Written from available evidence; personal identity, deployment facts, real screenshots, and student answers remain placeholders. |
| Word report generated from the provided template | PASS | See `Ex3-RBAC-MSSV-HoTen.docx`; generated and reopened for structural validation. |
| Test results and evidence boundaries documented | PASS | See `test-results.md`. |
| Deployment and real online CORS/health checks | UNVERIFIED | No host, domain, or online environment was provided or configured. |
| Online screenshots and performance measurements | UNVERIFIED | Must be captured/measured on the student's actual deployment. |
| Student name, ID, account credentials, and self-evaluation | BLOCKED | Supply and complete privately; do not include real passwords in submitted documentation. |
| Git commit | UNVERIFIED | No commit was requested or created. |

Before submission, replace identity placeholders, personally review and answer the report prompts, deploy using authorized accounts, run the Postman collection against the actual host, and add genuine screenshots/results. Do not present local results as online evidence.

