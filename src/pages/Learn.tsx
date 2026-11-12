import { Check } from "lucide-react";
import { Book3D, type PageData } from "@/components/rareui/Book3D";
import { Card, Eyebrow, Page, Reveal, WhatsAppButton } from "@/components/kit";
import { useI18n } from "@/lib/i18n";

type Block = { title: string; body: string; points: string[] };

export function Learn() {
  const { t, l, items } = useI18n();
  const courses = items("courses");
  const [bookCourse, ...otherCourses] = courses;
  const bookPages: PageData[] = [1, 2, 3].map((n) => ({
    title: t(`learn.book.p${n}.title`),
    content: t(`learn.book.p${n}.text`),
  }));

  const blocks: Block[] = [
    {
      title: "learn.teams.title",
      body: "learn.teams.body",
      points: ["learn.teams.p1", "learn.teams.p2", "learn.teams.p3"],
    },
    {
      title: "learn.students.title",
      body: "learn.students.body",
      points: ["learn.students.p1", "learn.students.p2", "learn.students.p3"],
    },
  ];

  return (
    <Page>
      <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <div className="self-start lg:sticky lg:top-28">
          <Reveal>
            <Eyebrow>{t("learn.eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
              {t("learn.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-white/70">{t("learn.intro")}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <WhatsAppButton>{t("learn.cta")}</WhatsAppButton>
          </Reveal>
        </div>

        <div className="flex flex-col gap-12">
          {blocks.map((block, i) => (
            <Reveal key={block.title} delay={i * 0.06}>
              <section>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
                  {t(block.title)}
                </h2>
                <p className="mt-3 text-white/70">{t(block.body)}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {block.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-white/70">
                      <Check size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-powder" />
                      <span>{t(p)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}

          <section>
            <Reveal>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
                {t("learn.courses.title")}
              </h2>
            </Reveal>
            {bookCourse && (
              <Reveal delay={0.05}>
                <div className="my-10 flex flex-col items-center gap-6">
                  {/* Scaled down on very narrow phones so the rotated cover stays inside the screen. */}
                  <div className="max-[400px]:origin-center max-[400px]:scale-[0.92]">
                    <Book3D
                      title={l(bookCourse.data.title)}
                      subtitle={l(bookCourse.data.status)}
                      label={l(bookCourse.data.title)}
                      backLabel={t("learn.book.back")}
                      pages={bookPages}
                    />
                  </div>
                  <p className="text-center text-sm text-white/70">{t("learn.book.hint")}</p>
                </div>
              </Reveal>
            )}
            <div className="mt-5 flex flex-col gap-4">
              {otherCourses.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.06}>
                  <Card>
                    <span className="rounded-full border border-powder/50 px-3 py-1 text-xs text-powder">
                      {l(item.data.status)}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white">
                      {l(item.data.title)}
                    </h3>
                    <p className="mt-2 text-white/70">{l(item.data.blurb)}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1} className="mt-8">
              <p className="mb-4 text-white/70">{t("learn.waitlist.text")}</p>
              <WhatsAppButton message={t("learn.waitlist.message")}>
                {t("learn.waitlist.cta")}
              </WhatsAppButton>
            </Reveal>
          </section>
        </div>
      </div>
    </Page>
  );
}
