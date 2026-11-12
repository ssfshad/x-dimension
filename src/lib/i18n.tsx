import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultItems, defaultSettings, type Item, type Loc } from "@/content/defaults";
import { strings as defaultStrings, type Lang } from "@/content/strings";
import { supabase } from "@/lib/supabase";

type Strings = Record<string, Loc>;

export type Store = {
  strings: Strings;
  items: Record<string, Item[]>;
  settings: Record<string, unknown>;
};

type Content = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Text by key, in the current language. */
  t: (key: string) => string;
  /** Pick the current language out of an { en, bn } value. */
  l: (value: unknown) => string;
  /** Visible items of a list (services, projects, courses), in order. */
  items: (collection: string) => Item[];
  setting: <T>(key: string, fallback: T) => T;
  /** Everything, including hidden items. Used by the admin panel. */
  store: Store;
  /** Re-read the database. The admin panel calls this after saving. */
  reload: () => Promise<void>;
};

const defaults: Store = {
  strings: defaultStrings,
  items: defaultItems,
  settings: defaultSettings,
};

const LANG_KEY = "xd-lang";
const CACHE_KEY = "xd-content";

function merge(over: Partial<Store> | null): Store {
  if (!over) return defaults;
  return {
    strings: { ...defaults.strings, ...over.strings },
    // A list that exists in the database replaces the built-in list entirely.
    items: { ...defaults.items, ...over.items },
    settings: { ...defaults.settings, ...over.settings },
  };
}

function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

function readCache(): Store {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return merge(JSON.parse(raw) as Partial<Store>);
  } catch {
    // No usable cache; fall through to the defaults.
  }
  return defaults;
}

async function fetchOverrides(): Promise<Partial<Store> | null> {
  if (!supabase) return null;
  const [s, i, st] = await Promise.all([
    supabase.from("strings").select("key,en,bn"),
    supabase.from("items").select("id,collection,sort,visible,data").order("sort"),
    supabase.from("settings").select("key,value"),
  ]);
  if (s.error || i.error || st.error) return null;

  const strings: Strings = {};
  for (const r of s.data as { key: string; en: string | null; bn: string | null }[]) {
    strings[r.key] = { en: r.en ?? "", bn: r.bn ?? "" };
  }

  const items: Record<string, Item[]> = {};
  for (const r of i.data as (Item & { collection: string })[]) {
    (items[r.collection] ??= []).push({
      id: r.id,
      sort: r.sort,
      visible: r.visible,
      data: r.data ?? {},
    });
  }

  const settings: Record<string, unknown> = {};
  for (const r of st.data as { key: string; value: unknown }[]) settings[r.key] = r.value;

  return { strings, items, settings };
}

const ContentContext = createContext<Content | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const [store, setStore] = useState<Store>(readCache);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // Storage can be unavailable; the choice then lasts for this visit only.
    }
  }, []);

  const reload = useCallback(async () => {
    const over = await fetchOverrides();
    if (!over) return;
    setStore(merge(over));
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(over));
    } catch {
      // Cache is a speed-up only.
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn-Latn" : "en";
  }, [lang]);

  // The accent colour is editable, so it lives in a CSS variable.
  const accent = store.settings["brand.accent"];
  useEffect(() => {
    if (typeof accent === "string" && accent) {
      document.documentElement.style.setProperty("--color-powder", accent);
    }
  }, [accent]);

  const value = useMemo<Content>(() => {
    const l = (v: unknown) => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object") {
        const loc = v as Partial<Loc>;
        return loc[lang] || loc.en || "";
      }
      return "";
    };
    return {
      lang,
      setLang,
      store,
      reload,
      l,
      t: (key) => l(store.strings[key]) || key,
      items: (collection) =>
        (store.items[collection] ?? [])
          .filter((it) => it.visible)
          .sort((a, b) => a.sort - b.sort),
      setting: <T,>(key: string, fallback: T) =>
        (store.settings[key] as T | undefined) ?? fallback,
    };
  }, [lang, setLang, store, reload]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useI18n(): Content {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useWhatsappUrl(): string {
  const number = useI18n().setting("whatsapp.number", "8801410336636");
  return `https://wa.me/${String(number).replace(/\D/g, "")}`;
}
