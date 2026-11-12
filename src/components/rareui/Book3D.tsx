// Adapted from RareUI "Book 3D" (MIT, https://rareui.in).
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageData {
  title?: string;
  content?: string;
  image?: string;
  caption?: string;
  quote?: string;
  author?: string;
}

interface Book3DProps {
  /** Optional cover image. Without it the dark default cover with title/subtitle is shown. */
  src?: string;
  title?: string;
  subtitle?: string;
  /** Accessible name for the whole book . */
  label: string;
  /** Accessible name of the "previous page" button shown with reduced motion. */
  backLabel?: string;
  width?: number;
  height?: number;
  className?: string;
  pages: PageData[];
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function Book3D({
  src,
  title,
  subtitle,
  label,
  backLabel,
  width = 230,
  height = 350,
  className,
  pages,
}: Book3DProps) {
  const reduced = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0); // 0 = cover open, no pages flipped
  const lastFlip = useRef(0);
  const lastPointer = useRef<string>("mouse");

  // Reset pages when the book closes.
  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => setPageIndex(0), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const canFlip = () => {
    const now = Date.now();
    if (now - lastFlip.current < 300) return false;
    lastFlip.current = now;
    return true;
  };

  const handlePageClick = (index: number) => {
    if (!isOpen || pageIndex !== index || !canFlip()) return;
    setPageIndex((prev) => prev + 1);
  };

  const handleBackClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    if (!canFlip()) return;
    setPageIndex(index);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    lastPointer.current = e.pointerType;
  };
  const onPointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") setIsOpen(true);
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") setIsOpen(false);
  };
  // Mouse users open by hovering; a click only toggles for touch and pen.
  const onClick = () => {
    if (lastPointer.current === "mouse") return;
    setIsOpen((prev) => !prev);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const ordered = pages.map((page, index) => ({ page, index })).reverse();

  // On small screens the book is scaled down; the vertical margin removes the empty layout space.
  const outerStyle = { "--bk-h": `${height}px` } as CSSProperties;

  return (
    <div
      className="flex w-full max-w-full justify-center overflow-visible"
      style={outerStyle}
    >
      <div className="my-[calc(var(--bk-h)*-0.15)] origin-center scale-[0.7] sm:my-0 sm:scale-100">
        <div
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-expanded={isOpen}
          className={cn(
            "group relative z-10 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-powder",
            className,
            isOpen && "z-50"
          )}
          style={{
            perspective: "1500px",
            paddingLeft: "150px", // Extra space for the rotated cover on the left
            marginLeft: "-150px", // Pull back to maintain visual position
          }}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          <motion.div
            className="relative"
            style={{ width, height, transformStyle: "preserve-3d" }}
            animate={{
              rotateY: !reduced && isOpen ? -35 : 0,
              rotateX: !reduced && isOpen ? 15 : 0,
              z: !reduced && isOpen ? 60 : 0,
              // Keeps the opened book (spine at the middle) centred in its container.
              x: !reduced && isOpen ? width / 2 : 0,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Back cover */}
            <div
              className="absolute inset-0 rounded-l-sm rounded-r-md bg-[#2f2f2f]"
              style={{
                transform: "translateZ(-20px)",
                boxShadow: "20px 20px 50px rgba(0,0,0,0.5)",
              }}
            />

            {/* Pages stack */}
            {ordered.map(({ page, index }) => {
              const isFlipped = index < pageIndex;
              const zIndex = isFlipped ? index + 1 : 20 - index;
              const hidden = reduced && (!isOpen || isFlipped);
              return (
                <motion.div
                  key={index}
                  className="absolute inset-y-[2px] right-[2px] left-[4px] origin-left cursor-pointer rounded-l-sm rounded-r-md border border-neutral-100/50 bg-[#fffcf5]"
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex,
                    pointerEvents: hidden ? "none" : undefined,
                  }}
                  animate={
                    reduced
                      ? { opacity: hidden ? 0 : 1 }
                      : {
                          rotateY: isFlipped ? -178 : 0,
                          z: isFlipped ? 0 : pages.length - 1 - index,
                        }
                  }
                  transition={
                    reduced
                      ? { duration: 0.2 }
                      : {
                          duration: 0.6,
                          ease: EASE,
                          delay: isFlipped ? 0 : index * 0.05,
                        }
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFlipped) handleBackClick(e, index);
                    else handlePageClick(index);
                  }}
                >
                  {/* Front face (right-hand page) */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-white p-6 text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Right edge shadow for the book crease */}
                    <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-linear-to-l from-black/20 via-black/5 to-transparent" />
                    {/* Left edge for binding */}
                    <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-2 bg-linear-to-r from-black/10 to-transparent" />

                    <div className="relative z-10 text-neutral-800 select-none">
                      {page.image && (
                        <figure className="mb-4 overflow-hidden rounded-sm border border-neutral-200 shadow-inner">
                          <img
                            src={page.image}
                            alt={page.caption ?? ""}
                            className="h-32 w-full object-cover"
                          />
                        </figure>
                      )}
                      {page.title && (
                        <h3 className="mb-2 font-display text-sm font-bold tracking-widest uppercase">
                          {page.title}
                        </h3>
                      )}
                      {page.content && (
                        <p className="text-xs leading-relaxed text-neutral-600">{page.content}</p>
                      )}
                      {page.quote && (
                        <blockquote className="border-l-2 border-neutral-300 pl-3 text-sm text-neutral-600 italic">
                          {page.quote}
                          {page.author && (
                            <footer className="mt-2 text-xs text-neutral-500 not-italic">
                              {page.author}
                            </footer>
                          )}
                        </blockquote>
                      )}
                      <span className="absolute right-0 -bottom-4 text-[10px] text-neutral-500">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Back face (left-hand page once flipped) */}
                  <div
                    className="absolute inset-0 bg-[#f8f5f0]"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                  >
                    <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-12 bg-linear-to-r from-black/20 via-black/5 to-transparent" />
                  </div>
                </motion.div>
              );
            })}

            {/* Front cover */}
            <motion.div
              className={cn(
                "absolute inset-0 origin-left",
                isOpen ? "pointer-events-none z-0" : "pointer-events-auto z-50"
              )}
              style={{ transformStyle: "preserve-3d" }}
              initial={{ rotateY: 0, z: 10 }}
              animate={
                reduced
                  ? { opacity: isOpen ? 0 : 1, rotateY: 0, z: 10 }
                  : { rotateY: isOpen ? -180 : 0, z: isOpen ? 0 : 10, opacity: 1 }
              }
              transition={
                reduced
                  ? { duration: 0.2 }
                  : { duration: 0.8, ease: EASE, delay: isOpen ? 0 : 0.5 }
              }
            >
              {/* Outer cover */}
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden rounded-l-sm rounded-r-md border-l border-white/10 shadow-md",
                  src ? "bg-neutral-900" : "bg-[#141416]"
                )}
                style={{
                  backgroundImage: src ? `url(${src})` : undefined,
                  backgroundSize: src ? "cover" : undefined,
                  backgroundPosition: src ? "center" : undefined,
                  backfaceVisibility: "hidden",
                }}
              >
                {src && (
                  <>
                    <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40" />
                  </>
                )}

                {/* Decorative frame */}
                <div className="pointer-events-none absolute inset-4 rounded-sm border border-white/20" />
                <div className="pointer-events-none absolute inset-6 rounded-sm border border-white/10" />

                {(title || subtitle) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-10 text-center text-white select-none">
                    <div className="mb-5 h-px w-16 bg-powder" />
                    {title && (
                      <h3 className="font-display text-2xl leading-tight font-bold tracking-tight">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="mt-4 text-xs tracking-widest text-white/70 uppercase">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Inner cover */}
              <div
                className="absolute inset-0 overflow-hidden rounded-l-md rounded-r-sm border-r border-neutral-200 bg-[#f5f1e8]"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              />
            </motion.div>
          </motion.div>

          {/* Reduced motion: flipped pages are invisible, so offer a way back. */}
          {reduced && isOpen && pageIndex > 0 && (
            <button
              type="button"
              aria-label={backLabel ?? label}
              className="absolute bottom-1 left-[150px] z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-powder text-black active:scale-[0.97]"
              onClick={(e) => handleBackClick(e, pageIndex - 1)}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}

          {/* Shadow */}
          <div
            className={cn(
              "pointer-events-none absolute right-4 bottom-0 left-[166px] h-10 rounded-[100%] bg-black/40 blur-xl transition-all duration-500",
              isOpen ? "scale-110 opacity-80" : "opacity-40"
            )}
            style={{ transform: "perspective(1000px) rotateX(60deg) translateZ(-60px)" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Book3D;
