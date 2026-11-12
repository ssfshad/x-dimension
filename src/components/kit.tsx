import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useWhatsappUrl } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Root of every page: clears the fixed nav and the corner buttons. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl px-5 pb-32 pt-28 sm:px-10 sm:pt-32", className)}>
      {children}
    </main>
  );
}

/** Entrance animation: a short rise and fade. Stagger siblings with `delay` (seconds). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Small uppercase label above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-display text-sm uppercase tracking-[0.3em] text-powder", className)}>
      {children}
    </p>
  );
}

/** The main call to action everywhere: opens a WhatsApp chat. */
export function WhatsAppButton({
  children,
  message,
  className,
}: {
  children: ReactNode;
  /** Optional text pre-filled in the chat. */
  message?: string;
  className?: string;
}) {
  const base = useWhatsappUrl();
  const href = message ? `${base}?text=${encodeURIComponent(message)}` : base;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-powder px-6 text-base font-medium text-black transition-transform duration-150 active:scale-[0.97]",
        className,
      )}
    >
      <MessageCircle size={18} aria-hidden="true" />
      {children}
    </a>
  );
}

/** Standard card surface. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-150 hover:border-white/25",
        className,
      )}
    >
      {children}
    </div>
  );
}
