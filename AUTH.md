# MedSync API and setup

The active API is a NestJS REST service over Supabase Auth and PostgreSQL. Normal queries use a Supabase client carrying the caller's access token, so existing row-level security applies. The API does not use a service-role key or issue its own access tokens.

## One-time database setup

Apply migrations in order: `20261122000100_identity_organization.sql`, `20261124000100_inventory_redistribution.sql`, `20261126000100_admin_update_profile_name.sql`, and `20261127000100_stock_request_direction.sql`. The last migration fixes redistribution to work as a request from the receiving center, and also enables center managers to find active unassigned profiles for staff assignment. These migrations are additive and do not delete or reset existing data. The repository cannot apply them to the hosted project automatically because no database-owner credential is configured in the backend.

Promote the first system administrator through the Supabase SQL Editor as the trusted database owner. Replace the email with the existing Auth user's email:

```sql
INSERT INTO public.system_administrators(user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('admin@example.com')
ON CONFLICT (user_id) DO NOTHING;
```

Users can register from the frontend's `/signup` route. The Auth trigger creates their profile and records the supplied display name. New users receive no role until an administrator assigns a center membership. A center manager can assign or suspend inventory staff at their own center; center managers cannot grant manager or administrator roles. User account suspension remains managed in Supabase Auth.

## Configuration

Copy `.env.example` to `.env`. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the same Supabase project URL and publishable/anon key used by the frontend's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The local ignored backend `.env` has been populated from those frontend settings. Never put a Supabase service-role key in frontend code or logs.

`CORS_ORIGINS` is a comma-separated allowlist and defaults to `http://localhost:3000,http://127.0.0.1:3000`. `PORT` defaults to `3001`; `HOST` defaults to `0.0.0.0`. The frontend API helper defaults to `http://localhost:3001`; set `NEXT_PUBLIC_API_URL` for a deployed API.

## Authentication and authorization

Send the Supabase access token as `Authorization: Bearer <access-token>`. The global access-token guard validates the token with Supabase Auth, then resolves the active profile, administrator assignment, and active center memberships using that same user's token. The global role guard supports `system_administrator`, `center_manager`, and `inventory_staff`. Database RPCs check the specific center role again before any privileged write.

## Active endpoints

- `GET /health`: public process health.
- `GET /auth/me`: verified user, roles, and active center memberships.
- `GET /health-centers`; `POST /health-centers` (administrator); `PATCH /health-centers/:id/status` (administrator).
- `GET /profiles` and `GET /center-memberships`; `POST /center-memberships` to assign or suspend a role through the existing permission-checked RPC.
- `GET /medicines`; `POST /medicines` (administrator).
- `GET /medicine-batches?centerId=<uuid>&medicineId=<uuid>`; `POST /medicine-batches`.
- `GET /inventory-stocks?centerId=<uuid>` and `GET /stock-transactions?centerId=<uuid>`; `POST /stock-transactions` for stock-in, stock-out, and adjustments.
- `GET /redistribution-requests?centerId=<uuid>`; `GET /redistribution-requests/stock-availability?centerId=<uuid>`; `POST /redistribution-requests`; `PATCH /redistribution-requests/:id/status` with `approve`, `reject`, `cancel`, or `fulfill`.

Stock balances and audit entries are written together in PostgreSQL functions. Fulfillment locks and checks source stock, moves each requested batch, records both sides of the transfer, and updates request status in one transaction. Expired batches cannot be received, issued, requested, or transferred. Requests do not reserve stock while pending or approved; fulfillment returns an error if available stock has changed.

The legacy MySQL inventory migration and unused transfer-item/disposal code remain in the repository but are not registered as active API modules. They are not part of the Supabase-backed workflow.

## Run locally

```powershell
cd backend
npm install
npm run start:dev
```

```powershell
cd frontend
npm run dev
```
