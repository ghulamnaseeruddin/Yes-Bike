# YES BIKE single-app deployment

The Vercel deployment target is the Next.js app at `next-app`. Vercel should build one Next.js project from that directory. The legacy `client`, `server`, and `api` source folders remain in the repository but are not part of this deployment.

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `next-app/supabase/schema.sql`.
3. Run `next-app/supabase/demo-products.sql` to insert 100 mock catalog items and image URLs. They are demo listings, not real inventory.
4. In Supabase Authentication settings, add localhost and your final Vercel domain as site/redirect URLs.
5. Copy the project URL and anon/publishable key for the app configuration. Do not use a service-role key in browser-exposed variables.

To make the first admin, register that account through `/auth`, then run this in the SQL Editor with the registered email:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

Sign in again and open `/admin`.

## Local setup

```powershell
cd next-app
npm install
Copy-Item .env.example .env.local
```

Edit `next-app/.env.local` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run locally with `npm run dev` and open `http://localhost:3000`.

## Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Set **Root Directory** to `next-app`. Do not select Services and do not set the root to `client` or `server`.
3. Keep the detected Next.js preset and build command (`npm run build`).
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables for Production and Preview as needed.
5. Deploy and verify home, shop, product detail, auth, cart, checkout, profile, orders, and admin.

The Vercel project contains one deployed Next.js app; the legacy Vite and Express apps are intentionally excluded. Demo browsing works without Supabase configuration, but auth, admin data, and persisted COD orders do not. Test RLS, order inventory checks, and public-checkout abuse protection against the live Supabase project before accepting real orders. No online payment provider is configured.
