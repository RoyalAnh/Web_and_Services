# Fullstack RBAC (IT4409)

Node.js/Express 5 + MongoDB/Mongoose API and a responsive React/Axios browser client, implementing the RBAC assignment specification.

## Requirements

- Node.js 20 or newer (developed with Node.js 22.20.0).
- MongoDB 6+ reachable by the backend.
- A static HTTP server for `frontend/` (for example VS Code Live Server). Do not open the page with `file://`.

## Local setup

From this project folder:

```powershell
Copy-Item .env.example .env
```

Edit `.env` before use:

- Set a random `JWT_SECRET` of at least 32 characters.
- Set `MONGODB_URI` to a dedicated `it4409_rbac` database.
- Set strong, unique local-only passwords for each `SEED_*_PASSWORD`.
- Replace the example `.test` email/name values with identities you are authorized to use. The examples are fake and are not student accounts.
- Set `CORS_ORIGINS` to the exact local frontend origin(s).

Install and seed from the `backend` folder:

```powershell
Set-Location backend
npm install
npm run seed
npm start
```

The seed is idempotent: it upserts the permission catalog and system/sample roles and creates configured demo users only when they do not already exist. It does not clear collections or overwrite existing passwords. Keep `.env` private and never commit it.

Serve `frontend/` on `http://127.0.0.1:5500` or `http://localhost:5500`. The API base URL is `frontend/config.js`; change it to the deployed API base when publishing the static frontend. The frontend obtains credentials through the login form and keeps the access token in `sessionStorage`.

## API

Base URL: `http://localhost:3001/api/v1`

Implemented routes:

| Method | Path | Permission |
|---|---|---|
| POST | `/auth/tokens` | Public |
| GET | `/me` | Authenticated |
| GET, POST | `/users` | `users:read`, `users:create` |
| GET, PATCH, DELETE | `/users/:userId` | `users:read`, `users:update`, `users:delete` |
| GET | `/users/:userId/roles` | `users:read` |
| PUT, DELETE | `/users/:userId/roles/:roleId` | `roles:assign` |
| GET, POST | `/roles` | `roles:read`, `roles:create` |
| GET, PATCH, DELETE | `/roles/:roleId` | `roles:read`, `roles:update`, `roles:delete` |
| GET, PUT | `/roles/:roleId/permissions` | `roles:read`, `roles:update` |
| GET | `/permissions` | `permissions:read` |

User list supports `q`, `status`, `roleId`, `sort`, `page`, and `limit`. Role list supports `q`, `sort`, `page`, and `limit`. Errors use `{ "error": { "code", "message", "details?" } }`.

## Tests

```powershell
Set-Location backend
npm test
```

Integration tests use a disposable database named `it4409_rbac_test_<process id>` on the local MongoDB service by default. To use another test database, set `TEST_MONGODB_URI` to a database reserved for tests; the suite deletes that database's test data. Do not point it at a production or personal database.

## Postman T01–T24

Import `postman/RBAC-T01-T24.postman_collection.json`. See [`docs/postman-online-test-guide.md`](./docs/postman-online-test-guide.md) for setup, disposable-account requirements, expected status/body for every case, curl.exe examples, and screenshot guidance.

Configure the collection variables before running the requests sequentially:

- `baseUrl`: API origin without `/api/v1`.
- `adminToken`, `auditorToken`, `memberToken`: access tokens obtained by logging into the seeded accounts.
- `managerToken`, `managerUserId`: token and ID of a disposable manager account; T15 revokes its manager role.
- `superAdminRoleId`, `managerRoleId`, `auditorRoleId`, `memberRoleId`: IDs from `/roles`.
- `softDeleteUserId`, `softDeleteEmail`, `softDeletePassword`: a disposable, non-super-admin user and its local test credentials.
- `roleInUseId`, `customRoleId`: ID of `support-observer`, a non-system role assigned to a non-deleted user.

T06 records `createdUserId` and a unique `testEmail` for subsequent requests. T16 runs before T15 so it verifies the manager cannot delete users while holding the manager role; T15 then revokes that role and confirms the old token is denied immediately. T17 soft-deletes a separate disposable user. Do not use the primary demo manager account for T15.

## Deployment

The static frontend is published at [https://www.pqahust.dev/Ex3-RBAC/frontend/index.html](https://www.pqahust.dev/Ex3-RBAC/frontend/index.html) using GitHub Pages. The Express API is deployed at `https://web-and-services-rbac.onrender.com` and uses MongoDB Atlas. The frontend uses the local API on loopback hosts and the Render API on other hosts. Free Render instances can spin down while idle; see [docs/deployment.md](./docs/deployment.md).
