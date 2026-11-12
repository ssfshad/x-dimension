import { ArrowUpRight } from "lucide-react";
import { Eyebrow, Page, Reveal, WhatsAppButton } from "@/components/kit";
import { useI18n } from "@/lib/i18n";

export function Work() {
  const { t, l, items } = useI18n();
  const projects = items("projects");

  return (
    <Page>
      <Reveal>
        <Eyebrow>{t("work.eyebrow")}</Eyebrow>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {t("work.title")}
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-5 max-w-xl text-lg text-white/70">{t("work.intro")}</p>
      </Reveal>

      {projects.length === 0 ? (
        <Reveal delay={0.15} className="mt-12">
          <p className="text-lg text-white/70">{t("work.empty")}</p>
        </Reveal>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((item, i) => {
            const name = l(item.data.name);
            const image = String(item.data.image ?? "");
            const url = String(item.data.url ?? "");
            return (
              <Reveal key={item.id} delay={Math.min(i, 5) * 0.06}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-150 hover:border-white/25">
                  <div className="aspect-[16/10] w-full overflow-hidden bg-white/[0.04]">
                    {image ? (
                      <img src={image} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center bg-white/[0.04] font-display text-8xl font-bold text-white/15"
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-3 p-6">
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                      {l(item.data.tag)}
                    </span>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                      {name}
                    </h2>
                    <p className="text-white/70">{l(item.data.blurb)}</p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-2 text-powder transition-colors duration-150 hover:text-white"
                      >
                        {t("work.card.link")}
                        <ArrowUpRight size={18} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <Reveal delay={0.1} className="mt-6 max-w-md">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/20 p-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
            {t("work.next.title")}
          </h2>
          <p className="text-white/70">{t("work.next.body")}</p>
          <WhatsAppButton>{t("work.next.cta")}</WhatsAppButton>
        </div>
      </Reveal>
    </Page>
  );
}
