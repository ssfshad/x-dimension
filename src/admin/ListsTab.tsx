import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ICON_CHOICES, iconFor } from "@/lib/icons";
import { defaultItems, type Item, type Loc } from "@/content/defaults";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const COLLECTIONS = ["services", "projects", "courses"] as const;
type Collection = (typeof COLLECTIONS)[number];

function isLoc(v: unknown): v is Loc {
  return typeof v === "object" && v !== null && ("en" in v || "bn" in v);
}

function locOf(v: unknown): Loc {
  const o = (v ?? {}) as Partial<Loc>;
  return { en: String(o.en ?? ""), bn: String(o.bn ?? "") };
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

function row(collection: string, it: Item) {
  return {
    id: it.id,
    collection,
    sort: it.sort,
    visible: it.visible,
    data: it.data,
    updated_at: new Date().toISOString(),
  };
}

function LocField(props: {
  multiline: boolean;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (props.multiline) {
    return (
      <Textarea
        id={props.id}
        rows={3}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  }
  return <Input id={props.id} value={props.value} onChange={(e) => props.onChange(e.target.value)} />;
}

type CardProps = {
  client: SupabaseClient;
  collection: Collection;
  item: Item;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onSave: (item: Item) => Promise<void>;
  onMove: (dir: -1 | 1) => Promise<void>;
  onDelete: () => Promise<void>;
};

function ItemCard({ client, collection, item, isFirst, isLast, busy, onSave, onMove, onDelete }: CardProps) {
  const [data, setData] = useState<Record<string, unknown>>(item.data);
  const [visible, setVisible] = useState(item.visible);
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function setField(key: string, value: unknown) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function upload(key: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(key);
    try {
      const ext = file.name.includes(".") ? (file.name.split(".").pop() ?? "png") : "png";
      const path = `${collection}/${item.id}-${Date.now()}.${ext.toLowerCase()}`;
      const { error } = await client.storage.from("media").upload(path, file, { upsert: true });
      if (error) {
        toast.error(error.message);
        return;
      }
      setField(key, client.storage.from("media").getPublicUrl(path).data.publicUrl);
      toast.success("Image uploaded. Click Save to keep it.");
    } catch (err: unknown) {
      toast.error(message(err));
    } finally {
      setUploading(null);
    }
  }

  function askDelete() {
    if (!confirming) {
      setConfirming(true);
      timer.current = window.setTimeout(() => setConfirming(false), 4000);
      return;
    }
    if (timer.current !== null) window.clearTimeout(timer.current);
    setConfirming(false);
    void onDelete();
  }

  const fid = (k: string, suffix = "") => `${item.id}-${k}${suffix}`;
  const title = isLoc(item.data.title) ? locOf(item.data.title).en : isLoc(item.data.name) ? locOf(item.data.name).en : item.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>{title || item.id}</span>
          {!item.visible && <Badge variant="secondary">Hidden</Badge>}
        </CardTitle>
        <p className="break-all font-mono text-xs text-white/50">{item.id}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(data).map((key) => {
          const value = data[key];
          if (isLoc(value)) {
            const loc = locOf(value);
            return (
              <div key={key} className="space-y-2">
                <p className="text-sm font-medium capitalize">{key}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={fid(key, "-en")}>{key} (English)</Label>
                    <LocField
                      multiline={key === "blurb"}
                      id={fid(key, "-en")}
                      value={loc.en}
                      onChange={(v) => setField(key, { ...loc, en: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={fid(key, "-bn")}>{key} (Banglish)</Label>
                    <LocField
                      multiline={key === "blurb"}
                      id={fid(key, "-bn")}
                      value={loc.bn}
                      onChange={(v) => setField(key, { ...loc, bn: v })}
                    />
                  </div>
                </div>
              </div>
            );
          }
          if (typeof value === "boolean") {
            return (
              <div key={key} className="flex items-center gap-3">
                <Switch
                  id={fid(key)}
                  checked={value}
                  onCheckedChange={(c) => setField(key, c)}
                />
                <Label htmlFor={fid(key)} className="capitalize">
                  {key}
                </Label>
              </div>
            );
          }
          const text = typeof value === "string" ? value : value == null ? "" : String(value);
          if (key === "icon") {
            const Icon = iconFor(text);
            const known = text in ICON_CHOICES;
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={fid(key)} className="capitalize">
                  {key}
                </Label>
                <div className="flex items-center gap-3">
                  <select
                    id={fid(key)}
                    value={text}
                    onChange={(e) => setField(key, e.target.value)}
                    className="h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-white sm:w-64"
                  >
                    {!known && (
                      <option value={text} className="bg-[#0b0b0c]">
                        {text || "(none)"}
                      </option>
                    )}
                    {Object.keys(ICON_CHOICES).map((name) => (
                      <option key={name} value={name} className="bg-[#0b0b0c]">
                        {name}
                      </option>
                    ))}
                  </select>
                  <Icon size={24} aria-hidden="true" className="shrink-0 text-powder" />
                </div>
              </div>
            );
          }
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fid(key)} className="capitalize">
                {key}
              </Label>
              <Input id={fid(key)} value={text} onChange={(e) => setField(key, e.target.value)} />
              {key === "image" && (
                <div className="space-y-2">
                  <Label htmlFor={fid(key, "-file")}>Upload image</Label>
                  <Input
                    id={fid(key, "-file")}
                    type="file"
                    accept="image/*"
                    disabled={uploading === key}
                    onChange={(e) => void upload(key, e)}
                  />
                  {uploading === key && <p className="text-sm text-white/70">Uploading...</p>}
                  {text && (
                    <img
                      src={text}
                      alt="Preview"
                      className="h-24 w-auto max-w-full rounded-md border border-white/10 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-3">
          <Switch id={fid("visible")} checked={visible} onCheckedChange={setVisible} />
          <Label htmlFor={fid("visible")}>Visible</Label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void onSave({ ...item, data, visible })} disabled={busy}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void onMove(-1)}
            disabled={busy || isFirst}
          >
            <ArrowUp aria-hidden="true" size={18} />
            Move up
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void onMove(1)}
            disabled={busy || isLast}
          >
            <ArrowDown aria-hidden="true" size={18} />
            Move down
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={askDelete} disabled={busy}>
            <Trash2 aria-hidden="true" size={18} />
            {confirming ? "Click again to delete" : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListsTab({ client }: { client: SupabaseClient }) {
  const { store, reload } = useI18n();
  const [collection, setCollection] = useState<Collection>("services");
  const [busy, setBusy] = useState(false);

  const items = [...(store.items[collection] ?? [])].sort((a, b) => a.sort - b.sort);

  /** The public site switches to the database list once it has rows, so copy the defaults in first. */
  async function seedIfEmpty() {
    const { count, error } = await client
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("collection", collection);
    if (error) throw error;
    if ((count ?? 0) === 0 && items.length > 0) {
      const { error: e2 } = await client.from("items").upsert(items.map((it) => row(collection, it)));
      if (e2) throw e2;
    }
  }

  async function run(label: string, work: () => Promise<void>) {
    setBusy(true);
    try {
      await seedIfEmpty();
      await work();
      toast.success(label);
      await reload();
    } catch (e: unknown) {
      toast.error(message(e));
    } finally {
      setBusy(false);
    }
  }

  function save(item: Item) {
    return run("Saved", async () => {
      const { error } = await client.from("items").upsert(row(collection, item));
      if (error) throw error;
    });
  }

  function move(index: number, dir: -1 | 1) {
    const a = items[index];
    const b = items[index + dir];
    if (!a || !b) return Promise.resolve();
    return run("Moved", async () => {
      const { error } = await client
        .from("items")
        .upsert([row(collection, { ...a, sort: b.sort }), row(collection, { ...b, sort: a.sort })]);
      if (error) throw error;
    });
  }

  function remove(item: Item) {
    return run("Deleted", async () => {
      const { error } = await client.from("items").delete().eq("id", item.id);
      if (error) throw error;
    });
  }

  function add() {
    return run("Item added", async () => {
      const template = defaultItems[collection]?.[0]?.data ?? {};
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(template)) {
        data[k] = isLoc(v) ? { en: "", bn: "" } : typeof v === "boolean" ? false : "";
      }
      const sort = items.reduce((m, it) => Math.max(m, it.sort), 0) + 1;
      const fresh: Item = { id: `${collection}-${Date.now()}`, sort, visible: true, data };
      const { error } = await client.from("items").upsert(row(collection, fresh));
      if (error) throw error;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lists-collection">List</Label>
        <select
          id="lists-collection"
          value={collection}
          onChange={(e) => setCollection(e.target.value as Collection)}
          className="h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-white sm:w-64"
        >
          {COLLECTIONS.map((c) => (
            <option key={c} value={c} className="bg-[#0b0b0c]">
              {c}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 && <p className="text-white/70">This list is empty.</p>}

      {items.map((it, i) => (
        <ItemCard
          key={`${collection}-${it.id}`}
          client={client}
          collection={collection}
          item={it}
          isFirst={i === 0}
          isLast={i === items.length - 1}
          busy={busy}
          onSave={save}
          onMove={(dir) => move(i, dir)}
          onDelete={() => remove(it)}
        />
      ))}

      <Button type="button" onClick={() => void add()} disabled={busy}>
        <Plus aria-hidden="true" size={18} />
        Add item
      </Button>
    </div>
  );
}
