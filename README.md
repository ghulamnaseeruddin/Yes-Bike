# YES BIKE

The single Vercel application is the Next.js project in `next-app`. Its App Router contains the storefront, customer pages, admin workspace, and server-side Supabase integration. The old Vite/Express/MongoDB directories (`client`, `server`, and `api`) are legacy source and are not deployed. They remain in Git to preserve existing code and changes.

## Run locally

```powershell
cd next-app
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Add a Supabase project URL and anon key to `.env.local` for live auth and database access. Without credentials the storefront uses 100 demo products and Unsplash photos; authentication and real order placement require Supabase.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel and set **Root Directory** to `next-app`.
3. Use the detected Next.js framework and default build command `npm run build`.
4. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
5. Deploy.

Run `next-app/supabase/schema.sql` and then `next-app/supabase/demo-products.sql` in the Supabase SQL Editor to enable database-backed features and load the demo catalog. Follow `DEPLOYMENT_GUIDE.md` for first-admin setup and launch checks. Never expose a service-role key as a `NEXT_PUBLIC_*` variable.

No online payment system is used; checkout is cash-on-delivery only.
