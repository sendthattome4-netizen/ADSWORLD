# AdWorld V2 — Supabase-connected starter

This package has your Supabase Project URL and browser-safe Publishable key already inserted in `config.js`.

## 1. Create the database tables
1. Open https://supabase.com/dashboard/project/ncmpwmnkcxbjvuvupqen
2. Choose **SQL Editor**.
3. Choose **New query**.
4. Open `schema.sql` from this project, copy all its contents, paste into the SQL editor and press **Run**.

## 2. Enable email authentication
In Supabase, open **Authentication → Providers → Email**. Make sure Email is enabled. For initial testing you may turn off email confirmation; turn it back on before public launch.

## 3. Preview the website
Open `index.html` in a browser or deploy the folder to a static host such as Netlify. Keep all files together in the same folder.

## 4. Test
Create an account, sign in, create a campaign draft with a duration of one day, then check that it appears under **My campaigns**.

## Security and current limits
- `config.js` contains a Supabase publishable key, which is intended to be exposed in browser code. Never add a Supabase secret/service-role key, database password, payment secret, or private API key to this project.
- Database access is protected with Row Level Security policies in `schema.sql`.
- This is a connected starter, not a complete ad network. It currently supports account authentication and saving/viewing campaign drafts.
- It does not yet deliver ads, onboard publishers, track impressions/clicks, process payments, or connect Meta, TikTok, or Google ad accounts.
- Campaign booking duration is separate from any future AdWorld membership subscription. A campaign can be drafted for 1–365 days.
- Do not collect card numbers, CVV, mobile-money PINs or OTPs in AdWorld. Use a compliant hosted payment provider when payments are implemented.
