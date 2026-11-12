import { Check } from "lucide-react";
import { Card, Eyebrow, Page, Reveal } from "@/components/kit";
import { LiquidButton } from "@/components/rareui/LiquidButton";
import { useI18n, useWhatsappUrl } from "@/lib/i18n";

const sendItems = ["contact.send.item1", "contact.send.item2", "contact.send.item3"] as const;

export function Contact() {
  const { t, setting } = useI18n();
  const number = String(setting("whatsapp.number", "8801410336636"));
  const whatsapp = useWhatsappUrl();

  return (
    <Page className="flex min-h-full flex-col items-center justify-center text-center">
      <Reveal>
        <Eyebrow>{t("contact.eyebrow")}</Eyebrow>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-4 text-5xl sm:text-7xl font-display font-bold tracking-tight text-white">
          {t("contact.title")}
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-xl text-lg text-white/70">{t("contact.funny")}</p>
      </Reveal>

      <Reveal delay={0.15} className="mt-10">
        <LiquidButton href={`${whatsapp}?text=${encodeURIComponent(t("contact.prefill"))}`}>
          {t("contact.button")}
        </LiquidButton>
      </Reveal>

      <Reveal delay={0.2} className="mt-8">
        <p className="text-sm text-white/50">{t("contact.number")}</p>
        <p className="mt-1 font-display text-2xl text-white">{`+${number}`}</p>
      </Reveal>

      <Reveal delay={0.25} className="mt-12 w-full max-w-md text-left">
        <Card>
          <h2 className="font-display text-xl font-bold text-white">{t("contact.send.title")}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {sendItems.map((key) => (
              <li key={key} className="flex items-start gap-3 text-white/70">
                <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-powder" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </Page>
  );
}
