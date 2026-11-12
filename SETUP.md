# X Dimension: setup

## Run the site
```
npm install
npm run dev
```
Open http://localhost:5173

## Admin panel (http://localhost:5173/admin)

1. Install the admin's interface components (once):
   ```
   npx shadcn@latest add button input textarea label tabs switch card badge separator
   ```
2. Create a free project at supabase.com.
3. In Supabase, open SQL Editor, paste everything from `supabase/schema.sql`, and run it.
4. In the same editor run this with your own login email:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. In Supabase > Authentication > Users, add a user with that same email and a password.
6. In this folder create a file named `.env.local`:
   ```
   VITE_SUPABASE_URL=your Project URL
   VITE_SUPABASE_ANON_KEY=your anon public key
   ```
7. Stop and restart `npm run dev`, open `/admin`, sign in, then go to Setup > "Load starting content".

Until step 6 is done the site runs on its built-in text, so nothing breaks.

## Where things are
- `src/pages/` the six pages and the 404 page
- `src/content/` all default text (English + Banglish), lists and settings
- `src/components/` logo, liquid cursor, page-flip book, menu
- `src/admin/` the admin panel
- `DESIGN.md` the design rules every page follows
