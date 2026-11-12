import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Values = {
  "whatsapp.number": string;
  "brand.accent": string;
  "flip.enabled": boolean;
  "flip.ms": number;
  "cursor.enabled": boolean;
};

function read(settings: Record<string, unknown>): Values {
  const ms = Number(settings["flip.ms"]);
  const accent = String(settings["brand.accent"] ?? "");
  return {
    "whatsapp.number": String(settings["whatsapp.number"] ?? ""),
    "brand.accent": /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#b0e0e6",
    "flip.enabled": settings["flip.enabled"] !== false,
    "flip.ms": Number.isFinite(ms) ? ms : 900,
    "cursor.enabled": settings["cursor.enabled"] !== false,
  };
}

export function SettingsTab({ client }: { client: SupabaseClient }) {
  const { store, reload } = useI18n();
  const saved = read(store.settings);
  const [draft, setDraft] = useState<Values>(saved);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    const ms = draft["flip.ms"];
    if (!Number.isFinite(ms) || ms < 300 || ms > 2000) {
      toast.error("Flip speed must be between 300 and 2000.");
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(draft["brand.accent"])) {
      toast.error("Accent colour must look like #b0e0e6.");
      return;
    }
    const keys = Object.keys(draft) as (keyof Values)[];
    const changed = keys.filter((k) => draft[k] !== saved[k]);
    if (changed.length === 0) {
      toast.message("Nothing changed.");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const { error } = await client
        .from("settings")
        .upsert(changed.map((key) => ({ key, value: draft[key], updated_at: now })));
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Saved ${changed.length} setting${changed.length === 1 ? "" : "s"}`);
      await reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Site-wide options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="set-whatsapp">WhatsApp number</Label>
          <Input
            id="set-whatsapp"
            inputMode="numeric"
            value={draft["whatsapp.number"]}
            onChange={(e) => set("whatsapp.number", e.target.value.replace(/\D/g, ""))}
          />
          <p className="text-sm text-white/70">Example: 8801410336636</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="set-accent">Accent colour</Label>
          <div className="flex items-center gap-3">
            <input
              id="set-accent"
              type="color"
              value={draft["brand.accent"]}
              onChange={(e) => set("brand.accent", e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-md border border-white/15 bg-transparent p-1"
            />
            <Input
              aria-label="Accent colour hex"
              value={draft["brand.accent"]}
              onChange={(e) => set("brand.accent", e.target.value)}
              className="max-w-40 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="set-flip"
            checked={draft["flip.enabled"]}
            onCheckedChange={(c) => set("flip.enabled", c)}
          />
          <Label htmlFor="set-flip">Page-flip animation</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="set-flip-ms">Flip speed in milliseconds</Label>
          <Input
            id="set-flip-ms"
            type="number"
            min={300}
            max={2000}
            step={50}
            className="max-w-40"
            value={Number.isFinite(draft["flip.ms"]) ? draft["flip.ms"] : ""}
            onChange={(e) => set("flip.ms", e.target.value === "" ? NaN : Number(e.target.value))}
          />
          <p className="text-sm text-white/70">Between 300 and 2000.</p>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="set-cursor"
            checked={draft["cursor.enabled"]}
            onCheckedChange={(c) => set("cursor.enabled", c)}
          />
          <Label htmlFor="set-cursor">Liquid cursor</Label>
        </div>

        <Button type="button" onClick={() => void save()} disabled={busy}>
          {busy ? "Saving..." : "Save settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
