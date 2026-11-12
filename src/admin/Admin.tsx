import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Login } from "./Login";
import { TextTab } from "./TextTab";
import { ListsTab } from "./ListsTab";
import { LookTab } from "./LookTab";
import { SettingsTab } from "./SettingsTab";
import { SetupTab } from "./SetupTab";

const wrapper = "dark fixed inset-0 overflow-y-auto bg-[#0b0b0c] text-white";
const container = "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10";

function NotConnected() {
  return (
    <div className={wrapper}>
      <div className={container}>
        <Card>
          <CardHeader>
            <CardTitle>Database not connected yet</CardTitle>
            <CardDescription>Follow these steps once, then reload this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-white/70">
              <li>Create a Supabase project at supabase.com.</li>
              <li>Open the SQL editor and run the file supabase/schema.sql.</li>
              <li>Add your email to the admins table (the last line of schema.sql does this).</li>
              <li>
                Put VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a file named .env.local in the
                project root.
              </li>
              <li>
                Restart <code className="font-mono">npm run dev</code>.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Dashboard({ client, session }: { client: SupabaseClient; session: Session }) {
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      const { error } = await client.auth.signOut();
      if (error) toast.error(error.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not sign out");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className={wrapper}>
      <div className={container}>
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight">X Dimension admin</h1>
            <p className="break-all text-sm text-white/70">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="/">View site</a>
            </Button>
            <Button type="button" variant="secondary" onClick={() => void signOut()} disabled={signingOut}>
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </header>

        <Tabs defaultValue="text">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="look">Images &amp; Look</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <TextTab client={client} />
          </TabsContent>
          <TabsContent value="lists" className="mt-4">
            <ListsTab client={client} />
          </TabsContent>
          <TabsContent value="look" className="mt-4">
            <LookTab client={client} />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <SettingsTab client={client} />
          </TabsContent>
          <TabsContent value="setup" className="mt-4">
            <SetupTab client={client} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Gate({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    client.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : "Could not read the session");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  if (!ready) {
    return (
      <div className={wrapper}>
        <div className={container}>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      <div className={wrapper}>
        <div className={container}>
          <Login client={client} />
        </div>
      </div>
    );
  }
  return <Dashboard client={client} session={session} />;
}

export function Admin() {
  if (!supabase) return <NotConnected />;
  return <Gate client={supabase} />;
}
