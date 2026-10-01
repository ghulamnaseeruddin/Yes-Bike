# YES BIKE deployment

## 1. Configure Supabase

1. Create a Supabase project.
2. In the SQL Editor, run `supabase/schema.sql`.
3. Run `supabase/demo-products.sql` to add 100 illustrative demo products and their image URLs.
4. Set Authentication's site URL and allowed redirects to include localhost and the Vercel domain.
5. Copy the project URL and anon/publishable key. Never put a service-role key in client variables.

To promote the first administrator, register that account at `/auth` and then run this in the SQL Editor with its email:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

Sign out and back in, then open `/admin`.

## 2. Run locally

```powershell
npm install
Copy-Item .env.example .env.local
```

Set these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optionally add server-only `GROQ_API_KEY` and `GROQ_MODEL=openai/gpt-oss-20b` to enable the authenticated gear advisor. Groq free-tier use is subject to account quotas and rate limits. Never prefix the provider key with `NEXT_PUBLIC_`.

Then run `npm run dev` and open `http://localhost:3000`.

## 3. Deploy one Next.js project

1. Push the repository to GitHub and import it into Vercel.
2. Set Vercel **Root Directory** to `next-app`.
3. Use the detected Next.js preset and default `npm run build` command. Do not choose the Services preset.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel for Production and Preview. Optionally add server-only `GROQ_API_KEY` and `GROQ_MODEL` for AI suggestions.
5. Deploy and smoke-test storefront, auth, cart, COD checkout, profile, order history, contact, wishlist, and admin flows.

Demo browsing works without Supabase. Auth, contact storage, wishlist, reviews, admin, and persisted orders require the SQL schema and valid environment variables. Verify RLS, stock validation, and abuse controls before accepting real orders. No online payments are configured.