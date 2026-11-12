# X Dimension: build rules for every page

Company: X Dimension (xdimension.pro.bd). One-person AI company in Bangladesh, run by Shihan.
Sells: AI chatbots, automations, custom web apps, AI training (companies and students),
and a "portfolio site + SEO" bundle. Courses come later. Contact is WhatsApp only.

## Stack (already set up, do not change)
Vite + React 19 + TypeScript (strict) + Tailwind v4 + react-router-dom v7 + `motion` v12
(`import { motion } from "motion/react"`) + lucide-react + sonner. Path alias `@/` = `src/`.
There is NO network: never run npm/npx/build commands. Only write files.

## Look
- "Black paper": pages sit on a near-black grainy background supplied by the book shell.
  NEVER set a page background colour or full-page wrapper background.
- Text: `text-white` for headings, `text-white/70` for body, `text-white/50` for small labels
  (only at 14px+; never lower contrast than white/50).
- One accent: powder blue. Use the Tailwind colour `powder` (`text-powder`, `bg-powder`,
  `border-powder`). On `bg-powder` use `text-black`. No other colours, no gradients-as-decoration,
  no emoji, no glassmorphism, no left-border accent cards.
- Fonts: headings `font-display` (Space Grotesk), body default (Inter).
- Surfaces: `rounded-2xl border border-white/10 bg-white/[0.03]`. Hover: `hover:border-white/25`.
- Big type is the main visual. Headings `tracking-tight`. Hero sizes `text-5xl sm:text-7xl` or larger.
- Icons: lucide-react only, `aria-hidden="true"`, size 18 to 28.

## Layout
- Every page's root is `<Page>` from `@/components/kit` (adds the top padding for the fixed
  64px nav, bottom padding for the corner buttons, and max width). Do not add your own `<main>`.
- Must work from 360px wide up to 1440px. No horizontal scroll. Stack on mobile.
- Each page must look a little different from the others (see your task), but share the rules above.
- Touch targets at least 44px tall.

## Motion (keep it tasteful)
- Use `<Reveal>` from `@/components/kit` for entrance animation. Stagger with `delay` in steps
  of 0.05 to 0.08 seconds. Do not write other entrance animations.
- Hover/press: CSS transitions only, 150ms, `transition-colors` or `transition-transform`;
  pressable things get `active:scale-[0.97]`. Animate only transform and opacity.
- No scroll-jacking, no parallax, no infinite animations, no global key handlers.

## Content: NOTHING hard-coded
The owner edits everything from an admin panel, so pages never contain literal visitor-facing text.
```ts
import { useI18n, useWhatsappUrl } from "@/lib/i18n";
const { t, l, items, setting, lang } = useI18n();
t("home.hero.title")            // text by key, current language
items("services")               // Item[] = { id, sort, visible, data }
l(item.data.title)              // picks en/bn out of { en, bn }
useWhatsappUrl()                // https://wa.me/<number>
```
- Lists: `services` (data: icon, title, blurb, featured?), `projects` (data: tag, name, blurb,
  url, image), `courses` (data: status, title, blurb). See `src/content/defaults.ts`. Do not edit it.
  Item `data` values are `unknown`: read them through `l()` for text, `String(x ?? "")` for urls.
- Your page's text goes in ONE file you own: `src/content/strings/<page>.ts`:
  ```ts
  import type { Loc } from "@/content/defaults";
  const strings: Record<string, Loc> = {
    "home.hero.title": { en: "...", bn: "..." },
  };
  export default strings;
  ```
  Keys are `<page>.<section>.<name>`. Every key needs both `en` and `bn`.

## Voice
- `en`: very informal, fun, short. Light jokes. Sounds like a friendly person, not a company.
  First person singular ("I"), never "we". No buzzwords (no "leverage", "cutting-edge",
  "solutions", "seamless", "empower"). No exclamation-mark spam.
- `bn`: Banglish = Bangla written in English letters, the way people in Dhaka text, with English
  tech words left as they are. Example: "Amra AI diye kaj kori", "Boring kaj gula robot korbe",
  "Knock dao". Same meaning and same joke as the English, not a word-for-word translation.
- Honesty rules: NO invented numbers, clients, testimonials, years of experience, awards or
  prices. Do not promise "#1 on Google"; say "built to rank on Google and get picked up by AI
  assistants". Courses are "coming soon".

## Accessibility
Real `<a href>` and `<button type="button">`; one `<h1>` per page then `<h2>`/`<h3>`;
external links get `target="_blank" rel="noreferrer"`; images need `alt` from content.

## Files you may touch
Only the files named in your task. Never edit App.tsx, index.css, kit.tsx, i18n.tsx,
defaults.ts, strings.ts, or another page's files.

## Future: page builder
The setting `pages.layout` is an ordered array of page objects (`{ key, visible }`) so it can grow
into a page builder. Later each entry can hold `sections: [{ type, visible, data }]`, rendered from
a section registry (type -> React component). `useSitePages()` and `normalizeLayout()` in
`src/lib/useSitePages.ts` are the extension point: they already own validation and ordering, so
sections can be added there without changing the nav, book or admin wiring.
