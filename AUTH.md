# Authentication setup

Copy `.env.example` to `.env` and set the MySQL connection details plus two different random JWT secrets of at least 32 characters. Do not commit `.env`.

For Aiven, set `DB_SSL=true`, use the Aiven host, port, user, password, and database name, and provide the downloaded CA certificate path in `DB_SSL_CA_PATH`. The API requires this certificate and verifies it; TLS certificate validation stays enabled.

Keep a local CA certificate at `.certs/aiven-ca.pem` (this directory is ignored by Git) and set `DB_SSL_CA_PATH=.certs/aiven-ca.pem` in `.env`.

For a new, empty database, apply [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql) once using the Aiven SQL console or a MySQL client. It creates the health center, user, medicine, inventory, transfer, and disposal tables, including a unique username index. Do not apply it blindly to an existing schema; `CREATE TABLE IF NOT EXISTS` leaves existing tables unchanged.

The MySQL `users` table must contain `user_id`, `username`, `password`, `role`, and nullable `refresh_token` columns. `username` needs a unique index so concurrent duplicate registrations are rejected by MySQL. `password` must hold bcrypt hashes (allow at least 60 characters). The `refresh_token` column stores only a SHA-256 digest; allow at least 64 characters. If an existing table does not yet have `refresh_token`, add it with:

```sql
ALTER TABLE users ADD COLUMN refresh_token CHAR(64) NULL;
```

Start the API with `npm run start:dev`. Register with `POST /auth/register` using `username` and `password`, then log in with `POST /auth/login`. Send the returned access token as `Authorization: Bearer <accessToken>` for protected routes. Refresh with `POST /auth/refresh` and the returned `refreshToken`; each refresh rotates and invalidates the prior token. `POST /auth/logout` requires a bearer access token and revokes the currently stored refresh token for that user.

## Render deployment

Set the Render build command to `npm ci && npm run build` and the start command to `npm start`. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `DB_SSL_CA` (the PEM contents of the Aiven CA certificate), `JWT_ACCESS_TOKEN_SECRET`, and `JWT_REFRESH_TOKEN_SECRET` in the Render environment. Use different JWT secrets of at least 32 characters. Render provides `PORT` automatically. Do not configure the service start command as `node run start:dev`.

The root health response remains public. Registration, login, and refresh are public routes; refresh still requires a valid, unrevoked refresh token in its request body. All NestJS application data routes require a valid access token. Public registration always assigns the ordinary `Staff` role used by the provided schema.

## Inventory API

Send the access token as a Bearer token to every route below. Create a medicine and a health center first, then create a batch for the medicine, and create a stock record for a health center and batch.

- `GET /medicine-batches` lists batches. Optional filter: `?medicine_id=1`.
- `POST /medicine-batches` accepts `{ "medicine_id": 1, "lot_number": "LOT-001", "expiration_date": "2027-12-31", "status": "Active" }`. `status` is optional and defaults to `Active`.
- `GET /medicine-batches/:id`, `PUT /medicine-batches/:id`, and `DELETE /medicine-batches/:id` read, update, and delete a batch. A batch referenced by stock, transfer, or disposal records cannot be deleted.
- `GET /inventory-stocks` lists stock. Optional filters: `?center_id=1` and/or `&batch_id=1`.
- `POST /inventory-stocks` accepts `{ "center_id": 1, "batch_id": 1, "quantity": 25 }`; quantity defaults to zero and cannot be negative.
- `PUT /inventory-stocks/:id` accepts `{ "quantity": 20 }`. A nonzero stock record must be set to zero before it can be deleted with `DELETE /inventory-stocks/:id`.

## Transfer and disposal API

These routes also require a Bearer access token.

- `GET /transfer-requests` and `GET /transfer-requests/:id` list or read requests.
- `POST /transfer-requests` accepts `{ "source_center_id": 1, "destination_center_id": 2, "request_date": "2026-10-14" }`; status defaults to `Pending`.
- `PUT /transfer-requests/:id` updates the request fields. Supported statuses are `Pending`, `Approved`, `Rejected`, `Completed`, and `Cancelled`. Only pending requests can be edited; only pending or cancelled requests can be deleted with `DELETE /transfer-requests/:id`. Deleting a request cascades to its transfer items.
- `GET /transfer-items` and `GET /transfer-items?transfer_id=1` list items.
- `POST /transfer-items` accepts `{ "transfer_id": 1, "batch_id": 1, "transfer_quantity": 5 }`. Transfer quantities must be positive, and items can only be changed while their request is pending.
- `PUT /transfer-items/:id` updates `batch_id` and/or `transfer_quantity`; `DELETE /transfer-items/:id` deletes an item from a pending request.
- `GET /disposal-certificates` and `GET /disposal-certificates/:id` read certificates.
- `POST /disposal-certificates` accepts `{ "batch_id": 1, "disposal_date": "2026-10-14", "disposal_method": "Approved disposal" }`. `user_id` is derived from the access token, and a batch can have only one certificate. Certificates are read-only after creation.

Transfer requests and items currently record and track requests; changing request status does not move or reserve stock. Disposal certificates record who documented a batch disposal; creating one does not change batch status or inventory quantities.
