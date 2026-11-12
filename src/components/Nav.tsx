import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MessageCircle, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useI18n, useWhatsappUrl } from "@/lib/i18n";
import { useSitePages } from "@/lib/useSitePages";
import { cn } from "@/lib/utils";

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-white/15 p-0.5 text-xs font-medium">
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            "min-h-8 rounded-full px-3 transition-colors duration-150",
            lang === code ? "bg-white text-black" : "text-white/70 hover:text-white",
          )}
        >
          {code === "en" ? "English" : "Banglish"}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { t } = useI18n();
  const whatsapp = useWhatsappUrl();
  const { pathname } = useLocation();
  const pages = useSitePages();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex h-16 items-center gap-4 border-b border-white/10 bg-[#0b0b0c]/80 px-4 backdrop-blur-md sm:px-8">
        <Link to="/" onClick={() => setOpen(false)} className="text-white">
          <Logo size={36} withWordmark />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {pages.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              aria-current={pathname === p.path ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-colors duration-150",
                pathname === p.path ? "text-powder" : "text-white/70 hover:text-white",
              )}
            >
              {t(`nav.${p.key}`)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <LangToggle />
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-9 items-center gap-2 rounded-full bg-powder px-4 text-sm font-medium text-black transition-transform duration-150 active:scale-[0.97] sm:inline-flex"
          >
            <MessageCircle size={16} aria-hidden="true" />
            {t("nav.whatsapp")}
          </a>
          <button
            type="button"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-b border-white/10 bg-[#0b0b0c]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          {pages.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              onClick={() => setOpen(false)}
              aria-current={pathname === p.path ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-3 text-base",
                pathname === p.path ? "text-powder" : "text-white/80",
              )}
            >
              {t(`nav.${p.key}`)}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-powder px-4 text-sm font-medium text-black"
          >
            <MessageCircle size={16} aria-hidden="true" />
            {t("nav.whatsapp")}
          </a>
        </nav>
      )}
    </header>
  );
}
