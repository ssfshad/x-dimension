import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import type { Loc } from "@/content/defaults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PAGE = 60;

function groupOf(key: string): string {
  const i = key.indexOf(".");
  return i === -1 ? key : key.slice(0, i);
}

function TextRow({ client, k, value }: { client: SupabaseClient; k: string; value: Loc }) {
  const { reload } = useI18n();
  const [en, setEn] = useState(value.en);
  const [bn, setBn] = useState(value.bn);
  const [busy, setBusy] = useState(false);
  const changed = en !== value.en || bn !== value.bn;

  async function save() {
    setBusy(true);
    try {
      const { error } = await client
        .from("strings")
        .upsert({ key: k, en, bn, updated_at: new Date().toISOString() });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Saved ${k}`);
      await reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="break-all font-mono text-xs text-white/50">{k}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${k}-en`}>English</Label>
            <Textarea id={`${k}-en`} rows={2} value={en} onChange={(e) => setEn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${k}-bn`}>Banglish</Label>
            <Textarea id={`${k}-bn`} rows={2} value={bn} onChange={(e) => setBn(e.target.value)} />
          </div>
        </div>
        <Button type="button" size="sm" onClick={() => void save()} disabled={!changed || busy}>
          {busy ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function TextTab({ client }: { client: SupabaseClient }) {
  const { store } = useI18n();
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const keys = useMemo(() => Object.keys(store.strings).sort(), [store.strings]);
  const groups = useMemo(() => Array.from(new Set(keys.map(groupOf))), [keys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return keys.filter((k) => {
      if (group !== "all" && groupOf(k) !== group) return false;
      if (!q) return true;
      const v = store.strings[k];
      return (
        k.toLowerCase().includes(q) ||
        v.en.toLowerCase().includes(q) ||
        v.bn.toLowerCase().includes(q)
      );
    });
  }, [keys, group, query, store.strings]);

  const shown = filtered.slice(0, limit);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="text-group">Group</Label>
          <select
            id="text-group"
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setLimit(PAGE);
            }}
            className="h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-white"
          >
            <option value="all" className="bg-[#0b0b0c]">
              All groups
            </option>
            {groups.map((g) => (
              <option key={g} value={g} className="bg-[#0b0b0c]">
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="text-search">Search</Label>
          <Input
            id="text-search"
            type="search"
            placeholder="Search by key or text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
          />
        </div>
      </div>

      <p className="text-sm text-white/70">
        Showing {shown.length} of {filtered.length} texts.
      </p>

      {shown.map((k) => (
        <TextRow key={k} client={client} k={k} value={store.strings[k]} />
      ))}

      {filtered.length === 0 && <p className="text-white/70">Nothing matches.</p>}

      {filtered.length > shown.length && (
        <Button type="button" variant="outline" onClick={() => setLimit((n) => n + PAGE)}>
          Show more
        </Button>
      )}
    </div>
  );
}
