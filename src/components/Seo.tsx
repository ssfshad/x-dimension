import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGES, pageIndex } from "@/content/pages";
import { useI18n } from "@/lib/i18n";

/** Sets the document title and meta description for the current page. Renders nothing. */
export function Seo() {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      document.title = t("seo.admin.title");
      return;
    }

    const index = pageIndex(pathname);
    const page = index >= 0 ? PAGES[index] : undefined;
    document.title = page ? t(`seo.${page.key}.title`) : t("seo.notfound.title");
    if (!page) return;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = t(`seo.${page.key}.description`);
  }, [pathname, lang, t]);

  return null;
}
