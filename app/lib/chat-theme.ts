import type { CSSProperties } from "react";

export const chatTheme = {
  "--background": "oklch(0.09 0.008 60)",
  "--foreground": "oklch(0.92 0.018 70)",
  "--card": "oklch(0.13 0.008 60)",
  "--card-foreground": "oklch(0.92 0.018 70)",
  "--popover": "oklch(0.13 0.008 60)",
  "--popover-foreground": "oklch(0.92 0.018 70)",
  "--primary": "oklch(0.73 0.11 70)",
  "--primary-foreground": "oklch(0.08 0 0)",
  "--secondary": "oklch(0.15 0.006 60)",
  "--secondary-foreground": "oklch(0.88 0.015 70)",
  "--muted": "oklch(0.15 0.006 60)",
  "--muted-foreground": "oklch(0.45 0.015 68)",
  "--accent": "oklch(0.18 0.007 60)",
  "--accent-foreground": "oklch(0.92 0.018 70)",
  "--border": "oklch(1 0 0 / 0.06)",
  "--input": "oklch(1 0 0 / 0.08)",
  "--ring": "oklch(0.73 0.11 70)",
  "--radius": "0.75rem",
  background: "oklch(0.09 0.008 60)",
  color: "oklch(0.92 0.018 70)",
  fontFamily: "'Geist Variable', sans-serif",
} as CSSProperties;

export const gradients = [
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-sky-500",
];
