import { useMemo } from "react";
import { PAGES } from "@/content/pages";
import { useI18n } from "@/lib/i18n";

export type SitePage = (typeof PAGES)[number];
/** Extra fields (for example a future "sections" list) are kept as they are. */
export type LayoutEntry = { key: SitePage["key"]; visible: boolean; [extra: string]: unknown };

/**
 * Turn the raw "pages.layout" setting into a clean, complete, ordered list.
 * Unknown keys are dropped, missing registry pages are appended as visible,
 * and "home" is always visible and always first. Hidden pages are kept here;
 * use useSitePages() for the visible ones only.
 */
export function normalizeLayout(raw: unknown): LayoutEntry[] {
  const seen = new Set<string>();
  const out: LayoutEntry[] = [];
  if (Array.isArray(raw)) {
    for (const entry of raw as unknown[]) {
      if (typeof entry !== "object" || entry === null) continue;
      const { key, visible } = entry as { key?: unknown; visible?: unknown };
      if (typeof key !== "string" || typeof visible !== "boolean") continue;
      const page = PAGES.find((p) => p.key === key);
      if (!page || seen.has(page.key)) continue;
      seen.add(page.key);
      out.push({ ...(entry as Record<string, unknown>), key: page.key, visible });
    }
  }
  for (const p of PAGES) {
    if (!seen.has(p.key)) out.push({ key: p.key, visible: true });
  }
  const rest = out.filter((e) => e.key !== "home");
  const home = out.find((e) => e.key === "home");
  return [{ ...home, key: "home", visible: true }, ...rest];
}

/** The visible pages of the book, in the order the owner chose. */
export function useSitePages(): SitePage[] {
  const { setting } = useI18n();
  const raw = setting<unknown>("pages.layout", null);
  return useMemo(() => {
    const result: SitePage[] = [];
    for (const entry of normalizeLayout(raw)) {
      if (!entry.visible) continue;
      const page = PAGES.find((p) => p.key === entry.key);
      if (page) result.push(page);
    }
    return result;
  }, [raw]);
}

/** Index of a pathname within an ordered page list, or -1. */
export function pageIndexIn(pages: readonly SitePage[], pathname: string): number {
  return pages.findIndex((p) => p.path === pathname);
}
