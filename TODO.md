# X Dimension: to do

Status on 13 Nov 2026: site, admin panel and database are built and working locally;
`npm run build` passes; code is pushed to GitHub (1 commit). Not live yet.

## Next up: go live
- [ ] Cloudflare Pages: connect `ssfshad/x-dimension`, preset Vite, build `npm run build`,
      output `dist`, add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Check the `*.pages.dev` link: all six pages, flip, Banglish switch, /admin login.
- [ ] Custom domain: add `xdimension.pro.bd` in the Cloudflare project and create the DNS
      record it shows at the domain's DNS host (registrar / MetroVPS).
- [ ] In admin, Setup → "Load starting content" once more (adds the new Look settings and the
      Learn book text to the database; never overwrites edits).

## Before or soon after launch
- [ ] Shihan reads every page in Banglish and flags awkward lines.
- [x] (done: public/og.png + og: tags; re-check with Facebook Sharing Debugger after launch) Link-share preview image (Facebook/WhatsApp): needs a static 1200x630 image + `og:` tags
      in `index.html` (can't come from the admin panel; crawlers don't run JS).
- [x] Convert the "xD" text in `public/logo.svg` and `public/favicon.svg` to outlines so it looks
      the same without the font installed (check: these two files were replaced and are now ~8 KB).
- [x] Main bundle is ~750 KB: split heavy parts (Supabase client, motion, WebGL cursor) or lazy-load.
- [ ] Home title fly-in is easy to miss; maybe start it after the page has finished appearing.
- [x] (scaled to 92% under 400 px, not checked on screen yet) Book3D on Learn pokes ~5 px past the left edge at 360 px wide.
- [ ] Admin font preview only shows the real font after saving.
- [ ] `pageIndex` in `src/content/pages.ts` is NOT unused (Seo.tsx needs it). Optional: make Seo use
      `pageIndexIn` from `useSitePages.ts` so there is one version, then remove it.
- [ ] Optional: replace the drawn hero cube with a real Liniqo free illustration
      (download SVG, put in `public/`, or upload it in admin → Images & Look → Home hero picture).

## Later
- [ ] Page builder like Shihan's portfolio admin: add `sections: [{ type, visible, data }]` to
      each `pages.layout` entry, a section registry in code, and an admin editor to add,
      remove and reorder sections (see "Future: page builder" in DESIGN.md).
- [ ] Courses: real course pages and a waitlist when the first course is ready.
- [ ] Real project screenshots for Teacher Koi, FacultyMind, InkCast (upload in admin → Lists).
