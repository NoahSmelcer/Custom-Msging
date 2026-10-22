# Our Family

A small, private, installable family messenger for two people. It uses Supabase Auth, PostgreSQL with Row Level Security, and Supabase Realtime. There is no public registration screen or client-side admin backdoor.

## What is included

- Email/password sign-in with persistent Supabase sessions and sign-out.
- Responsive, touch-friendly chat UI with optimistic sends, retry, quick messages, pagination, local timestamps, empty/loading/error/offline states, and live message delivery.
- Secure schema and RLS policies in `supabase/migrations/20261020000000_family_messaging.sql`.
- Web manifest, icons, theme color, and a deliberately network-only service worker. It never caches private messages or Supabase responses.

## Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is sufficient for an initial family app)
- A Vercel account for production hosting

## Local setup

```powershell
npm install
Copy-Item .env.example .env
# Edit .env and set the URL and anon/publishable key from Supabase Project Settings > API
npm run dev
```

Open the URL printed by Vite. Never use the Supabase `service_role` key in `.env` prefixed with `VITE_`; anything with that prefix is bundled for the browser.

## Configure Supabase

1. Create a new Supabase project.
2. In **SQL Editor**, paste and run the migration at `supabase/migrations/20261020000000_family_messaging.sql`. If using the Supabase CLI, link the project and run `supabase db push` instead.
3. In **Authentication > Providers > Email**, keep email enabled. For the simplest controlled rollout, disable **Confirm email** only if you will personally set strong temporary passwords and change them before handoff; otherwise leave confirmation enabled and let each invited person confirm their address.
4. In **Authentication > URL Configuration**, add `http://localhost:5173` and your future Vercel URL as redirect URLs.
5. In **Authentication > Users**, use **Invite user** (or create each user manually) for Mom and Brother. Do not enable an open sign-up flow in the app.
6. Get each Auth user UUID from the Users page, then run this in SQL Editor, replacing both placeholders:

```sql
insert into public.family_memberships (id, display_name, role) values
  ('MOM_AUTH_USER_UUID', 'Mom', 'admin'),
  ('BROTHER_AUTH_USER_UUID', 'Brother', 'member');
```

Only people with a row in `family_memberships` can select or insert messages. Membership writes have no browser-accessible RLS policy; make changes only through Supabase’s SQL editor or a trusted server using its service-role key. Keep that key secret.

## Verify locally

```powershell
npm run build
npm run test
```

Practical acceptance checks:

1. Sign in with both authorized accounts on two browsers/devices; confirm a new message arrives without refresh.
2. Refresh each device and confirm the chat persists.
3. Try signing in with an Auth user that has no membership row; it must be denied access.
4. Verify an empty message cannot send, a message over 1,000 characters fails both in UI and database, and a simulated offline send stays disabled.
5. In browser DevTools, throttle/offline and reconnect; the banner should change appropriately.

## Deploy to Vercel

1. Push this repository to your private Git provider repository.
2. In Vercel, import it. The build command is `npm run build` and output directory is `dist` (Vercel detects Vite automatically).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel’s Environment Variables for Production (and Preview if wanted). These are the public browser connection values, not privileged keys.
4. Deploy, then add the exact `https://your-app.vercel.app` URL under Supabase Auth redirect URLs.
5. Visit the deployed URL and test both accounts before handing it over.

Vercel provides HTTPS, which is required for service workers and PWA installation in production.

## Install on devices

- **iPhone Safari:** open the deployed URL, tap Share, then **Add to Home Screen**. Launch it from the new icon.
- **Samsung Android tablet / Chrome:** open the URL, use the browser menu, then **Install app** or **Add to Home screen**.

The website remains usable in an ordinary browser if installation is not offered. In-app unread badges are designed into the header, while background push notifications are intentionally not claimed or implemented; they require a separate Web Push service, user permission, and device testing.

## Notes and limits

- The read-marker table is ready for persisted unread counts, but this first UI marks new incoming messages as read while the conversation is open and does not yet calculate a cross-device unread count. This avoids misleading notifications until the product has a clear foreground/background policy.
- The app needs internet access to load or send messages. The service worker does not cache private content; it therefore exposes an offline notice rather than an old potentially sensitive chat.
- The initial conversation is family-wide. If more than one family group is ever needed, add a `family_id` model and revisit every RLS policy before enabling it.
