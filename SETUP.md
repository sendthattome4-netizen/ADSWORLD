# AdWorld Admin Dashboard Update

This update adds an administrator dashboard to the existing AdWorld Supabase-connected site.

## Files to replace in the existing GitHub repository
- `index.html`
- `app.js`
- `styles.css`

Keep the existing `config.js` unchanged so your Supabase project connection remains intact. Keep `schema.sql` unchanged; the admin helper function and admin read/update policies were already created in the Supabase SQL Editor during setup.

## Admin dashboard features
- Admin-only dashboard visibility based on `profiles.role = 'admin'`.
- Counts for users, campaigns, publisher websites and pending reviews.
- View publisher applications and change their status to pending, approved, rejected or suspended.
- View campaigns and change their status to draft, pending, active, paused, completed or rejected.
- View registered users and their roles.

## Important
This dashboard does not yet deliver advertisements, track impressions/clicks, process payments, or calculate publisher earnings. Do not promise those functions as active.

The browser uses only the Supabase publishable key already present in `config.js`. Never put a Supabase secret/service-role key or database password in browser files.
