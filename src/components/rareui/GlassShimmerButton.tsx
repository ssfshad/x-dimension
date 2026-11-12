// Adapted from RareUI "Glass Shimmer Button" (MIT, https://rareui.in).
// Changes: renders a router link, dark-only glass styling, and the shimmer
// runs on hover/focus only (no endless motion), skipped for reduced motion.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function GlassShimmerLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "glass-shimmer group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full",
        "border border-white/15 bg-white/[0.04] px-7 text-base font-medium text-white backdrop-blur-md",
        "transition-[transform,background-color,border-color] duration-150 hover:border-white/30 hover:bg-white/[0.08] active:scale-[0.97]",
        className,
      )}
    >
      <span aria-hidden="true" className="glass-shimmer__shine" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent opacity-60"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-40"
      />
      <span className="relative z-10 tracking-wide">{children}</span>
    </Link>
  );
}
