# Final Completion Checklist

Status meanings: **PASS** = completed and verified; **SCOPE NOTE** = the item is outside the recorded verification scope and is not used as evidence for the implementation result.

| Item | Status | Evidence / remaining action |
|---|---|---|
| Implementation is contained in the renamed Ex3 project folder | PASS | Backend, frontend, docs, Postman, and supporting report files are under `Ex3-RBAC`; the main report and DOCX are deliberately kept at repository root. |
| Backend API, JWT authentication, RBAC and business rules | PASS | Implemented; local integration tests cover the requested flows and BR-03/04/07. |
| Frontend login, profile, user/role management and responsive layout | PASS | Local browser smoke checks covered manager/member paths and 375 px viewport. |
| Backend test suite after final lock change | PASS | `npm test`: 38 passed, 0 failed, 0 skipped. |
| Seed repeatability | PASS | Two local runs produced no duplicate users; temporary seed database removed. |
| Local CORS preflight | PASS | Local OPTIONS returned 204 with expected CORS headers. |
| Hosted API scenarios corresponding to T01–T24 | PASS | Separate local HTTP harness executed all 24 expected cases against Render: 24/24 passed; disposable data was cleaned and demo accounts re-verified. |
| Hosted API regression scenarios corresponding to Postman T01–T24 | PASS | An independent HTTP harness executed all 24 scenarios against Render with the expected status and response assertions; disposable data was cleaned afterward. |
| Main report (Markdown) | PASS | Core implementation evidence, hosted API results, and three role screenshots are recorded; secrets and personal credentials are intentionally excluded. |
| Word report generated from the provided template | PASS | The builder reads the repository-root report Markdown and writes `Ex3-RBAC-2025229M-PhamQuangAnh.docx` beside it. |
| Test results and evidence boundaries documented | PASS | See `test-results.md`. |
| Static frontend deployment | PASS | GitHub Pages serves the RBAC UI at `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`; HTTP 200 and browser smoke check. |
| Backend and MongoDB Atlas deployment | PASS | Render service `https://web-and-services-rbac.onrender.com` started successfully; `/health` returned HTTP 200. |
| Frontend-to-API configuration | PASS | Commit `fdd3c28` is published; live Pages config targets the Render API on non-local hosts and browser loads the hosted login page. |
| Anonymous API authorization and CORS preflight | PASS | Protected `/api/v1/users` returns 401 without token; allowed-origin OPTIONS preflight returns 204 with expected CORS headers. |
| Four online demo account logins and role permissions | PASS | Each seeded demo account logged in (HTTP 200), `/me` returned HTTP 200, and expected role permission checks passed. Passwords are not included in this report. |
| Hosted API regression suite on the deployed service | PASS | The corresponding 24-case suite recorded 24/24 passing against the deployed Render API. |
| Three role-specific UI screenshots requested by assignment | PASS | `report/evidence/admin.png`, `manager.png`, and `member.png` are included in the main report. |
| Additional online screenshots and performance measurements | SCOPE NOTE | The report records functional verification results; no performance claim is made. |
| Personal identity and account credentials | PASS | Personal credentials and secrets are excluded from the repository and report. |
| Removal of mistakenly pushed duplicate old folder | PASS | Commit `bee198c1104494ffdad75099a1da2c7e65ea32fc` deletes only the 27 old-path files; `Ex3-RBAC` remains. |

The report uses the recorded local and hosted verification results. Secrets, tokens, passwords, and personal account data are intentionally excluded.
