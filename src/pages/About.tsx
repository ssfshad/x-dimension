import { Eyebrow, Page, Reveal, WhatsAppButton } from "@/components/kit";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

const PARAGRAPHS = ["about.p1", "about.p2", "about.p3"];
const FACTS = ["about.fact.1", "about.fact.2", "about.fact.3", "about.fact.4"];

export function About() {
  const { t, setting } = useI18n();
  const photoRaw = setting<unknown>("asset.about_photo", "");
  const photoUrl = typeof photoRaw === "string" ? photoRaw : "";

  return (
    <Page>
      <div className="max-w-2xl text-left">
        <Reveal>
          <Eyebrow>{t("about.eyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
            {t("about.title")}
          </h1>
        </Reveal>

        {photoUrl && (
          <Reveal delay={0.08} className="mt-8">
            <img
              src={photoUrl}
              alt={t("about.photo.alt")}
              className="aspect-square w-full max-w-xs rounded-2xl border border-white/10 object-cover"
            />
          </Reveal>
        )}

        <div className="mt-10 flex flex-col gap-6">
          {PARAGRAPHS.map((key, i) => (
            <Reveal key={key} delay={0.1 + i * 0.06}>
              <p className="text-lg leading-relaxed text-white/70">{t(key)}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {FACTS.map((key) => (
              <li key={key} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
                {t(key)}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.35} className="mt-12">
          <div className="flex items-center gap-5 text-white">
            <Logo size={72} />
            <p className="text-white/70">{t("about.logo.caption")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.4} className="mt-12">
          <p className="mb-5 font-display text-2xl font-semibold tracking-tight text-white">
            {t("about.signoff")}
          </p>
          <WhatsAppButton>{t("about.cta")}</WhatsAppButton>
        </Reveal>
      </div>
    </Page>
  );
}
