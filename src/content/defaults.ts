// Default lists and settings. The admin panel overrides these from the database.

export type Loc = { en: string; bn: string };

export type Item = {
  id: string;
  sort: number;
  visible: boolean;
  /** Free-form fields. Text shown to visitors is stored as { en, bn }. */
  data: Record<string, unknown>;
};

const item = (id: string, sort: number, data: Record<string, unknown>): Item => ({
  id,
  sort,
  visible: true,
  data,
});

export const defaultItems: Record<string, Item[]> = {
  services: [
    item("svc-chatbots", 1, {
      icon: "bot",
      title: { en: "AI chatbots", bn: "AI chatbot" },
      blurb: {
        en: "A chatbot that answers your customers at 3am so you don't have to.",
        bn: "Raat 3 tay customer er reply dibe chatbot. Apni ghuman.",
      },
    }),
    item("svc-automations", 2, {
      icon: "workflow",
      title: { en: "Automations", bn: "Automation" },
      blurb: {
        en: "Copy-paste jobs, reports, reminders. If it's boring, a robot can do it.",
        bn: "Copy-paste, report, reminder. Boring kaj robot korbe.",
      },
    }),
    item("svc-webapps", 3, {
      icon: "app-window",
      title: { en: "Custom web apps", bn: "Custom web app" },
      blurb: {
        en: "Your idea, built as a real app people can open and use.",
        bn: "Apnar idea theke ashol app.",
      },
    }),
    item("svc-training", 4, {
      icon: "graduation-cap",
      title: { en: "AI training", bn: "AI training" },
      blurb: {
        en: "Hands-on AI sessions for teams and students. No scary maths.",
        bn: "Team ar student der hate-kolome AI. Kothin math nai.",
      },
    }),
    item("svc-portfolio", 5, {
      icon: "search",
      featured: true,
      title: { en: "Portfolio + SEO bundle", bn: "Portfolio + SEO bundle" },
      blurb: {
        en: "Your own portfolio site, built to rank on Google and get picked up by AI assistants.",
        bn: "Nijer portfolio site. Google ar AI te apnake khuje pabe.",
      },
    }),
  ],
  projects: [
    item("prj-teacher-koi", 1, {
      tag: { en: "Web app", bn: "Web app" },
      name: { en: "Teacher Koi?", bn: "Teacher Koi?" },
      blurb: {
        en: "A tuition scheduler for teachers juggling too many students.",
        bn: "Onek student, onek time. Teacher der tuition schedule app.",
      },
      url: "",
      image: "",
    }),
    item("prj-facultymind", 2, {
      tag: { en: "AI assistant", bn: "AI assistant" },
      name: { en: "FacultyMind", bn: "FacultyMind" },
      blurb: {
        en: "An AI assistant for university faculty. Still in the oven.",
        bn: "University teacher der AI assistant. Kaj cholche.",
      },
      url: "",
      image: "",
    }),
    item("prj-inkcast", 3, {
      tag: { en: "Desktop tool", bn: "Desktop tool" },
      name: { en: "InkCast", bn: "InkCast" },
      blurb: {
        en: "Draw on your Windows screen live from a tablet. Made for teaching videos.",
        bn: "Tablet theke Windows screen e live aka. Teaching video er jonno.",
      },
      url: "https://github.com/ssfshad/inkcast",
      image: "",
    }),
  ],
  courses: [
    item("crs-ai-basics", 1, {
      status: { en: "Coming soon", bn: "Ashche" },
      title: { en: "AI for normal people", bn: "Shobar jonno AI" },
      blurb: {
        en: "Use AI at work without becoming a programmer.",
        bn: "Programmer na hoyeo kaje AI use korun.",
      },
    }),
  ],
};

export const defaultSettings: Record<string, unknown> = {
  "whatsapp.number": "8801410336636",
  "brand.accent": "#b0e0e6",
  "flip.enabled": true,
  "flip.ms": 900,
  "cursor.enabled": true,
  // Images: an empty string means "use the built-in one".
  "asset.logo": "",
  "asset.favicon": "",
  "asset.hero": "",
  "asset.about_photo": "",
  "theme.font_display": "Space Grotesk",
  "theme.font_body": "Inter",
  // Hex like #0b0b0c. Empty = each page keeps its own built-in shade.
  "theme.background": "",
  // An ordered array of page objects ON PURPOSE: later each object may gain a
  // "sections" array ({ type, visible, data }) to become a full page builder.
  "pages.layout": [
    { key: "home", visible: true },
    { key: "services", visible: true },
    { key: "work", visible: true },
    { key: "learn", visible: true },
    { key: "about", visible: true },
    { key: "contact", visible: true },
  ],
};
