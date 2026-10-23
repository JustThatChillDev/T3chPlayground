# profiles

An e-profile home for names, bios, links, projects, and current music obsessions.

## Connect Supabase

The Supabase project is already created — do **not** create another one.

1. In the project dashboard, open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
2. In **Authentication → Providers → Email**, enable email/password sign-in. For a smoother local test, either disable email confirmation temporarily or confirm the email sent after sign-up.
3. Copy `.env.example` to `.env`, then set `VITE_SUPABASE_ANON_KEY` to the project's anon (public) key. The project URL is already included.
4. Run `npm install`, then start the site:

   ```powershell
   npm.cmd run dev
   ```

   Use `npm.cmd` in PowerShell if your machine blocks `npm.ps1` under its execution policy. Do not add a trailing slash to the command.

## Your pre-created profile

Your requested email is `bobthedev.cme14@gmail.com`. Because browser code must never contain an admin/service key or a password, create this account once through the site's **Create your profile** form (or Supabase Authentication → Users) using your own password. It then becomes your pre-created account and is ready to fill in securely.

Never commit `.env` or an actual password.

## Upgrade: custom profiles, cards, and avatar uploads

If you already ran the original schema, run [`supabase/migration_add_custom_profiles.sql`](./supabase/migration_add_custom_profiles.sql) once in the Supabase SQL Editor. It adds the new profile fields, page-builder cards, and the public `avatars` storage bucket with per-user upload permissions.

## Deploy to Netlify

The project is deployment-ready. It uses the deployed site's address automatically for profile links and Supabase email redirects, rather than a hard-coded localhost URL.

1. Push this folder to your GitHub repository, then import that repository in Netlify.
2. Netlify will use [`netlify.toml`](./netlify.toml): build command `npm run build`, publish folder `dist`.
3. In Netlify **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL` = `https://yvyqbejsixpkwalmqzwq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anonymous/public key
4. Deploy. Copy the resulting Netlify site URL, such as `https://your-site.netlify.app`.
5. In Supabase, go to **Authentication → URL Configuration**, set the Site URL to that Netlify URL and add both the Netlify URL and `https://your-site.netlify.app/**` to Redirect URLs. Add your custom domain there too if you later use one.

The included `public/_redirects` rule sends shared profile URLs such as `/?u=your-name` to the React app correctly.
