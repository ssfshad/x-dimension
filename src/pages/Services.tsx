import { Page, Reveal, Eyebrow, WhatsAppButton } from "@/components/kit";
import { iconFor } from "@/lib/icons";
import { useI18n } from "@/lib/i18n";

const STEPS = ["1", "2", "3"];

export function Services() {
  const { t, l, items } = useI18n();
  const list = items("services");

  return (
    <Page>
      <header className="max-w-3xl text-left">
        <Reveal>
          <Eyebrow>{t("services.eyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
            {t("services.title")}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{t("services.intro")}</p>
        </Reveal>
      </header>

      <section className="mt-14 sm:mt-20">
        {list.map((item, i) => {
          const iconName = typeof item.data.icon === "string" ? item.data.icon : "";
          const Icon = iconFor(iconName);
          const num = String(i + 1).padStart(2, "0");
          const featured = Boolean(item.data.featured);

          const body = (
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
              <span className="font-display text-5xl font-bold text-white/30 sm:w-24 sm:shrink-0 sm:text-6xl">
                {num}
              </span>
              <div className="flex-1">
                {featured && (
                  <span className="mb-3 inline-block rounded-full bg-powder px-3 py-1 font-display text-sm font-medium text-black">
                    {t("services.bundle.badge")}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <Icon size={28} aria-hidden="true" className="shrink-0 text-powder" />
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                    {l(item.data.title)}
                  </h2>
                </div>
                <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
                  {l(item.data.blurb)}
                </p>
                {featured && (
                  <WhatsAppButton message={t("services.bundle.message")} className="mt-6">
                    {t("services.bundle.cta")}
                  </WhatsAppButton>
                )}
              </div>
            </div>
          );

          return (
            <Reveal key={item.id} delay={Math.min(i, 4) * 0.05}>
              {featured ? (
                <div className="my-6 rounded-2xl border border-powder/60 bg-powder/[0.06] p-6 sm:p-8">
                  {body}
                </div>
              ) : (
                <div className="border-t border-white/10 py-8 sm:py-10">{body}</div>
              )}
            </Reveal>
          );
        })}
      </section>

      <section className="mt-20 border-t border-white/10 pt-16 sm:mt-28">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t("services.how.title")}
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((n, i) => (
            <Reveal key={n} delay={i * 0.06}>
              <span className="font-display text-5xl font-bold text-white/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white">
                {t(`services.how.${n}.title`)}
              </h3>
              <p className="mt-2 text-base text-white/70">{t(`services.how.${n}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 flex flex-col items-start gap-6 border-t border-white/10 pt-16 sm:mt-28">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t("services.close.title")}
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <WhatsAppButton>{t("services.close.cta")}</WhatsAppButton>
        </Reveal>
      </section>
    </Page>
  );
}
