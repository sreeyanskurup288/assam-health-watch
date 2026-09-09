import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CloudRain,
  Database,
  Droplets,
  Gauge,
  Inbox,
  Info,
  LayoutDashboard,
  MapPinned,
  Menu,
  MessageSquareText,
  PackageCheck,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Signal,
  Sparkles,
  Truck,
  Users,
  Waves,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

type ScenarioKey = "baseline" | "flood" | "pipeline";
type Severity = "safe" | "watch" | "high" | "critical";

type Scenario = {
  label: string;
  shortLabel: string;
  context: string;
  location: string;
  score: number;
  level: Severity;
  window: string;
  pathogen: string;
  summary: string;
  updated: string;
  drivers: { name: string; value: string; detail: string; contribution: number; icon: typeof Activity }[];
  actions: { title: string; detail: string; owner: string; due: string; icon: typeof Activity }[];
  districts: { name: string; score: number; level: Severity; delta: string }[];
};

const scenarios: Record<ScenarioKey, Scenario> = {
  baseline: {
    label: "Dry season / baseline",
    shortLabel: "Baseline",
    context: "All signals within seasonal norms",
    location: "Assam overview",
    score: 18,
    level: "safe",
    window: "No active window",
    pathogen: "No suspected pathogen",
    summary: "No district is currently showing a meaningful convergence of environmental and community signals.",
    updated: "Updated 6 min ago",
    drivers: [
      { name: "River level", value: "−0.4σ", detail: "Below seasonal median", contribution: 18, icon: Waves },
      { name: "Water turbidity", value: "4.8 NTU", detail: "Within safe band", contribution: 14, icon: Droplets },
      { name: "OTC sales", value: "+6%", detail: "No abnormal movement", contribution: 9, icon: PackageCheck },
    ],
    actions: [
      { title: "Maintain routine monitoring", detail: "Continue daily telemetry sync across 4 focus zones.", owner: "District surveillance", due: "Today", icon: Radio },
      { title: "Verify ASHA sync health", detail: "2 field devices have not synced in the last 24 hours.", owner: "Block coordinators", due: "Today", icon: WifiOff },
    ],
    districts: [
      { name: "Majuli", score: 18, level: "safe", delta: "−3" },
      { name: "Dibrugarh & Tinsukia", score: 21, level: "safe", delta: "+2" },
      { name: "Dhubri & Cachar", score: 14, level: "safe", delta: "−1" },
      { name: "Kamrup Metropolitan", score: 25, level: "watch", delta: "+4" },
    ],
  },
  flood: {
    label: "Brahmaputra flood in Majuli",
    shortLabel: "Scenario B",
    context: "Flood pulse + community symptom cluster",
    location: "Majuli · Sector 2 Char",
    score: 88.5,
    level: "critical",
    window: "24–48 hours",
    pathogen: "Vibrio / acute diarrhoeal disease",
    summary: "A rapid convergence of river rise, unsafe water quality, and ASHA-reported symptoms is pointing to a near-term outbreak window.",
    updated: "Updated 2 min ago",
    drivers: [
      { name: "River level", value: "+2.0σ", detail: "CWC danger mark crossed", contribution: 42, icon: Waves },
      { name: "Water turbidity", value: "18.4 NTU", detail: "Above 15 NTU threshold", contribution: 35, icon: Droplets },
      { name: "OTC sales", value: "+210%", detail: "Anti-diarrhoeal spike", contribution: 23, icon: PackageCheck },
    ],
    actions: [
      { title: "Dispatch mobile purification unit", detail: "Move unit to Sector 2 Char before the next tide cycle.", owner: "Jal Jeevan Mission", due: "In 2 hrs", icon: Truck },
      { title: "Issue boil-water advisory", detail: "Send Assamese + English SMS to 4,860 residents in the red zone.", owner: "NHM Assam", due: "In 30 min", icon: Send },
      { title: "Pre-position ORS + zinc", detail: "Release 5,000 ORS and zinc packets to the PHC staging point.", owner: "District logistics", due: "Today", icon: PackageCheck },
    ],
    districts: [
      { name: "Majuli", score: 88.5, level: "critical", delta: "+31" },
      { name: "Dibrugarh & Tinsukia", score: 39, level: "watch", delta: "+8" },
      { name: "Dhubri & Cachar", score: 52, level: "high", delta: "+14" },
      { name: "Kamrup Metropolitan", score: 28, level: "watch", delta: "+3" },
    ],
  },
  pipeline: {
    label: "Tea estate pipeline leak",
    shortLabel: "Scenario C",
    context: "Pressure drop + OTC sales anomaly",
    location: "Dibrugarh · Naharkatia cluster",
    score: 76,
    level: "high",
    window: "48–72 hours",
    pathogen: "Gastroenteritis / typhoid",
    summary: "A sudden distribution pressure loss overlaps with a sharp rise in anti-diarrhoeal purchases at tea garden clinics.",
    updated: "Updated 4 min ago",
    drivers: [
      { name: "Pipeline pressure", value: "−21%", detail: "3 nodes below baseline", contribution: 38, icon: Gauge },
      { name: "OTC sales", value: "+210%", detail: "Tea garden clinics", contribution: 36, icon: PackageCheck },
      { name: "Rainfall", value: "78 mm", detail: "Rolling 72h accumulation", contribution: 14, icon: CloudRain },
    ],
    actions: [
      { title: "Test estate distribution loop", detail: "Collect water samples at 3 downstream standpipes.", owner: "Tea estate health cell", due: "In 4 hrs", icon: Droplets },
      { title: "Route field team to Naharkatia", detail: "Deploy one ASHA supervisor and two rapid response workers.", owner: "Dibrugarh DHO", due: "Today", icon: Users },
      { title: "Confirm pharmacy spike", detail: "Call 6 local clinics and validate reported OTC movement.", owner: "Surveillance desk", due: "In 1 hr", icon: MessageSquareText },
    ],
    districts: [
      { name: "Majuli", score: 32, level: "watch", delta: "+5" },
      { name: "Dibrugarh & Tinsukia", score: 76, level: "high", delta: "+28" },
      { name: "Dhubri & Cachar", score: 24, level: "watch", delta: "+2" },
      { name: "Kamrup Metropolitan", score: 27, level: "watch", delta: "+4" },
    ],
  },
};

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "District watch", icon: MapPinned },
  { label: "Signal streams", icon: Activity },
  { label: "Field response", icon: Truck },
];

const severityStyles: Record<Severity, { label: string; text: string; bg: string; dot: string; bar: string }> = {
  safe: { label: "SAFE", text: "text-emerald-300", bg: "bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-300", bar: "bg-emerald-400" },
  watch: { label: "WATCH", text: "text-amber-300", bg: "bg-amber-400/10 border-amber-400/20", dot: "bg-amber-300", bar: "bg-amber-400" },
  high: { label: "HIGH", text: "text-orange-300", bg: "bg-orange-400/10 border-orange-400/20", dot: "bg-orange-300", bar: "bg-orange-400" },
  critical: { label: "CRITICAL", text: "text-rose-300", bg: "bg-rose-400/10 border-rose-400/20", dot: "bg-rose-300", bar: "bg-rose-400" },
};

function RiskPill({ level, compact = false }: { level: Severity; compact?: boolean }) {
  const style = severityStyles[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${level === "critical" ? "pulse-dot" : ""}`} />
      {compact ? style.label : `RISK · ${style.label}`}
    </span>
  );
}

function Sparkline({ variant = "critical" }: { variant?: "critical" | "safe" | "high" }) {
  const points = variant === "safe" ? "0,32 16,30 30,31 46,27 60,29 76,25 92,26 108,23 124,25 140,21" : variant === "high" ? "0,31 16,28 30,29 46,23 60,25 76,20 92,17 108,19 124,12 140,10" : "0,34 16,30 30,32 46,21 60,24 76,15 92,17 108,8 124,5 140,0";
  const stroke = variant === "safe" ? "#34d399" : variant === "high" ? "#fb923c" : "#fb7185";
  return (
    <svg viewBox="0 0 140 38" className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={`M ${points.replaceAll(" ", " L ")}`} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M 0,38 L ${points.replaceAll(" ", " L ")} L 140,38 Z`} fill={stroke} fillOpacity="0.08" />
    </svg>
  );
}

function RiverChart({ scenario }: { scenario: Scenario }) {
  const flood = scenario.level === "critical";
  const values = flood ? [34, 36, 38, 41, 43, 47, 51, 57, 63, 71, 82, 94] : scenario.level === "high" ? [30, 31, 31, 32, 33, 35, 38, 40, 44, 49, 54, 59] : [31, 30, 31, 30, 29, 30, 29, 30, 29, 30, 29, 30];
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1123]/80 p-4">
      <div className="absolute inset-0 map-grid opacity-40" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-500"><span>River level · CWC gauge / Neamati</span><span className="text-slate-400">last 12h</span></div>
        <svg viewBox="0 0 480 100" className="h-24 w-full" preserveAspectRatio="none" aria-label="River level trend chart">
          <defs>
            <linearGradient id="river-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={flood ? "#fb7185" : "#22d3ee"} stopOpacity="0.35" />
              <stop offset="100%" stopColor={flood ? "#fb7185" : "#22d3ee"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="44" x2="480" y2="44" stroke="#fda4af" strokeDasharray="5 6" strokeOpacity="0.45" />
          <text x="6" y="39" fill="#fda4af" fontSize="9">danger mark</text>
          <polyline points={values.map((value, index) => `${index * 43.6},${100 - value}`).join(" ")} fill="none" stroke={flood ? "#fb7185" : "#22d3ee"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points={`0,100 ${values.map((value, index) => `${index * 43.6},${100 - value}`).join(" ")} 480,100`} fill="url(#river-fill)" />
          <circle cx={flood ? "480" : "480"} cy={100 - values[values.length - 1]} r="5" fill={flood ? "#fb7185" : "#22d3ee"} stroke="#0b1123" strokeWidth="3" />
        </svg>
        <div className="flex justify-between text-[10px] text-slate-500"><span>12h ago</span><span>6h ago</span><span>now</span></div>
      </div>
    </div>
  );
}

function AssamMap({ scenario }: { scenario: Scenario }) {
  const critical = scenario.level === "critical";
  const selected = scenario.level === "high" ? "dibrugarh" : critical ? "majuli" : "assam";
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1020] p-4">
      <div className="absolute inset-0 map-grid opacity-30" />
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"><MapPinned className="h-3.5 w-3.5 text-cyan-300" /> live risk surface</div>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1.5 text-[10px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> 4 focus districts</div>
      <svg viewBox="0 0 520 300" className="relative z-[1] mt-5 h-[250px] w-full" role="img" aria-label="Abstract Assam district risk map">
        <path d="M130 62 C175 28 221 45 256 37 C302 26 333 44 366 52 C395 60 440 53 469 79 C491 99 465 119 475 140 C486 164 457 175 438 191 C419 208 402 228 367 235 C330 242 315 267 275 258 C245 251 215 264 188 245 C163 227 140 213 117 193 C91 171 71 141 83 117 C95 93 105 79 130 62Z" fill="#101a31" stroke="#33456d" strokeWidth="2" />
        <path d="M96 110 C145 126 177 103 210 119 C248 138 279 128 305 110 C334 91 375 95 410 123 C429 138 442 162 463 174" fill="none" stroke="#1d7189" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <path d="M108 158 C158 152 185 173 229 158 C270 145 306 169 343 156 C381 143 413 160 440 190" fill="none" stroke="#194c68" strokeWidth="2" strokeDasharray="5 6" />
        <path d="M156 80 C175 108 174 133 152 158 C135 177 137 202 167 223" fill="none" stroke="#1c4d63" strokeWidth="2" strokeDasharray="3 6" />
        <g>
          <circle cx="225" cy="105" r={selected === "majuli" ? "13" : "8"} fill={critical ? "#fb7185" : "#22d3ee"} fillOpacity="0.18" />
          <circle cx="225" cy="105" r="5" fill={critical ? "#fb7185" : "#22d3ee"} stroke="#09101f" strokeWidth="3" />
          <text x="237" y="102" fill="#cbd5e1" fontSize="11" fontWeight="600">Majuli</text>
          <text x="237" y="116" fill="#64748b" fontSize="9">{critical ? "88.5 · critical" : "18 · safe"}</text>
        </g>
        <g>
          <circle cx="324" cy="151" r={selected === "dibrugarh" ? "13" : "8"} fill={scenario.level === "high" ? "#fb923c" : "#fbbf24"} fillOpacity="0.18" />
          <circle cx="324" cy="151" r="5" fill={scenario.level === "high" ? "#fb923c" : "#fbbf24"} stroke="#09101f" strokeWidth="3" />
          <text x="336" y="148" fill="#cbd5e1" fontSize="11" fontWeight="600">Dibrugarh</text>
          <text x="336" y="162" fill="#64748b" fontSize="9">{scenario.level === "high" ? "76 · high" : "21 · safe"}</text>
        </g>
        <g>
          <circle cx="145" cy="190" r="8" fill={critical ? "#fb923c" : "#34d399"} fillOpacity="0.18" />
          <circle cx="145" cy="190" r="5" fill={critical ? "#fb923c" : "#34d399"} stroke="#09101f" strokeWidth="3" />
          <text x="105" y="211" fill="#cbd5e1" fontSize="11" fontWeight="600">Dhubri</text>
        </g>
        <g>
          <circle cx="402" cy="91" r="8" fill="#fbbf24" fillOpacity="0.18" />
          <circle cx="402" cy="91" r="5" fill="#fbbf24" stroke="#09101f" strokeWidth="3" />
          <text x="414" y="88" fill="#cbd5e1" fontSize="11" fontWeight="600">Guwahati</text>
        </g>
        <g opacity="0.55"><text x="110" y="268" fill="#64748b" fontSize="10">Brahmaputra basin</text><text x="390" y="245" fill="#64748b" fontSize="10">Barak basin</text></g>
      </svg>
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-slate-500"><span>Model refresh · 14:32 IST</span><span className="flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> telemetry online</span></div>
    </div>
  );
}

function Sidebar({ onNav }: { onNav: (label: string) => void }) {
  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-white/[0.07] bg-[#080d1b] px-4 py-5 lg:flex">
      <div className="flex items-center gap-3 px-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]"><ShieldCheck className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 ring-4 ring-[#080d1b]" /></div>
        <div><div className="font-display text-[17px] font-bold tracking-tight text-white">Assam Health Watch</div><div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">NHM · EARLY WARNING</div></div>
      </div>
      <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</div>
      <nav className="mt-3 space-y-1">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button key={label} onClick={() => onNav(label)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-cyan-300/10 text-cyan-100 shadow-[inset_2px_0_0_#67e8f9]" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"}`}>
            <span className="flex items-center gap-3"><Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"}`} />{label}</span>
            {label === "District watch" && <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">3</span>}
          </button>
        ))}
      </nav>
      <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">System</div>
      <nav className="mt-3 space-y-1">
        {[{ label: "Data sources", icon: Database }, { label: "Alert rules", icon: Bell }, { label: "Settings", icon: Settings2 }].map(({ label, icon: Icon }) => <button key={label} onClick={() => onNav(label)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"><Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />{label}</button>)}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> platform status</div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">All ingestion streams are operational. Last offline queue cleared 11 min ago.</p>
        <button onClick={() => toast.success("All 23 sources responded", { description: "Telemetry health check completed just now." })} className="mt-3 flex items-center gap-1 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Run health check <ArrowUpRight className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] px-3 pt-5"><div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-indigo-400 text-xs font-bold text-slate-950">AS</div><div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-200">A. Sharma</div><div className="truncate text-[10px] text-slate-500">State surveillance lead</div></div><ChevronDown className="ml-auto h-4 w-4 text-slate-600" /></div>
    </aside>
  );
}

export default function Home() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("flood");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const scenario = scenarios[scenarioKey];
  const severity = severityStyles[scenario.level];
  const activeActions = useMemo(() => scenario.actions.filter((action) => !completedActions.includes(action.title)), [scenario.actions, completedActions]);

  function changeScenario(next: ScenarioKey) {
    setScenarioKey(next);
    setAcknowledged(false);
    setCompletedActions([]);
    toast.info(`Loaded ${scenarios[next].label}`, { description: scenarios[next].context });
  }

  function handleNav(label: string) {
    setMobileOpen(false);
    if (label !== "Overview") toast(`${label} view is in prototype mode`, { description: "This demonstration keeps the focus on the live overview surface." });
  }

  function acknowledge() {
    setAcknowledged(true);
    toast.success("Alert acknowledged", { description: "The response desk has been notified and the event is now tracked." });
  }

  function completeAction(title: string) {
    setCompletedActions((current) => [...current, title]);
    toast.success("Action marked complete", { description: title });
  }

  return (
    <div className="noise min-h-screen bg-[#080d1b] text-slate-200">
      <div className="flex min-h-screen">
        <Sidebar onNav={handleNav} />
        {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
        {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#080d1b] p-5 shadow-2xl lg:hidden"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><ShieldCheck className="h-5 w-5" /></div><span className="font-display font-bold text-white">Assam Health Watch</span></div><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5 text-slate-400" /></button></div><div className="mt-8 space-y-1">{navItems.map(({ label, icon: Icon, active }) => <button key={label} onClick={() => handleNav(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-cyan-300/10 text-cyan-100" : "text-slate-500"}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div>}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080d1b]/90 backdrop-blur-xl">
            <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
              <div className="flex items-center gap-3"><button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-4 w-4" /></button><div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 pulse-dot" /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Operational view</span></div><h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">Community health command center</h1></div></div>
              <div className="flex items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 md:flex"><Search className="h-3.5 w-3.5" /><span>Search districts</span><kbd className="ml-4 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-600">⌘ K</kbd></div><button onClick={() => toast("No new notifications", { description: "Your watch desk is fully up to date." })} className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-300" /></button><button onClick={() => toast("Demo mode", { description: "Data shown here is based on the SIH 2025 prototype scenarios." })} className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Demo mode</button></div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-9">
            <section className="fade-up flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-6 xl:flex-row xl:items-end">
              <div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>Tuesday, 09 September 2026</span><span className="h-1 w-1 rounded-full bg-slate-700" /><span className="flex items-center gap-1.5 text-emerald-300"><Signal className="h-3.5 w-3.5" /> 23 sources online</span></div><h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">See the signal before it becomes an outbreak.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">AI-assisted early warning for Assam’s flood-prone communities. Environmental telemetry, field intelligence, and local behavior—together in one view.</p></div>
              <div className="flex shrink-0 flex-col items-start gap-2 xl:items-end"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Simulation scenario</div><div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">{(["baseline", "flood", "pipeline"] as ScenarioKey[]).map((key) => <button key={key} onClick={() => changeScenario(key)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${scenarioKey === key ? "bg-cyan-300 text-slate-950 shadow-[0_5px_18px_rgba(103,232,249,0.22)]" : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"}`}>{scenarios[key].shortLabel}</button>)}</div></div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="glass-card fade-up delay-1 rounded-2xl p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">State risk index <Info className="h-3 w-3 text-slate-600" /></div><div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-semibold tracking-tight text-white">{scenario.score}</span><span className="mb-1 text-sm text-slate-500">/ 100</span></div></div><div className={`grid h-9 w-9 place-items-center rounded-xl ${severity.bg} ${severity.text}`}><BrainCircuit className="h-4 w-4" /></div></div><div className="mt-4"><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${severity.bar} transition-all duration-500`} style={{ width: `${scenario.score}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-slate-600"><span>0 safe</span><span>40 watch</span><span>70 critical</span></div></div></div>
              <div className="glass-card fade-up delay-2 rounded-2xl p-5"><div className="flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Districts in view</div><MapPinned className="h-4 w-4 text-cyan-300" /></div><div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-semibold tracking-tight text-white">04</span><span className="mb-1 flex items-center gap-1 text-xs text-emerald-300"><ArrowUpRight className="h-3.5 w-3.5" /> focus areas</span></div><div className="mt-3 flex -space-x-2">{scenario.districts.map((district) => <div key={district.name} title={district.name} className={`grid h-7 w-7 place-items-center rounded-full border-2 border-[#10172b] text-[9px] font-bold ${severityStyles[district.level].bg} ${severityStyles[district.level].text}`}>{district.name.slice(0, 2).toUpperCase()}</div>)}</div></div>
              <div className="glass-card fade-up delay-3 rounded-2xl p-5"><div className="flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Signals processed</div><Database className="h-4 w-4 text-violet-300" /></div><div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-semibold tracking-tight text-white">1,284</span><span className="mb-1 text-xs text-emerald-300">+12.8%</span></div><div className="mt-3"><Sparkline variant="safe" /></div></div>
              <div className="glass-card fade-up delay-4 rounded-2xl p-5"><div className="flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Active response items</div><Inbox className="h-4 w-4 text-amber-300" /></div><div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-semibold tracking-tight text-white">{activeActions.length.toString().padStart(2, "0")}</span><span className="mb-1 text-xs text-amber-300">need attention</span></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> next SLA window <span className="ml-auto font-semibold text-slate-300">{scenario.actions[0]?.due}</span></div></div>
            </section>

            <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
              <div className="glass-card fade-up delay-2 overflow-hidden rounded-2xl"><div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><RiskPill level={scenario.level} /><span className="text-[10px] text-slate-600">{scenario.updated}</span></div><h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white">{scenario.location}</h3><p className="mt-1 max-w-xl text-sm leading-5 text-slate-400">{scenario.context}. {scenario.summary}</p></div><button onClick={() => changeScenario(scenarioKey)} className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"><RefreshCw className="h-3.5 w-3.5" /> refresh model</button></div><div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px]"><AssamMap scenario={scenario} /><div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.035] p-4"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200"><CircleAlert className="h-3.5 w-3.5" /> model forecast</div><div className="mt-5 font-display text-4xl font-semibold tracking-tight text-white">{scenario.window}</div><p className="mt-1 text-xs leading-5 text-slate-400">predicted outbreak window</p><div className="my-5 h-px bg-white/[0.07]" /><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">suspected profile</div><div className="mt-2 text-sm font-semibold text-slate-200">{scenario.pathogen}</div><div className="mt-5 flex items-center gap-2 text-xs text-rose-200"><Zap className="h-3.5 w-3.5" /> XAI confidence 0.89</div></div></div></div>
              <div className="glass-card fade-up delay-3 rounded-2xl p-5"><div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Risk movement</div><h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Signal convergence</h3></div><div className="flex items-center gap-1 text-xs text-rose-300"><ArrowUpRight className="h-3.5 w-3.5" /> 18.2%</div></div><div className="mt-4"><Sparkline variant={scenario.level === "safe" ? "safe" : scenario.level === "high" ? "high" : "critical"} /></div><div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>7 days ago</span><span>now</span></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">signal density</div><div className="mt-1 text-lg font-semibold text-white">{scenario.level === "critical" ? "4.7×" : scenario.level === "high" ? "3.1×" : "0.8×"}</div></div><div className="rounded-xl bg-white/[0.035] p-3"><div className="text-[10px] text-slate-500">lead time</div><div className="mt-1 text-lg font-semibold text-white">{scenario.level === "safe" ? "—" : "58h"}</div></div></div></div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
              <div className="glass-card fade-up delay-3 rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Explainable AI</div><h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Why the model is watching this</h3></div><button onClick={() => toast("Feature attribution exported", { description: "A model explanation would be downloaded in the full product." })} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Export XAI <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="mt-5 space-y-4">{scenario.drivers.map(({ name, value, detail, contribution, icon: Icon }, index) => <div key={name} className="group"><div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-cyan-200 transition group-hover:bg-cyan-300/10"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-4"><span className="text-sm font-semibold text-slate-200">{name}</span><span className="text-sm font-semibold text-white">{value}</span></div><div className="mt-1 flex items-center justify-between gap-4 text-[11px] text-slate-500"><span className="truncate">{detail}</span><span className="shrink-0 font-semibold text-slate-400">{contribution}% contribution</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full transition-all duration-700 ${index === 0 && scenario.level === "critical" ? "bg-rose-300" : "bg-cyan-300"}`} style={{ width: `${contribution * 2}%` }} /></div></div></div></div>)}</div></div>
              <div className="glass-card fade-up delay-4 rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Environmental telemetry</div><h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">River rise is accelerating</h3></div><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> live</div></div><div className="mt-5"><RiverChart scenario={scenario} /></div><div className="mt-4 flex items-center justify-between text-xs"><div className="flex items-center gap-2 text-slate-400"><Waves className="h-3.5 w-3.5 text-cyan-300" /> Current gauge <span className="font-semibold text-white">{scenario.level === "critical" ? "2.87 m" : scenario.level === "high" ? "2.41 m" : "1.86 m"}</span></div><div className={`flex items-center gap-1 ${scenario.level === "safe" ? "text-emerald-300" : "text-rose-300"}`}>{scenario.level === "safe" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />} {scenario.level === "safe" ? "stable" : "rising"}</div></div></div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
              <div className="glass-card fade-up delay-4 rounded-2xl p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">District watchlist</div><h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Focus areas by risk score</h3></div><button onClick={() => toast("District watch opened", { description: "Use the scenario controls above to compare district movement." })} className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200">View all districts <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="mt-5 overflow-x-auto"><div className="min-w-[560px]"><div className="grid grid-cols-[1.4fr_.55fr_1fr_.55fr] gap-3 border-b border-white/[0.07] px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600"><span>District / zone</span><span>Score</span><span>Risk state</span><span>24h</span></div>{scenario.districts.map((district) => { const style = severityStyles[district.level]; return <button key={district.name} onClick={() => toast(`${district.name} selected`, { description: "District detail is ready for field review in the full workspace." })} className="grid w-full grid-cols-[1.4fr_.55fr_1fr_.55fr] items-center gap-3 rounded-xl border-b border-white/[0.05] px-3 py-3 text-left transition last:border-0 hover:bg-white/[0.035]"><span className="text-sm font-semibold text-slate-200">{district.name}</span><span className="font-display text-lg text-white">{district.score}</span><span><RiskPill level={district.level} compact /></span><span className={`flex items-center gap-1 text-xs font-semibold ${district.delta.startsWith("+") ? "text-rose-300" : "text-emerald-300"}`}>{district.delta.startsWith("+") ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{district.delta}</span></button> })}</div></div></div>
              <div className="glass-card fade-up delay-4 rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Response desk</div><h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Move from signal to action</h3></div><span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">{activeActions.length} open</span></div><div className="mt-5 space-y-3">{scenario.actions.slice(0, 3).map((action) => { const done = completedActions.includes(action.title); const Icon = action.icon; return <div key={action.title} className={`rounded-xl border p-3 transition ${done ? "border-emerald-300/15 bg-emerald-300/[0.04] opacity-60" : "border-white/[0.07] bg-white/[0.025] hover:border-cyan-300/20"}`}><div className="flex gap-3"><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${done ? "bg-emerald-300/10 text-emerald-300" : "bg-cyan-300/10 text-cyan-200"}`}>{done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className={`text-xs font-semibold ${done ? "text-emerald-200 line-through" : "text-slate-200"}`}>{action.title}</div><span className="shrink-0 text-[10px] font-semibold text-amber-200">{action.due}</span></div><p className="mt-1 text-[11px] leading-4 text-slate-500">{action.detail}</p><div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-slate-600">Owner · {action.owner}</span>{!done && <button onClick={() => completeAction(action.title)} className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200">Mark done</button>}</div></div></div></div> })}</div><button onClick={() => toast("Response plan ready", { description: "The full field response workflow is available in the production build." })} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.05] hover:text-cyan-100">Open response plan <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center"><div className="flex items-center gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><BookOpen className="h-5 w-5" /></div><div><div className="text-sm font-semibold text-slate-200">Built for the last mile</div><div className="mt-1 text-xs leading-5 text-slate-500">Field PWA + SMS fallback keeps ASHA reporting live when bandwidth drops. Offline queue last checked 11 min ago.</div></div><div className="ml-auto hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300 sm:flex"><CheckCircle2 className="h-4 w-4" /> PWA ready</div></div><button onClick={() => toast("Prototype brief opened", { description: "Architecture: ingestion → AI/XAI → role-based action." })} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"><Info className="h-4 w-4" /> View prototype brief</button></section>
          </div>
        </main>
      </div>

      <div className="fixed bottom-5 right-5 z-20 max-w-[calc(100vw-2.5rem)] sm:max-w-sm"><div className={`flex items-start gap-3 rounded-2xl border bg-[#11192c]/95 p-3.5 shadow-2xl backdrop-blur-xl transition ${acknowledged ? "border-emerald-300/20" : "border-rose-300/20"}`}><div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${acknowledged ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"}`}>{acknowledged ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{acknowledged ? "Alert tracked" : "Attention required"}</div><div className="mt-1 text-xs font-semibold leading-5 text-slate-200">{acknowledged ? "Response desk has acknowledged this signal." : `${scenario.location} has a ${scenario.level} risk signal.`}</div>{!acknowledged && <button onClick={acknowledge} className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200">Acknowledge alert</button>}</div><button onClick={() => setAcknowledged(true)} aria-label="Dismiss alert" className="ml-auto text-slate-600 hover:text-slate-300"><X className="h-4 w-4" /></button></div></div>
    </div>
  );
}

