import {
  AppWindow,
  Bot,
  Brain,
  ChartLine,
  Code,
  Cpu,
  Globe,
  GraduationCap,
  MessageCircle,
  Palette,
  Rocket,
  Search,
  Sparkles,
  WandSparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Icons the owner can pick for list items. Keys are what gets stored. */
export const ICON_CHOICES: Record<string, LucideIcon> = {
  bot: Bot,
  workflow: Workflow,
  "app-window": AppWindow,
  "graduation-cap": GraduationCap,
  search: Search,
  sparkles: Sparkles,
  code: Code,
  rocket: Rocket,
  brain: Brain,
  "message-circle": MessageCircle,
  palette: Palette,
  "chart-line": ChartLine,
  globe: Globe,
  cpu: Cpu,
  "wand-sparkles": WandSparkles,
};

/** Icon for a stored name; unknown or empty names get Sparkles. */
export function iconFor(name: string): LucideIcon {
  return ICON_CHOICES[name] ?? Sparkles;
}
