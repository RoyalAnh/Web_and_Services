# Deployment guide

This guide records the deployment setup for the project. The static frontend is published through GitHub Pages; the Express API runs on Render and connects to MongoDB Atlas. Do not place secrets in source control or in the report.

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
- `frontend/config.js` keeps loopback development on `http://localhost:3001/api/v1` and selects `https://web-and-services-rbac.onrender.com/api/v1` on other hosts. Publish the static files after changing frontend configuration.
- Add the exact HTTPS frontend origin to backend `CORS_ORIGINS` and redeploy the backend.
- Verify the preflight response for `Authorization`, `Content-Type`, `PATCH`, `PUT`, and `DELETE`; ensure `Location` is exposed for 201 responses.

The backend is deployed at `https://web-and-services-rbac.onrender.com`, with MongoDB Atlas configured. The health endpoint, protected-route authorization response, and allowed/disallowed CORS preflight behavior have been verified. Commit `fdd3c28` is published on Pages and the served config targets the Render API. Four seeded demo accounts were verified against hosted login and `/me`; all 24 corresponding API scenarios passed against the live service using a temporary HTTP harness. A Postman Collection Runner screenshot has not been captured.

## Before sharing the deployment

- Demo accounts for super-admin, user-manager, auditor, and member are seeded; do not reuse personal passwords.
- Test T01–T24 against the deployed URL using disposable accounts.
- Check the actual HTTPS origins, status codes, `Location` header, mobile layout, and application logs.
- Capture the assignment screenshots yourself and redact passwords, full tokens, connection strings, and secrets.
- Record actual deployment URLs, commit hash, timing measurements, and incident history only after observing them.
