## Scope

Build a full auth + bookings flow on **your own Supabase project**, themed black/blood-red to match the site. Google sign-in only. On signup we collect name + phone, generate an `ILL-XXXXXX` User ID, and also generate a one-time password shown to the user so they have User ID + password creds in addition to Google.

## Flow

1. Click **Reserve Standard** (or Reserve VIP) on Tickets → route `/standard` or `/vip` opens with the same reload/opening animation as the hero.
2. That page shows **Sign in / Sign up** (Google button + "I already have an account" User ID + password form).
3. On first-time sign-up: collect **Name, Phone**, then show a locked screen with their generated **User ID (ILL-XXXXXX)** and **one-time password** (copy buttons, "Save these — you won't see the password again"). Also stored: linked to their Google auth user.
4. Signed in → booking form: **Name, Phone (prefilled), Pass type, Category (Girls/Boys/Couples), QR image (static, you'll upload later — placeholder for now), UTR/Transaction number input, Payment screenshot upload** → Reserve.
5. **Thank-you page** → auto-redirect to `/` after ~3s.
6. On `/`, the navbar's "Request Invite" is replaced with **Passes** for logged-in users → routes to `/purchases`.
7. `/purchases` lists their bookings with status (Pending / Verified / Declined). Verified rows expose a **Download pass** button (PDF with their name, User ID, pass type, QR).

## Data model (your Supabase, `public` schema)

```text
profiles          id (uuid, = auth.users.id, PK)
                  user_code text unique  -- ILL-XXXXXX
                  full_name text
                  phone text
                  created_at timestamptz

bookings          id uuid PK
                  user_id uuid → auth.users
                  pass_type text          -- 'standard' | 'vip'
                  category text           -- 'girls' | 'boys' | 'couples'
                  utr text
                  screenshot_path text    -- storage path
                  status text default 'pending'  -- pending|verified|declined
                  created_at timestamptz
```

- RLS **on**, policies scoped to `auth.uid()`. `service_role` full access.
- Storage bucket `payment-screenshots` (private), signed-URL reads only.
- Trigger on `auth.users` insert → creates profile row + generates unique `ILL-XXXXXX`.
- **User ID/password creds:** on signup a random password is generated server-side, `supabase.auth.admin.updateUserById` sets it, then it's shown once. Login with User ID uses a server function that looks up the email by `user_code` and calls `signInWithPassword`.

## Security

- **Nothing DB-related on the frontend** beyond the Supabase publishable/anon key (safe by design + RLS). URL + anon key go in `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Service role key** stays as a server-only secret (`SUPABASE_SERVICE_ROLE_KEY`), used only inside `createServerFn` handlers for: generating user code, setting the one-time password, verifying bookings.
- `.env` is git-ignored; secrets stored via Lovable's secret store, never committed.
- All writes go through RLS or authenticated server functions. UTR + screenshot are private per user.

## Frontend changes

- New routes: `/standard`, `/vip`, `/booking/thankyou`, `/purchases`, `/auth/callback`.
- Reuse `OpeningSequence` reload animation on `/standard` and `/vip` mount.
- `Nav.tsx`: swap **Request Invite → Passes** when signed in.
- All new pages themed: black background, blood-red (`oklch(0.55 0.24 25)`) accents, Anton + serif italic + mono, matching the current site.

## What I need from you before I build

1. Your **Supabase project URL** (looks like `https://xxxxx.supabase.co`) — paste in chat.
2. Your **anon / publishable key** — paste in chat (this one is safe to share; it's public by design).
3. Your **service role key** — I'll open a secure secret form for this one; **do not paste it in chat**.
4. Confirm: Google OAuth should be configured in your Supabase dashboard (Authentication → Providers → Google). I'll walk you through it if needed.

Once you drop the URL + anon key and fill the service-role secret form, I'll build everything in one pass.

## Technical notes (for me)

- TanStack Start server fns for: `signupComplete` (name/phone/generate code+password), `loginByUserCode`, `createBooking`, `listMyBookings`, `getPassPdf`.
- Screenshot upload: direct to Supabase Storage from client with authed session; path `{user_id}/{booking_id}.jpg`.
- `_authenticated` gate for `/purchases`; `/standard`, `/vip` are public but gate the booking form behind sign-in inline.
- PDF: `pdf-lib` (works on Cloudflare Workers), server function returns bytes.