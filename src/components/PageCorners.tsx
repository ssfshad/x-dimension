import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { pageIndexIn, useSitePages } from "@/lib/useSitePages";

const corner =
  "fixed bottom-5 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-[#0b0b0c]/80 px-4 text-sm text-white/80 backdrop-blur-md transition-colors duration-150 hover:text-white active:scale-[0.97]";

/** Turn-the-page buttons in the bottom corners, like the corners of a book. */
export function PageCorners() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const pages = useSitePages();
  const i = pageIndexIn(pages, pathname);
  const prev = i > 0 ? pages[i - 1] : undefined;
  const next = i >= 0 && i < pages.length - 1 ? pages[i + 1] : undefined;

  return (
    <>
      {prev && (
        <Link to={prev.path} aria-label={t("nav.prev")} className={`${corner} left-5`}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{t(`nav.${prev.key}`)}</span>
        </Link>
      )}
      {next && (
        <Link to={next.path} aria-label={t("nav.next")} className={`${corner} right-5`}>
          <span className="hidden sm:inline">{t(`nav.${next.key}`)}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </>
  );
}
