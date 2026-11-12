// The pages of the "book", in reading order. Order decides flip direction.
export const PAGES = [
  { path: "/", key: "home", tone: "#0b0b0c" },
  { path: "/services", key: "services", tone: "#0a0c0e" },
  { path: "/work", key: "work", tone: "#0d0b0c" },
  { path: "/learn", key: "learn", tone: "#0a0d0c" },
  { path: "/about", key: "about", tone: "#0c0b0f" },
  { path: "/contact", key: "contact", tone: "#0b0c0d" },
] as const;

export type PageKey = (typeof PAGES)[number]["key"];

export const pageIndex = (pathname: string) => PAGES.findIndex((p) => p.path === pathname);
