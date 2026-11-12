import type { Loc } from "@/content/defaults";
import about from "@/content/strings/about";
import admin from "@/content/strings/admin";
import contact from "@/content/strings/contact";
import home from "@/content/strings/home";
import learn from "@/content/strings/learn";
import seo from "@/content/strings/seo";
import services from "@/content/strings/services";
import work from "@/content/strings/work";

export type Lang = "en" | "bn";

// Default text for the whole site. "bn" is Banglish (Bangla in English letters).
// The admin panel will later override these from the database.
const shell: Record<string, Loc> = {
  "nav.home": { en: "Home", bn: "Home" },
  "nav.services": { en: "Services", bn: "Ki ki kori" },
  "nav.work": { en: "Work", bn: "Ja banaisi" },
  "nav.learn": { en: "Learn", bn: "Shikhun" },
  "nav.about": { en: "About", bn: "Ami ke" },
  "nav.contact": { en: "Contact", bn: "Knock din" },
  "nav.whatsapp": { en: "WhatsApp me", bn: "WhatsApp e knock din" },
  "nav.menu": { en: "Menu", bn: "Menu" },
  "nav.next": { en: "Next page", bn: "Porer pata" },
  "nav.prev": { en: "Previous page", bn: "Ager pata" },

};

export const strings: Record<string, Loc> = {
  ...shell,
  ...home,
  ...services,
  ...work,
  ...learn,
  ...about,
  ...contact,
  ...seo,
  ...admin,
};
