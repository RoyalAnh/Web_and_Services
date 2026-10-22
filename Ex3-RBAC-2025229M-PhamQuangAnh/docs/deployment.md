# Deployment guide

This guide describes a repeatable deployment path; it is not evidence that a deployment has already occurred. Do not place secrets in source control or in the report.

## MongoDB Atlas

1. Create a dedicated database (for example `it4409_rbac`) and a database user with only the permissions the application needs.
2. Restrict Network Access to the backend host's outbound addresses where possible. Avoid leaving broad `0.0.0.0/0` access enabled.
3. Copy the connection string into the backend host's secret environment settings as `MONGODB_URI`. URL-encode reserved characters in the database password.
4. Run `npm run seed` once against the intended database using the host environment (or a secure one-off job). Do not run a destructive seed against a shared database.

## Backend host (example: Render)

- Root directory: `Ex3-RBAC-2025229M-PhamQuangAnh/backend`
- Build command: `npm install`
- Start command: `npm start`
- Configure `NODE_ENV=production`, `PORT` (provided by the host), `MONGODB_URI`, a strong unique `JWT_SECRET`, `ACCESS_TOKEN_TTL=3600`, and `CORS_ORIGINS` with the exact static frontend origin.
- Configure the `SEED_*` email/name/password variables only for the deliberate seed operation. Remove seed credentials from the runtime service after creating authorized accounts.
- Confirm the host's health endpoint at `/health` and review server logs. The API starts listening only after MongoDB connects.

## Frontend static host (example: Netlify)

- Publish directory: `frontend`
- No build step is required.
- Update `frontend/config.js` to the API base URL ending in `/api/v1`, then publish the static files.
- Add the exact HTTPS frontend origin to backend `CORS_ORIGINS` and redeploy the backend.
- Verify the preflight response for `Authorization`, `Content-Type`, `PATCH`, `PUT`, and `DELETE`; ensure `Location` is exposed for 201 responses.

## Before sharing the deployment

- Create separate authorized accounts for super-admin, user-manager, auditor, and member; do not reuse personal passwords.
- Verify every account's actual permission matrix and test T01–T24 against the deployed URL.
- Check the actual HTTPS origins, status codes, `Location` header, mobile layout, and application logs.
- Capture the assignment screenshots yourself and redact passwords, full tokens, connection strings, and secrets.
- Record actual deployment URLs, commit hash, timing measurements, and incident history only after observing them.
