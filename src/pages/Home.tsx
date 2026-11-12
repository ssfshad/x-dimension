import { Bot, Hammer, GraduationCap, TrendingUp, type LucideIcon } from "lucide-react";
import { Page, Reveal, Eyebrow, WhatsAppButton, Card } from "@/components/kit";
import { HeroArt } from "@/components/HeroArt";
import { GlassShimmerLink } from "@/components/rareui/GlassShimmerButton";
import { LiquidButton } from "@/components/rareui/LiquidButton";
import { MagneticScatterText } from "@/components/rareui/MagneticScatterText";
import { useI18n, useWhatsappUrl } from "@/lib/i18n";

const DIMS: { key: string; Icon: LucideIcon }[] = [
  { key: "build", Icon: Hammer },
  { key: "automate", Icon: Bot },
  { key: "teach", Icon: GraduationCap },
  { key: "rank", Icon: TrendingUp },
];

export function Home() {
  const { t, setting } = useI18n();
  const heroRaw = setting<unknown>("asset.hero", "");
  const heroUrl = typeof heroRaw === "string" ? heroRaw : "";
  const whatsapp = useWhatsappUrl();

  return (
    <Page>
      <section className="flex flex-col items-center py-10 text-center sm:py-20">
        {heroUrl ? (
          <img src={heroUrl} alt="" aria-hidden className="mb-2 h-40 w-auto sm:h-52 object-contain" />
        ) : (
          <HeroArt className="mb-2 h-40 w-auto sm:h-52" />
        )}
        <Reveal>
          <Eyebrow>{t("home.hero.eyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-6 max-w-5xl font-display text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            <MagneticScatterText text={t("home.hero.title")} />
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/70 sm:text-xl">
            {t("home.hero.sub")}
          </p>
        </Reveal>
        <Reveal delay={0.18} className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <LiquidButton href={whatsapp}>{t("home.hero.cta")}</LiquidButton>
          <GlassShimmerLink to="/services">{t("home.hero.services")}</GlassShimmerLink>
        </Reveal>
      </section>

      <section className="py-16 sm:py-24">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t("home.dims.title")}
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIMS.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 0.06}>
              <Card className="h-full">
                <div className="flex items-start justify-between">
                  <Icon size={28} aria-hidden="true" className="text-powder" />
                  <span className="font-display text-5xl font-bold text-white/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
                  {t(`home.dims.${key}.title`)}
                </h3>
                <p className="mt-2 text-base text-white/70">{t(`home.dims.${key}.text`)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <Reveal>
          <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t("home.close.title")}
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-10">
          <WhatsAppButton>{t("home.close.cta")}</WhatsAppButton>
        </Reveal>
      </section>
    </Page>
  );
}
