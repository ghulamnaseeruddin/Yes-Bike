# YES BIKE

YES BIKE is a single Next.js App Router application with a Supabase backend. The app, UI routes, Supabase integration, SQL schema, product seed, and setup documentation all live in this folder. There is no separate Express API or Vite client in the deployed project.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` for live auth and database access. Without credentials, the storefront uses 100 demo products with Unsplash photos; authentication and order persistence are unavailable.

The shop includes an optional authenticated gear advisor. Add the server-only `OPENAI_API_KEY` to enable conversational suggestions; normal search remains available without it.

## Supabase

In the Supabase SQL Editor, run `supabase/schema.sql`, then `supabase/demo-products.sql`. Configure the Supabase Auth site URL and redirect URLs for localhost and the deployed domain. Do not expose a service-role key in `NEXT_PUBLIC_*` variables.

## Vercel

Import the Git repository and set **Root Directory** to `next-app`. Select the detected **Next.js** framework, not Services. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project environment variables. Optionally add server-only `OPENAI_API_KEY` and `OPENAI_MODEL` for the gear advisor, then deploy.

For first-admin setup and production checks, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md). Checkout is cash-on-delivery only; there is no online payment provider.