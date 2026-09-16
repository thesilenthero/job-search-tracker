import { useEffect, useRef } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  useApplications,
  useContacts,
  useNextSteps,
  useSuggestions,
} from "./api";
import { urgencyOf } from "./lib/format";
import { ThemeToggle } from "./components/ThemeToggle";
import { Download, iconSm } from "./components/icons";
import Pipeline from "./pages/Pipeline";
import Detail from "./pages/Detail";
import NextSteps from "./pages/NextSteps";
import Contacts from "./pages/Contacts";
import Analytics from "./pages/Analytics";
import Evaluation from "./pages/Evaluation";
import Discover from "./pages/Discover";
import Guide from "./pages/Guide";

function NavItem({
  to,
  label,
  badge,
  accentBadge,
}: {
  to: string;
  label: string;
  badge?: number;
  /** Draw attention to the count (things that are actually due). */
  accentBadge?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        // The active row is marked by weight and a hairline rail, not a block
        // of accent — colour is reserved for things that need acting on.
        `group relative flex items-center justify-between gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-1.5 text-[13px] transition-colors duration-150 ${
          isActive
            ? "bg-[var(--surface-2)] font-medium text-[var(--text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 hidden h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--accent)] md:block"
            />
          )}
          <span>{label}</span>
          {badge ? (
            <span
              className={`pill px-1.5 tabular ${
                accentBadge
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "pill-muted"
              }`}
            >
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

type NavEntry = { to: string; label: string };

// Discover and Evaluation were routed but unlinked — you had to know the URL or
// go digging in the Guide. They are occasional rather than daily, which is what
// the grouping now says, instead of hiding them saying it.
const NAV_GROUPS: { label: string; items: NavEntry[] }[] = [
  {
    label: "Daily",
    items: [
      { to: "/", label: "Pipeline" },
      { to: "/next-steps", label: "Next steps" },
      { to: "/contacts", label: "Contacts" },
      { to: "/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/discover", label: "Discover" },
      { to: "/evaluation", label: "Evaluation" },
      { to: "/guide", label: "Guide" },
    ],
  },
];

// The phone strip has no room for group headings — they would add a row, and
// `main` offsets itself by a fixed amount to clear this bar.
const NAV_FLAT = NAV_GROUPS.flatMap((g) => g.items);

export default function App() {
  const { data: apps } = useApplications();
  const { data: contacts } = useContacts();
  const { data: suggestions } = useSuggestions();
  const { data: steps } = useNextSteps();
  const due = (d: string | null) =>
    ["overdue", "today", "soon"].includes(urgencyOf(d));
  const dueCount =
    (apps ?? []).filter((a) => !a.archived && a.nextAction && due(a.nextActionDate))
      .length +
    (contacts ?? []).filter((c) => c.nextAction && due(c.nextActionDate)).length +
    (suggestions?.length ?? 0) +
    (steps?.length ?? 0);

  // One source of truth, rendered twice — the sidebar groups it, the strip
  // flattens it, and neither can drift from the other.
  const renderItem = (item: NavEntry) => (
    <NavItem
      key={item.to}
      to={item.to}
      label={item.label}
      badge={item.to === "/next-steps" ? dueCount : undefined}
      accentBadge={item.to === "/next-steps"}
    />
  );

  // Seven items don't fit a phone, and the strip gave no sign that the rest
  // existed — navigate to Guide and Guide stayed off-screen. Centre whatever is
  // active after each navigation.
  //
  // The reduced-motion branch is manual on purpose: the global
  // `scroll-behavior: auto !important` governs CSS smooth scrolling and has no
  // say over a behavior passed to scrollIntoView here. Focus is deliberately
  // left alone — moving it on every navigation would hijack the page.
  const stripRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const active = stripRef.current?.querySelector('[aria-current="page"]');
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    active.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-6 md:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-6">
          <Link
            to="/"
            aria-label="Job Tracker — go to pipeline"
            className="mb-6 flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1 transition-colors duration-150 hover:bg-[var(--surface-2)]"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-fill)] text-[13px] font-semibold text-[var(--on-accent)]"
            >
              J
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold tracking-tight">
                Job Tracker
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Pipeline &amp; live analytics
              </div>
            </div>
          </Link>
          <nav className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </div>
                {group.items.map(renderItem)}
              </div>
            ))}
          </nav>
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <a
              href="/api/export.zip"
              title="Download everything — applications, stage history, interviews, and engagements"
              className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-[13px] text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <Download {...iconSm} /> Export data
            </a>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top nav — scrolls sideways rather than cramming every item. */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-md md:hidden">
        <div className="flex items-center gap-1 px-3 py-1.5">
          <Link to="/" className="mr-1 shrink-0 text-[13px] font-semibold">
            Job Tracker
          </Link>
          {/* The mask makes the cut-off edge look like one, so it reads as
              "more over here" rather than as the end of the list. */}
          <div
            ref={stripRef}
            className="flex min-w-0 flex-1 snap-x snap-proximity gap-1 overflow-x-auto [-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_24px),transparent)] [mask-image:linear-gradient(to_right,black_calc(100%_-_24px),transparent)] [scrollbar-width:none] [&>a]:snap-start [&::-webkit-scrollbar]:hidden"
          >
            {NAV_FLAT.map(renderItem)}
          </div>
          <div className="shrink-0">
            <ThemeToggle compact />
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1 pt-12 md:pt-0">
        <Routes>
          <Route path="/" element={<Pipeline />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/next-steps" element={<NextSteps />} />
          {/* The old path stays live — bookmarks and the sheet's links use it. */}
          <Route path="/follow-ups" element={<Navigate to="/next-steps" replace />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/application/:id" element={<Detail />} />
        </Routes>
      </main>
    </div>
  );
}
