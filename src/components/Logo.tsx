import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  accent?: string;
  withWordmark?: boolean;
  className?: string;
};

/** Official X Dimension logo: "xD" inside a cube outline. */
export function Logo({ size = 40, accent = "#B0E0E6", withWordmark = false, className }: LogoProps) {
  const { setting } = useI18n();
  const custom = setting<unknown>("asset.logo", "");
  const logoUrl = typeof custom === "string" ? custom : "";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="X Dimension"
          width={size}
          height={size}
          className="shrink-0 object-contain"
          style={{ width: size, height: size }}
        />
      ) : (
      <span
        role="img"
        aria-label="X Dimension"
        className="relative inline-block shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          fill="none"
          className="absolute inset-0 h-full w-full"
        >
          <polygon
            points="100,12 176.2,56 176.2,144 100,188 23.8,144 23.8,56"
            stroke="currentColor"
            strokeWidth={size < 48 ? 11 : 7}
            strokeLinejoin="round"
          />
        </svg>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-display font-bold leading-none"
          style={{ fontSize: size * 0.38, letterSpacing: "-0.06em" }}
        >
          x<span style={{ color: accent }}>D</span>
        </span>
      </span>
      )}
      {withWordmark && (
        <span className="whitespace-nowrap font-display text-xl font-semibold tracking-tight">X Dimension</span>
      )}
    </span>
  );
}
