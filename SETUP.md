# AdWorld V3 — Publisher applications

## What this version adds
- Publisher website application form.
- Publisher dashboard showing the signed-in user's submitted websites and review status.
- Applications remain pending until reviewed.
- Existing advertiser campaign and account features remain.

## Update Supabase
1. Open your Supabase project and choose SQL Editor.
2. Create a new query.
3. Open the updated `schema.sql` file, copy all its contents, paste into SQL Editor, and run it.
4. This script can be rerun safely and adds the `publisher_sites` table and security policies.

## Publish
Upload the updated `index.html`, `styles.css`, `app.js`, `schema.sql`, and `SETUP.md` to the root of the existing GitHub ADSWORLD repository. Keep `config.js` unchanged. Commit the changes; Netlify should automatically redeploy after the GitHub commit.

## Current limitations
This version accepts publisher applications and displays their status. It does not yet verify website ownership, serve ads, count impressions/clicks, calculate earnings, or process payouts.
