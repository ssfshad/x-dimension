// Adapted from RareUI "Magnetic Scatter Text" (MIT, https://rareui.in).
// Changes: letters are grouped by word so long titles still wrap on phones,
// screen readers get the plain sentence, and reduced-motion users get plain text.
import { Fragment, useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Same pseudo-random spread for a letter every time, so the scatter looks designed.
function spread(index: number) {
  const seed = index * 42;
  return { x: Math.sin(seed) * 100, y: Math.cos(seed) * 100, rotate: Math.sin(seed * 2) * 180 };
}

export function MagneticScatterText({ text, className }: { text: string; className?: string }) {
  const controls = useAnimation();
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!reduce) void controls.start(hovering ? "scatter" : "visible");
  }, [hovering, controls, reduce, text]);

  if (reduce) return <span className={className}>{text}</span>;

  let i = 0;
  const words = text.split(" ");

  return (
    <span
      className={cn("inline-block cursor-default select-none", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={`${word}-${w}`}>
            {w > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
            {word.split("").map((letter) => {
              const index = i++;
              const r = spread(index);
              return (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial="hidden"
                  animate={controls}
                  variants={{
                    hidden: { x: r.x * 5, y: r.y * 5, rotate: r.rotate, opacity: 0, scale: 0.5 },
                    visible: {
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                      transition: { type: "spring", damping: 12, stiffness: 80, mass: 0.8, delay: index * 0.02 },
                    },
                    scatter: {
                      x: r.x * 0.25,
                      y: r.y * 0.25,
                      rotate: r.rotate * 0.15,
                      scale: 1.05,
                      transition: { type: "spring", damping: 15, stiffness: 200 },
                    },
                  }}
                >
                  {letter}
                </motion.span>
              );
            })}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
