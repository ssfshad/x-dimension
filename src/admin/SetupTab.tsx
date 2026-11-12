import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { defaultItems, defaultSettings } from "@/content/defaults";
import { strings as defaultStrings } from "@/content/strings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Counts = { strings: number; items: number; settings: number };
const TABLES = ["strings", "items", "settings"] as const;

export function SetupTab({ client }: { client: SupabaseClient }) {
  const { reload } = useI18n();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next: Counts = { strings: 0, items: 0, settings: 0 };
      for (const t of TABLES) {
        const { count, error } = await client.from(t).select("*", { count: "exact", head: true });
        if (error) throw error;
        next[t] = count ?? 0;
      }
      setCounts(next);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not count rows");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function load() {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const stringRows = Object.entries(defaultStrings).map(([key, v]) => ({
        key,
        en: v.en,
        bn: v.bn,
        updated_at: now,
      }));
      const itemRows = Object.entries(defaultItems).flatMap(([collection, list]) =>
        list.map((it) => ({
          id: it.id,
          collection,
          sort: it.sort,
          visible: it.visible,
          data: it.data,
          updated_at: now,
        })),
      );
      const settingRows = Object.entries(defaultSettings).map(([key, value]) => ({
        key,
        value,
        updated_at: now,
      }));

      const a = await client
        .from("strings")
        .upsert(stringRows, { onConflict: "key", ignoreDuplicates: true });
      if (a.error) throw a.error;
      const b = await client
        .from("items")
        .upsert(itemRows, { onConflict: "id", ignoreDuplicates: true });
      if (b.error) throw b.error;
      const c = await client
        .from("settings")
        .upsert(settingRows, { onConflict: "key", ignoreDuplicates: true });
      if (c.error) throw c.error;

      toast.success(
        `Loaded ${stringRows.length} texts, ${itemRows.length} list items and ${settingRows.length} settings (existing rows kept).`,
      );
      await reload();
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load content");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Load starting content</CardTitle>
        <CardDescription>
          Copies the built-in default text, lists and settings into the database so you can edit
          them. It never overwrites rows that already exist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" onClick={() => void load()} disabled={busy}>
          {busy ? "Loading..." : "Load starting content"}
        </Button>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium">Rows in the database</p>
          <ul className="text-white/70">
            <li>Texts: {counts ? counts.strings : "..."}</li>
            <li>List items: {counts ? counts.items : "..."}</li>
            <li>Settings: {counts ? counts.settings : "..."}</li>
          </ul>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
