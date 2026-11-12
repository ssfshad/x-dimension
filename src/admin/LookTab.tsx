import { useState, type ChangeEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { normalizeLayout, type LayoutEntry } from "@/lib/useSitePages";
import {
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  FONT_CHOICES,
  fontOr,
} from "@/components/ThemeFonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const HEX = /^#[0-9a-fA-F]{6}$/;

const IMAGES: { key: string; label: string }[] = [
  { key: "asset.logo", label: "Logo" },
  { key: "asset.favicon", label: "Browser tab icon (square, PNG or SVG)" },
  { key: "asset.hero", label: "Home hero picture" },
  { key: "asset.about_photo", label: "About page photo" },
];

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

const selectClass =
  "h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-white sm:w-64";

export function LookTab({ client }: { client: SupabaseClient }) {
  const { store, t, reload } = useI18n();
  const settings = store.settings;

  const [busy, setBusy] = useState(false);
  const [display, setDisplay] = useState(() =>
    fontOr(settings["theme.font_display"], DEFAULT_DISPLAY_FONT),
  );
  const [body, setBody] = useState(() => fontOr(settings["theme.font_body"], DEFAULT_BODY_FONT));
  const [bg, setBg] = useState(() => {
    const v = settings["theme.background"];
    return typeof v === "string" ? v : "";
  });
  const [layout, setLayout] = useState<LayoutEntry[]>(() => normalizeLayout(settings["pages.layout"]));

  /** Save one or more settings, toast the result and refresh the site content. */
  async function saveSettings(rows: { key: string; value: unknown }[], okMessage: string) {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const { error } = await client
        .from("settings")
        .upsert(rows.map((r) => ({ key: r.key, value: r.value, updated_at: now })));
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(okMessage);
      await reload();
    } catch (e: unknown) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  async function upload(key: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.includes(".") ? (file.name.split(".").pop() ?? "png") : "png";
      const path = `site/${key}-${Date.now()}.${ext.toLowerCase()}`;
      const { error } = await client.storage.from("media").upload(path, file, { upsert: true });
      if (error) {
        toast.error(error.message);
        return;
      }
      const url = client.storage.from("media").getPublicUrl(path).data.publicUrl;
      const now = new Date().toISOString();
      const { error: e2 } = await client
        .from("settings")
        .upsert({ key, value: url, updated_at: now });
      if (e2) {
        toast.error(e2.message);
        return;
      }
      toast.success("Image saved");
      await reload();
    } catch (err: unknown) {
      toast.error(message(err));
    } finally {
      setBusy(false);
    }
  }

  function saveFonts() {
    return saveSettings(
      [
        { key: "theme.font_display", value: display },
        { key: "theme.font_body", value: body },
      ],
      "Fonts saved",
    );
  }

  function saveBackground() {
    if (!HEX.test(bg)) {
      toast.error("Background must look like #0b0b0c.");
      return Promise.resolve();
    }
    return saveSettings([{ key: "theme.background", value: bg }], "Background saved");
  }

  async function resetBackground() {
    setBg("");
    await saveSettings([{ key: "theme.background", value: "" }], "Using per-page shades");
  }

  function move(index: number, dir: -1 | 1) {
    setLayout((list) => {
      const target = index + dir;
      // Home stays first, so nothing can swap into position 0.
      if (index <= 0 || target < 1 || target >= list.length) return list;
      const next = [...list];
      const a = next[index];
      const b = next[target];
      if (!a || !b) return list;
      next[index] = b;
      next[target] = a;
      return next;
    });
  }

  function setVisible(key: string, visible: boolean) {
    setLayout((list) => list.map((e) => (e.key === key ? { ...e, visible } : e)));
  }

  const bgPicker = HEX.test(bg) ? bg : "#0b0b0c";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Choosing a file saves it straight away.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {IMAGES.map(({ key, label }) => {
            const raw = settings[key];
            const url = typeof raw === "string" ? raw : "";
            const inputId = `look-${key}`;
            return (
              <div key={key} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 text-center text-xs text-white/70">
                  {url ? (
                    <img src={url} alt={`${label} preview`} className="h-full w-full object-contain" />
                  ) : (
                    "Using built-in"
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={inputId}>{label}</Label>
                  <Input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={(e) => void upload(key, e)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy || !url}
                  onClick={() => void saveSettings([{ key, value: "" }], "Using built-in")}
                >
                  Use built-in
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fonts</CardTitle>
          <CardDescription>Pick one font for headings and one for body text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="look-font-display">Headings font</Label>
              <select
                id="look-font-display"
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
                className={selectClass}
              >
                {FONT_CHOICES.map((f) => (
                  <option key={f} value={f} className="bg-[#0b0b0c]">
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="look-font-body">Body font</Label>
              <select
                id="look-font-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={selectClass}
              >
                {FONT_CHOICES.map((f) => (
                  <option key={f} value={f} className="bg-[#0b0b0c]">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-white/70">
            Preview loads after saving; until then your browser may show a fallback font.
          </p>
          <div className="space-y-1 rounded-md border border-white/10 p-4">
            <p className="text-2xl font-bold" style={{ fontFamily: `"${display}", sans-serif` }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p style={{ fontFamily: `"${body}", sans-serif` }}>
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
          <Button type="button" onClick={() => void saveFonts()} disabled={busy}>
            {busy ? "Saving..." : "Save fonts"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
          <CardDescription>One colour for every page, or leave each page its own shade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="look-bg-hex">Background colour (hex)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                aria-label="Background colour picker"
                value={bgPicker}
                onChange={(e) => setBg(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-md border border-white/15 bg-transparent p-1"
              />
              <Input
                id="look-bg-hex"
                value={bg}
                placeholder="#0b0b0c"
                onChange={(e) => setBg(e.target.value)}
                className="max-w-40 font-mono"
              />
            </div>
            <p className="text-sm text-white/70">
              {HEX.test(bg) ? "Custom colour." : "Empty means each page keeps its own shade."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void saveBackground()} disabled={busy}>
              {busy ? "Saving..." : "Save background"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void resetBackground()} disabled={busy}>
              Use per-page shades
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>
            Order and visibility of the pages in the menu and the page-turn buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {layout.map((entry, i) => {
              const isHome = entry.key === "home";
              const switchId = `look-page-${entry.key}`;
              return (
                <li
                  key={entry.key}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-white/10 p-3"
                >
                  <span className="min-w-24 flex-1 font-medium">
                    {t(`nav.${entry.key}`)}
                    {!entry.visible && (
                      <Badge variant="secondary" className="ml-2">
                        Hidden
                      </Badge>
                    )}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || isHome || i <= 1}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp aria-hidden="true" size={18} />
                    Move up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || isHome || i >= layout.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown aria-hidden="true" size={18} />
                    Move down
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={switchId}
                      checked={entry.visible}
                      disabled={busy || isHome}
                      onCheckedChange={(c) => setVisible(entry.key, c)}
                    />
                    <Label htmlFor={switchId}>Visible</Label>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button
            type="button"
            onClick={() => void saveSettings([{ key: "pages.layout", value: layout }], "Pages saved")}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save pages"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
