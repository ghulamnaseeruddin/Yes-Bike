# YES BIKE: Supabase and Vercel setup

The deployed app is the single Next.js project in this folder. Supabase hosts the database and authentication; Vercel hosts the Next.js app and stores its environment variables. There is no MongoDB connection and no online payment provider.

## 1. Create the Supabase project and database

1. Create a project at [supabase.com](https://supabase.com). Save the database password in your password manager; it is not needed by this app.
2. Open the project's **SQL Editor** and choose a new query.
3. Copy the complete contents of `supabase/schema.sql`, paste it into the editor, and run it. This creates the tables, signup profile trigger, row-level security policies, admin checks, and the cash-on-delivery order function.
4. Open a second SQL query, copy all of `supabase/demo-products.sql`, and run it. This inserts 100 illustrative demo listings with Unsplash image URLs. These are mock catalog records, not real inventory.
5. In Supabase **Project Settings → API** (or **API Keys**), copy the **Project URL** and the public **anon/publishable key**. The app uses the public key with RLS; it does not require a database password or service-role key.

## 2. Configure authentication URLs

### Allow immediate email/password signup

In Supabase, open **Authentication → Sign In / Providers → Email** and turn **Confirm email** off (the label may appear as **Email confirmations**). Save the change. With confirmation disabled, Supabase returns a session immediately after a successful password signup, and the app sends the user straight to `/profile` without asking them to check email. Google OAuth is a separate provider and still requires its normal Google sign-in redirect.

In Supabase **Authentication → URL Configuration**:

- Set **Site URL** to `http://localhost:3000` while developing. After Vercel is deployed, change it to your production URL, such as `https://your-project.vercel.app`.
- Add these **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://your-project.vercel.app/auth/callback`
  - If using a custom domain, add `https://your-domain.example/auth/callback` too.

Use your actual Vercel/custom domain, not the example domains above.

### Enable Google sign-in

1. In Google Cloud Console, create an OAuth client for a Web application and add the Supabase callback URI shown in Supabase's Google provider panel. It normally looks like `https://<project-ref>.supabase.co/auth/v1/callback`.
2. In Supabase, open **Authentication → Sign In / Providers → Google**, enable Google, and enter the Google OAuth client ID and client secret.
3. Save the provider settings. Keep the Google client secret in Supabase only; do not put it in `NEXT_PUBLIC_*` variables.
4. Make sure the local and deployed `/auth/callback` URLs are in Supabase's redirect allowlist as above.

## 3. Configure local development (optional)

From this `next-app` directory in the VS Code terminal:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace the placeholders with your real Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Optional gear-advisor variables:

```env
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-20b
```

Get the Groq key from [console.groq.com/keys](https://console.groq.com/keys). The advisor is optional and subject to Groq's account quotas/rate limits. Never put that key behind a `NEXT_PUBLIC_` name. Keep `.env.local` private and uncommitted.

Run `npm install`, then `npm run dev`; open `http://localhost:3000`. Without Supabase credentials the catalog uses demo data, but sign-in, admin, wishlist, contact storage, and persistent COD orders will not work.

## 4. Create the first administrator

1. Start the app with Supabase configured.
2. Register the account that should be the administrator at `/signup` (not `/auth`). With **Confirm email** disabled, signup should open `/profile` immediately.
3. In the Supabase SQL Editor, replace the example email and run:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('your-admin-email@example.com');
```

5. Confirm exactly one row was updated. Sign out and back in, then open `/admin`.
6. Promote additional accounts from the admin workspace. Do not make an account an admin by changing user metadata; authorization is based on `public.profiles.role` and database RLS.

## 5. Add credentials in Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Set **Root Directory** to `next-app` and select the **Next.js** preset. Do not choose Services.
3. Open **Project Settings → Environment Variables**. Add each variable separately, with no quotes or surrounding spaces:

| Name | Value | Required? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Yes for live auth/data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes for live auth/data |
| `GROQ_API_KEY` | Groq API key | Optional advisor |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Optional; advisor default |

Select Production and Preview environments as needed. Do **not** add `SUPABASE_SERVICE_ROLE_KEY`, Google client secret, or a database password to the app's public variables. The browser-visible Supabase anon/publishable key is expected; RLS is what protects the data.

4. Save the variables and deploy. If you add/change variables after a deployment, trigger a new deployment for them to take effect.

## 6. Verify before launch

- Open the production URL and verify home, categories, shop, product detail, and photos.
- Create an account at `/signup` and verify it opens `/profile` without an email-confirmation step; test sign-in at `/login` and Google OAuth if enabled.
- Promote the first admin and verify `/admin` works only for admin accounts.
- Test a contact message, wishlist, review, and a cash-on-delivery order; confirm the rows appear in Supabase.
- Verify an out-of-stock item cannot be ordered and that the order total is recalculated by the database.
- Confirm Vercel deployment logs and Supabase logs are clean before accepting real orders.

If Supabase is not configured, Vercel can still serve the demo storefront, but live auth, admin data, and saved orders will not work. Add checkout rate limiting/abuse protection before opening anonymous orders to the public.
