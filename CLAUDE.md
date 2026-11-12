# X Dimension website: project memory

Read this first, then `TODO.md` (what's left) and `DESIGN.md` (look, voice and code rules for pages).

## What this is
Company site for **X Dimension** (xdimension.pro.bd), Shihan's one-person company: AI chatbots,
automations, custom web apps, AI training, and a "portfolio site + SEO" bundle. Courses later.
The name: people talk about 3D and 4D; he works in every dimension, so X. Contact is WhatsApp only:
+880 1410 336636 (editable in admin).

## Stack
Vite + React 19 + TypeScript (strict) + Tailwind v4 + react-router-dom v7 + `motion` v12
(`motion/react`) + lucide-react (0.460) + sonner + shadcn/ui (new-york, in `src/components/ui/`,
admin only) + Supabase (database, login, image storage). Path alias `@/` = `src/`.

## Commands (run in this folder)
- `npm run dev` → http://localhost:5173 (admin at /admin)
- `npm run build` → type-check + build into `dist/`. Run it before every push.
- Git remote: https://github.com/ssfshad/x-dimension (public, branch `main`).

## How it fits together
- `src/App.tsx`: providers, the book shell for the public site, `/admin` loaded lazily.
- `src/components/Book.tsx`: one page at a time, turned like a book page (CSS 3D in `index.css`).
  Has a safety timer so a paused animation can never lock the site.
- `src/components/FluidCursor.tsx`: WebGL liquid cursor (powder blue by default, follows `brand.accent`).
- `src/lib/i18n.tsx`: the content store. Built-in defaults (`src/content/`) merged with Supabase
  overrides (tables `strings`, `items`, `settings`); cached in localStorage. `t()`, `l()`, `items()`, `setting()`.
- `src/content/strings/*.ts`: all visitor text, one file per page, every key has `en` + `bn`.
- `src/content/defaults.ts`: default lists (services, projects, courses) and settings.
- `src/lib/useSitePages.ts`: page order/visibility from setting `pages.layout` (an array of
  `{key, visible}`; extra fields are preserved on purpose so a future page builder can add `sections`).
- `src/components/rareui/`: adapted RareUI components (MIT): LiquidButton, MagneticScatterText,
  GlassShimmerButton, Book3D. Each file says what was changed.
- `src/components/HeroArt.tsx`: original hairline isometric cube drawing (draws itself in).
- `src/admin/`: Text, Lists, Images & Look, Settings, Setup tabs.
- `supabase/schema.sql`: tables + row-level security (public read, only emails in `admins` can write)
  + public `media` bucket.

## Decisions already made (don't undo without asking)
- Look: "black paper" pages, powder blue (#b0e0e6) accent, Space Grotesk headings, Inter body.
- Logo: option 5, "xD" inside a cube outline (on light backgrounds the D is #1f6f7d).
  Design canvas: https://claude.ai/artifact/MiiuCjRyDCyiZaMMxtqMmF
- Cursor: liquid blob, current size and speed are approved; hover growth 1.14x.
- Page flip: approved as is (~900 ms, stiff page swinging open).
- Banglish = Bangla in English letters, polite "apni" form, SHORT, natural texting style.
  English = very informal, fun, first person "I" (never "we").
- Honesty: no invented numbers, clients, testimonials, prices; never promise "#1 on Google".
- Reduced-motion users get plain versions of all animations. Keep it that way.
- Hosting plan: Cloudflare Pages (free), env vars VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  (the anon value is a `sb_publishable_...` key). `public/_redirects` handles deep links.

## Working with Shihan
- Ask before big changes; he likes to see and approve each visual step.
- Don't use a browser to check work unless he asks (it burns tokens). Prefer `npm run build`,
  reading files and small scripts.
- Never put secrets in the repo. `.env.local` is git-ignored; the Supabase secret key must never be used.
- Use cheaper models for routine work (copy edits, simple components); keep the strongest model for
  architecture, tricky bugs and final review.
