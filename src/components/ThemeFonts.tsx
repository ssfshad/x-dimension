import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

/** Google Fonts (Latin) the owner can choose from. */
export const FONT_CHOICES = [
  "Space Grotesk",
  "Inter",
  "Sora",
  "Manrope",
  "Outfit",
  "Syne",
  "Unbounded",
  "DM Sans",
  "Plus Jakarta Sans",
  "Poppins",
] as const;

export const DEFAULT_DISPLAY_FONT = "Space Grotesk";
export const DEFAULT_BODY_FONT = "Inter";

/** A stored value if it is an allowed font, else the fallback. */
export function fontOr(value: unknown, fallback: string): string {
  return typeof value === "string" && (FONT_CHOICES as readonly string[]).includes(value)
    ? value
    : fallback;
}

const LINK_ID = "xd-fonts";
const family = (name: string) => `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@400;500;600;700`;

/** Applies the owner's fonts and browser tab icon. Renders nothing. */
export function ThemeFonts() {
  const { setting } = useI18n();
  const display = fontOr(setting<unknown>("theme.font_display", DEFAULT_DISPLAY_FONT), DEFAULT_DISPLAY_FONT);
  const body = fontOr(setting<unknown>("theme.font_body", DEFAULT_BODY_FONT), DEFAULT_BODY_FONT);
  const faviconRaw = setting<unknown>("asset.favicon", "");
  const favicon = typeof faviconRaw === "string" ? faviconRaw : "";

  useEffect(() => {
    const root = document.documentElement;
    const existing = document.getElementById(LINK_ID);
    if (display === DEFAULT_DISPLAY_FONT && body === DEFAULT_BODY_FONT) {
      // The defaults are already loaded by index.html.
      existing?.remove();
      root.style.removeProperty("--font-display");
      root.style.removeProperty("--font-sans");
      return;
    }
    const families = display === body ? [family(display)] : [family(display), family(body)];
    const href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
    let link = existing as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
    root.style.setProperty("--font-display", `"${display}", ui-sans-serif, sans-serif`);
    root.style.setProperty("--font-sans", `"${body}", ui-sans-serif, sans-serif`);
  }, [display, body]);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    if (favicon) {
      link.removeAttribute("type");
      link.href = favicon;
    } else {
      link.type = "image/svg+xml";
      link.href = "/favicon.svg";
    }
  }, [favicon]);

  return null;
}
