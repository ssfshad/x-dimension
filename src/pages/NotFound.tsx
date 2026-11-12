import { GlassShimmerLink } from "@/components/rareui/GlassShimmerButton";
import { Page, Reveal } from "@/components/kit";
import { useI18n } from "@/lib/i18n";

export function NotFound() {
  const { t } = useI18n();

  return (
    <Page className="flex min-h-full flex-col items-center justify-center text-center">
      <Reveal>
        <p className="font-display text-8xl font-bold tracking-tight text-powder sm:text-9xl">
          {t("notfound.code")}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {t("notfound.title")}
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-md text-lg text-white/70">{t("notfound.text")}</p>
      </Reveal>

      <Reveal delay={0.15} className="mt-10">
        <GlassShimmerLink to="/">{t("notfound.back")}</GlassShimmerLink>
      </Reveal>
    </Page>
  );
}
