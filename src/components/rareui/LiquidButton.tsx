// Adapted from RareUI "Liquid Button" (MIT, https://rareui.in).
// Changes: renders a link (for WhatsApp), uses the site's powder accent,
// a unique filter id per button, and no drips for people who prefer less motion.
import { useId, useRef, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

const DROPS = [
  { left: "10%", size: "size-3 md:size-4", delay: 0.1, duration: 2.1 },
  { left: "20%", size: "size-4 md:size-5", delay: 0, duration: 2 },
  { left: "30%", size: "size-2 md:size-3", delay: 0.6, duration: 2.5 },
  { left: "40%", size: "size-5 md:size-6", delay: 0.8, duration: 2.4 },
  { left: "50%", size: "size-3 md:size-4", delay: 0.4, duration: 1.8 },
  { left: "55%", size: "size-2 md:size-3", delay: 1.5, duration: 2.7 },
  { left: "65%", size: "size-6 md:size-7", delay: 1.2, duration: 2.6 },
  { left: "75%", size: "size-3 md:size-4", delay: 0.9, duration: 2.3 },
  { left: "80%", size: "size-4 md:size-5", delay: 0.2, duration: 2.2 },
  { left: "90%", size: "size-3 md:size-4", delay: 0.5, duration: 2.8 },
];

export function LiquidButton({
  href,
  children,
  className,
  backgroundColor = "bg-powder",
  textColor = "text-black",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const filterId = `goo-${useId().replace(/:/g, "")}`;
  const mouseX = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });

  const onMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
  };

  return (
    <div
      ref={ref}
      className={cn("relative inline-block p-4", className)}
      onMouseMove={onMove}
      onMouseLeave={() => mouseX.set(0)}
    >
      <svg className="absolute size-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <motion.div
        className="relative z-10 inline-block"
        style={{ filter: `url(#${filterId})` }}
        whileHover="hover"
        initial="initial"
      >
        <motion.a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "relative z-20 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white",
            backgroundColor,
            textColor,
          )}
          variants={{ hover: { scale: 1.02 }, initial: { scale: 1 } }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {children}
        </motion.a>

        {!reduce &&
          DROPS.map((d) => (
            <Drop key={d.left} {...d} mouseX={springX} backgroundColor={backgroundColor} />
          ))}
      </motion.div>
    </div>
  );
}

function Drop({
  left,
  size,
  delay,
  duration,
  mouseX,
  backgroundColor,
}: {
  left: string;
  size: string;
  delay: number;
  duration: number;
  mouseX: MotionValue<number>;
  backgroundColor: string;
}) {
  const factor = duration * 10;
  const x = useTransform(mouseX, [-200, 200], [-factor, factor]);
  return (
    <motion.div
      aria-hidden="true"
      className={cn("absolute bottom-4 -z-10 rounded-full will-change-transform", size, backgroundColor)}
      style={{ left, x }}
      variants={{
        initial: { y: 0, scale: 1, opacity: 1 },
        hover: {
          y: [0, 20, 140],
          scale: [1, 1.1, 0],
          opacity: 1,
          transition: {
            duration,
            repeat: Infinity,
            ease: ["easeIn", "easeIn"],
            times: [0, 0.3, 1],
            delay,
          },
        },
      }}
    />
  );
}
