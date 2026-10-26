# Deployment guide

This guide describes the remaining backend/database deployment path. The static frontend is already published from the repository through GitHub Pages; that does not run the Express API or MongoDB. Do not place secrets in source control or in the report.

## MongoDB Atlas

1. Create a dedicated database (for example `it4409_rbac`) and a database user with only the permissions the application needs.
2. Give the application database user the built-in `readWrite` role on only `it4409_rbac`. Do not use an `atlasAdmin` or all-resources account in the application.
3. Restrict Network Access to the backend host's outbound IP ranges. Render shows the applicable ranges under the service's **Connect > Outbound** tab. Avoid leaving broad `0.0.0.0/0` access enabled.
4. Copy the connection string into the backend host's secret environment settings as `MONGODB_URI`. URL-encode reserved characters in the database password.
5. Run `npm run seed` once against the intended database using a secure one-off job or a local CLI connection. Do not run a destructive seed against a shared database.

See [`render.env.example`](../render.env.example) for the Render variable names and seed variable names. It contains placeholders only. Do not upload it, `.env`, or any credentials file as a secret-file substitute; enter runtime variables in Render's Environment settings.

## Backend host (example: Render)

- Root directory: `Ex3-RBAC/backend`
- Build command: `npm install`
- Start command: `npm start`
- Configure `NODE_ENV=production`, `PORT` (provided by the host), `MONGODB_URI`, a strong unique `JWT_SECRET`, `ACCESS_TOKEN_TTL=3600`, and `CORS_ORIGINS` with the exact static frontend origin.
- Configure the `SEED_*` email/name/password variables only for the deliberate seed operation. Remove seed credentials from the runtime service after creating authorized accounts.
- Confirm the host's health endpoint at `/health` and review server logs. The API starts listening only after MongoDB connects.

## Frontend static host (current: GitHub Pages)

- The current frontend page is `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`.
- The repository path `https://www.pqahust.dev/Ex3-RBAC/` renders the project README, not the React application.
- GitHub Pages serves static files only; it does not start the Express API or MongoDB.
- Update `frontend/config.js` to the API base URL ending in `/api/v1`, then publish the static files.
- Add the exact HTTPS frontend origin to backend `CORS_ORIGINS` and redeploy the backend.
- Verify the preflight response for `Authorization`, `Content-Type`, `PATCH`, `PUT`, and `DELETE`; ensure `Location` is exposed for 201 responses.

No backend API URL or database host has been configured. The latest source commit leaves the API base unset on non-local hosts, disables the login form, and explains that the backend is unavailable. GitHub Pages deployment follows the push and may take a few minutes. After a backend is deployed, set `window.RBAC_API_BASE` in `frontend/config.js`, publish the updated frontend, and verify login before sharing the URL.

## Before sharing the deployment

- Create separate authorized accounts for super-admin, user-manager, auditor, and member; do not reuse personal passwords.
- Verify every account's actual permission matrix and test T01–T24 against the deployed URL.
- Check the actual HTTPS origins, status codes, `Location` header, mobile layout, and application logs.
- Capture the assignment screenshots yourself and redact passwords, full tokens, connection strings, and secrets.
- Record actual deployment URLs, commit hash, timing measurements, and incident history only after observing them.
