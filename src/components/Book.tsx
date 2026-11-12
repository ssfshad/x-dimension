import { useEffect, useState, type AnimationEvent, type CSSProperties, type ReactNode } from "react";
import { useLocation, type Location } from "react-router-dom";
import { PAGES } from "@/content/pages";
import { useI18n } from "@/lib/i18n";
import { pageIndexIn, useSitePages } from "@/lib/useSitePages";

type Role = "rest" | "under" | "under-back" | "leaf-out" | "leaf-in";
type Flip = { from: Location; dir: 1 | -1 };

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Shows one page at a time and turns between pages like a book.
 * Forward: the old page lifts off around its left edge, revealing the new one.
 * Backward: the new page swings back down over the old one.
 */
export function Book({ renderPage }: { renderPage: (location: Location) => ReactNode }) {
  const location = useLocation();
  const { setting } = useI18n();
  const pages = useSitePages();
  const background = String(setting("theme.background", ""));
  const toneOf = (pathname: string) =>
    HEX.test(background)
      ? background
      : (PAGES.find((p) => p.path === pathname)?.tone ?? PAGES[0].tone);
  const enabled = setting("flip.enabled", true);
  const ms = Number(setting("flip.ms", 900)) || 900;
  const [shown, setShown] = useState(location);
  const [flip, setFlip] = useState<Flip | null>(null);

  // Derive the flip during render so both pages are on screen in the same frame.
  if (location.pathname !== shown.pathname) {
    const dir = pageIndexIn(pages, location.pathname) >= pageIndexIn(pages, shown.pathname) ? 1 : -1;
    setFlip(enabled ? { from: shown, dir } : null);
    setShown(location);
  }

  const active = flip && flip.from.pathname !== shown.pathname ? flip : null;
  const flipping = active !== null;
  const layers: { loc: Location; role: Role }[] = !active
    ? [{ loc: shown, role: "rest" }]
    : active.dir === 1
      ? [
          { loc: shown, role: "under" },
          { loc: active.from, role: "leaf-out" },
        ]
      : [
          { loc: active.from, role: "under-back" },
          { loc: shown, role: "leaf-in" },
        ];

  // Safety net: if the browser never reports the animation ending (a background
  // tab, a paused page), finish the turn anyway so the site never stays locked.
  useEffect(() => {
    if (!flipping) return;
    const timer = window.setTimeout(() => setFlip(null), ms + 400);
    return () => window.clearTimeout(timer);
  }, [flipping, ms, shown.pathname]);

  const onEnd =(e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setFlip(null);
  };

  return (
    <div
      className={flipping ? "book book--flipping" : "book"}
      style={{ "--flip-ms-user": `${ms}ms` } as CSSProperties}
    >
      {layers.map(({ loc, role }) => (
        <div
          key={loc.pathname}
          className={`leaf leaf--${role}`}
          style={{ "--paper": toneOf(loc.pathname) } as CSSProperties}
          onAnimationEnd={role === "leaf-out" || role === "leaf-in" ? onEnd : undefined}
        >
          <div className="page-scroll">{renderPage(loc)}</div>
          <div className="leaf-shade" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
