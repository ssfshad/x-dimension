import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Book } from "@/components/Book";
import { FluidCursor } from "@/components/FluidCursor";
import { Nav } from "@/components/Nav";
import { PageCorners } from "@/components/PageCorners";
import { Seo } from "@/components/Seo";
import { ThemeFonts } from "@/components/ThemeFonts";
import type { PageKey } from "@/content/pages";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { useSitePages } from "@/lib/useSitePages";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Home } from "@/pages/Home";
import { Learn } from "@/pages/Learn";
import { NotFound } from "@/pages/NotFound";
import { Services } from "@/pages/Services";
import { Work } from "@/pages/Work";

// The admin panel loads only when someone opens /admin, so visitors never download it.
const Admin = lazy(() => import("@/admin/Admin").then((m) => ({ default: m.Admin })));

function Site() {
  const { setting } = useI18n();
  const pages = useSitePages();
  // A page the owner has hidden answers like any unknown address. Home is never hidden.
  const gate = (key: PageKey, element: ReactNode) =>
    pages.some((p) => p.key === key) ? element : <NotFound />;
  return (
    <>
      <Book
        renderPage={(location) => (
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={gate("services", <Services />)} />
            <Route path="/work" element={gate("work", <Work />)} />
            <Route path="/learn" element={gate("learn", <Learn />)} />
            <Route path="/about" element={gate("about", <About />)} />
            <Route path="/contact" element={gate("contact", <Contact />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      />
      <Nav />
      <PageCorners />
      {setting("cursor.enabled", true) && (
        <FluidCursor color={String(setting("brand.accent", "#b0e0e6"))} />
      )}
    </>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <>
      <ThemeFonts />
      <Seo />
      {isAdmin ? (
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      ) : (
        <Site />
      )}
      <Toaster theme="dark" />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
