import { PAGES } from "@/content/pages";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const layouts = [
  "items-center text-center",
  "items-start text-left",
  "items-end text-right",
  "items-start text-left",
  "items-center text-center",
  "items-end text-right",
];

/** Temporary page body used to test the page-flip. Real pages replace this. */
export function Placeholder({ index }: { index: number }) {
  const { t } = useI18n();
  const page = PAGES[index] ?? PAGES[0];

  return (
    <main
      className={cn(
        "mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-6 px-6 pb-28 pt-28 sm:px-10",
        layouts[index % layouts.length],
      )}
    >
      <p className="font-display text-sm tracking-[0.3em] text-powder">
        {String(index + 1).padStart(2, "0")} / {String(PAGES.length).padStart(2, "0")}
      </p>
      <h1 className="font-display text-6xl font-bold tracking-tight text-white sm:text-8xl">
        {t(`page.${page.key}.title`)}
      </h1>
      <p className="max-w-xl text-lg text-white/70">{t(`page.${page.key}.tagline`)}</p>
    </main>
  );
}
