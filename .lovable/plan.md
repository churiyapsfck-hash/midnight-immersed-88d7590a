## Aug 3 — Gate Check-in System

Every verified booking gets a unique QR embedded in their pass PDF. On the door, you and 2–5 staff open `/gate` on your phones, scan a guest's QR (or search by User ID / phone / name), the app instantly shows ✅ or ❌ with their name + pass type, and locks the pass so it can't be reused.

---

## Guest experience

- On `/purchases`, verified passes gain a **"Download pass"** button (PDF: name, User ID, pass type, category, big QR).
- QR encodes a random `ticket_token` (unguessable, one per booking). Screenshots of someone else's QR still fail on the second scan — one-shot rule.
- The pass PDF is also cached on the phone; no need to be online at the door.

## Staff experience — `/gate`

```text
┌────────────────────────────┐
│  ILLUMINATI · GATE         │
│  Signed in as: aditya      │
│                            │
│  [ camera viewfinder ]     │  ← default: QR scanner
│                            │
│  ✅ VERIFIED               │
│  Aakash Rao                │
│  ILL-A3F9K2 · VIP · Boys   │
│  Checked in 22:14 · by you │
│                            │
│  [ Search by code/phone ]  │  ← fallback tab
└────────────────────────────┘
```

**Two tabs:**
1. **Scan** (default) — live camera, auto-decodes QR, hits server, big color result (green/red/amber).
2. **Search** — text field, matches `user_code`, phone, or name across verified bookings. Tap a result → "Check in" button.

**Result states:**
- ✅ **VERIFIED & CHECKED IN** — first scan, guest may enter.
- 🟠 **ALREADY CHECKED IN at 22:14 by rahul** — someone (or the same person) already used this pass. Deny entry.
- ❌ **INVALID / NOT VERIFIED** — pass is `pending` or `declined`, or QR is fake.

## Roles & access

- New `user_roles` table with an `app_role` enum (`admin`, `gate`).
- You (admin) can log in on your normal account; staff sign in with their own accounts and you flip a switch (admin-only page `/admin/staff`) to grant them the `gate` role.
- `/gate` is behind `_authenticated/` and additionally checks `has_role('gate')` or `has_role('admin')`. Anyone else → redirected home.
- Every check-in row records `checked_in_by = auth.uid()` so you know which staffer scanned which guest.

## Failure modes we handle

- **Guest forgot phone / dead battery** → staff searches by name or phone, taps Check in.
- **Two staff scan the same guest at once** → DB does atomic update `WHERE checked_in_at IS NULL`; only the first wins, the second sees "already checked in".
- **No signal at the venue** → PWA-cache `/gate` shell; scans queue and sync when back online (nice-to-have; ship v1 as online-only, add offline queue if time permits).
- **Someone shares their QR** → second scan fails, first entry timestamp visible.

---

## Technical section

### Schema changes (new migration)

```sql
-- bookings: add token + check-in tracking
alter table public.bookings
  add column ticket_token text unique,
  add column checked_in_at timestamptz,
  add column checked_in_by uuid references auth.users(id);

create index on public.bookings (ticket_token);

-- roles
create type public.app_role as enum ('admin', 'gate');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
```

`ticket_token` is minted server-side (32-char base32) the moment a booking flips to `verified`. Verification is done by you in admin (next milestone) or manually in the Supabase dashboard for now.

### Server functions (`src/lib/gate.functions.ts`)

All use `.middleware([requireSupabaseAuth])` and re-check `has_role('gate' | 'admin')` inside the handler (never trust the client):

- `checkInByToken({ token })` — atomic update `set checked_in_at = now(), checked_in_by = auth.uid() where ticket_token = ? and status = 'verified' and checked_in_at is null returning *`. Returns one of: `verified` | `already_checked_in` (with timestamp + staff name) | `invalid`.
- `checkInByBookingId({ bookingId })` — same, used by search flow.
- `searchBookings({ q })` — matches `user_code`, `phone`, or `full_name ILIKE %q%`, verified only, returns first 10.

### Routes

- `src/routes/_authenticated/gate.tsx` — layout that checks gate/admin role, else redirect `/`.
- `src/routes/_authenticated/gate.index.tsx` — scanner + search UI (single page, two tabs).
- `src/routes/_authenticated/admin.staff.tsx` — you-only page to grant/revoke the `gate` role by email or User ID.

### PDF pass (`src/lib/pass.functions.ts`)

- Uses `pdf-lib` (Worker-compatible) + `qrcode` to render an A6 pass with the QR encoding `ticket_token`.
- Server fn `getPassPdf({ bookingId })` returns bytes; frontend triggers download from `/purchases`.

### QR scanning

- Library: `@zxing/browser` (works in mobile Safari, no native deps, no build issues on Workers since it's client-only).
- Camera permission prompt on first open; falls back to search tab if denied.

### Nav wiring

- Nav shows extra **GATE** link when the signed-in user has `gate` or `admin` role.
- `/gate` deep-linked with `?next=scan` after login so staff land straight on the scanner.

---

## Rollout order

1. Migration: `ticket_token`, `checked_in_at`, `user_roles`, `has_role`.
2. Server fns + role gate + admin staff page.
3. `/gate` scanner + search UI.
4. Pass PDF generation + download button on `/purchases`.
5. (Optional) offline queue for scans if venue signal is bad.

Steps 1–4 are the must-ship-before-Aug-3 scope; step 5 is a stretch.
