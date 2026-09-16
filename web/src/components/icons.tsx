// The app's icon surface.
//
// Every icon used anywhere is re-exported from here, so `grep lucide-react
// web/src` returns exactly one hit and a barrel import can't quietly pull the
// whole set into the bundle.
//
// A re-export rather than an <Icon name="…" /> wrapper on purpose: a
// name->component map holds a reference to every icon it can name, which
// defeats tree-shaking. Named imports let Vite drop what nothing uses.
//
// Sizes come from the three presets below rather than per-call-site numbers.
// lucide draws on the same 24-unit viewBox with the same round caps as the
// hand-drawn ThemeToggle icons, and strokeWidth is in viewBox units, so
// `size={15} strokeWidth={1.75}` renders a stroke identical to theirs. Do not
// pass `absoluteStrokeWidth` — that is what would break the match.
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  ExternalLink,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";

export {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  ExternalLink,
  Plus,
  TriangleAlert,
  X,
};

// Arrows mean direction of data — sorting, navigation, a value moving from one
// state to another. Chevrons mean expand/collapse. The glyphs these replaced
// used ▲/▼ for both, which is why a sortable column header and a disclosure
// header used to look like the same control when they aren't.
//
// ArrowUpDown is the neutral member of the sort family: this column sorts, but
// it isn't the one sorting right now. It exists because a column that shows a
// single arrow while inactive is claiming a direction it won't deliver.

type IconPreset = {
  readonly size: number;
  readonly strokeWidth: number;
  readonly "aria-hidden": true;
};

/** 13px — sort arrows, pills, anything inline with 10–11px text. */
export const iconSm: IconPreset = {
  size: 13,
  strokeWidth: 1.75,
  "aria-hidden": true,
};

/** 15px — the default. Buttons, nav rows, inline with 13–14px text. */
export const icon: IconPreset = {
  size: 15,
  strokeWidth: 1.75,
  "aria-hidden": true,
};

/** 24px — empty-state marks only. Lighter stroke, which reads calmer at size. */
export const iconLg: IconPreset = {
  size: 24,
  strokeWidth: 1.5,
  "aria-hidden": true,
};
