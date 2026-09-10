import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Check,
  CheckCircle2,
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
  Sliders,
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

type District = {
  name: string;
  score: number;
  level: Severity;
  delta: string;
  coords: { cx: number; cy: number };
  details: string;
};

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
  river: number; // σ
  turbidity: number; // NTU
  otc: number; // %
  drivers: { name: string; value: string; detail: string; contribution: number; icon: typeof Activity }[];
  actions: { id: string; title: string; detail: string; owner: string; due: string; icon: typeof Activity }[];
  districts: District[];
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
    river: -0.4,
    turbidity: 4.8,
    otc: 6,
    drivers: [
      { name: "River level", value: "−0.4σ", detail: "Below seasonal median", contribution: 18, icon: Waves },
      { name: "Water turbidity", value: "4.8 NTU", detail: "Within safe band", contribution: 14, icon: Droplets },
      { name: "OTC sales", value: "+6%", detail: "No abnormal movement", contribution: 9, icon: PackageCheck },
    ],
    actions: [
      { id: "b1", title: "Maintain routine monitoring", detail: "Continue daily telemetry sync across 4 focus zones.", owner: "District surveillance", due: "Today", icon: Radio },
      { id: "b2", title: "Verify ASHA sync health", detail: "2 field devices have not synced in the last 24 hours.", owner: "Block coordinators", due: "Today", icon: WifiOff },
    ],
    districts: [
      { name: "Majuli", score: 18, level: "safe", delta: "−3", coords: { cx: 225, cy: 105 }, details: "Stable baseline water parameters." },
      { name: "Dibrugarh", score: 21, level: "safe", delta: "+2", coords: { cx: 324, cy: 151 }, details: "Tea estate clinics reporting normal OTC purchases." },
      { name: "Dhubri", score: 14, level: "safe", delta: "−1", coords: { cx: 145, cy: 190 }, details: "Barak basin rivers steady." },
      { name: "Guwahati", score: 25, level: "watch", delta: "+4", coords: { cx: 402, cy: 91 }, details: "Slight urban drainage delay." },
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
    river: 2.0,
    turbidity: 18.4,
    otc: 210,
    drivers: [
      { name: "River level", value: "+2.0σ", detail: "CWC danger mark crossed", contribution: 42, icon: Waves },
      { name: "Water turbidity", value: "18.4 NTU", detail: "Above 15 NTU threshold", contribution: 35, icon: Droplets },
      { name: "OTC sales", value: "+210%", detail: "Anti-diarrhoeal spike", contribution: 23, icon: PackageCheck },
    ],
    actions: [
      { id: "f1", title: "Dispatch mobile purification unit", detail: "Move unit to Sector 2 Char before the next tide cycle.", owner: "Jal Jeevan Mission", due: "In 2 hrs", icon: Truck },
      { id: "f2", title: "Issue boil-water advisory", detail: "Send Assamese + English SMS to 4,860 residents in the red zone.", owner: "NHM Assam", due: "In 30 min", icon: Send },
      { id: "f3", title: "Pre-position ORS + zinc", detail: "Release 5,000 ORS and zinc packets to the PHC staging point.", owner: "District logistics", due: "Today", icon: PackageCheck },
    ],
    districts: [
      { name: "Majuli", score: 88.5, level: "critical", delta: "+31", coords: { cx: 225, cy: 105 }, details: "Sector 2 Char inundated; turbidity spike at 18.4 NTU." },
      { name: "Dibrugarh", score: 39, level: "watch", delta: "+8", coords: { cx: 324, cy: 151 }, details: "Elevated river velocity downstream." },
      { name: "Dhubri", score: 52, level: "high", delta: "+14", coords: { cx: 145, cy: 190 }, details: "Waterlogging reported in low-lying char areas." },
      { name: "Guwahati", score: 28, level: "watch", delta: "+3", coords: { cx: 402, cy: 91 }, details: "Increased surveillance at urban health centres." },
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
    river: 0.8,
    turbidity: 12.1,
    otc: 180,
    drivers: [
      { name: "Pipeline pressure", value: "−21%", detail: "3 nodes below baseline", contribution: 38, icon: Gauge },
      { name: "OTC sales", value: "+180%", detail: "Tea garden clinics", contribution: 36, icon: PackageCheck },
      { name: "Rainfall", value: "78 mm", detail: "Rolling 72h accumulation", contribution: 14, icon: CloudRain },
    ],
    actions: [
      { id: "p1", title: "Test estate distribution loop", detail: "Collect water samples at 3 downstream standpipes.", owner: "Tea estate health cell", due: "In 4 hrs", icon: Droplets },
      { id: "p2", title: "Route field team to Naharkatia", detail: "Deploy one ASHA supervisor and two rapid response workers.", owner: "Dibrugarh DHO", due: "Today", icon: Users },
      { id: "p3", title: "Confirm pharmacy spike", detail: "Call 6 local clinics and validate reported OTC movement.", owner: "Surveillance desk", due: "In 1 hr", icon: MessageSquareText },
    ],
    districts: [
      { name: "Majuli", score: 32, level: "watch", delta: "+5", coords: { cx: 225, cy: 105 }, details: "Upstream runoff monitoring active." },
      { name: "Dibrugarh", score: 76, level: "high", delta: "+28", coords: { cx: 324, cy: 151 }, details: "Naharkatia estate pipeline failure suspected." },
      { name: "Dhubri", score: 24, level: "watch", delta: "+2", coords: { cx: 145, cy: 190 }, details: "Normal parameters." },
      { name: "Guwahati", score: 27, level: "watch", delta: "+4", coords: { cx: 402, cy: 91 }, details: "Normal parameters." },
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

function getScoreSeverity(score: number): Severity {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "watch";
  return "safe";
}

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

// Interactive Telemetry Chart with Hover Tooltips
function RiverChart({ scenario, timeframe }: { scenario: Scenario; timeframe: "12h" | "24h" | "7d" }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const pointsCount = timeframe === "12h" ? 12 : timeframe === "24h" ? 24 : 14;
  const isCritical = scenario.level === "critical";

  const data = useMemo(() => {
    const baseMult = isCritical ? 1.4 : scenario.level === "high" ? 1.0 : 0.5;
    return Array.from({ length: pointsCount }, (_, i) => {
      const timeLabel = timeframe === "7d" ? `Day ${i + 1}` : `${(i * (timeframe === "12h" ? 1 : 2)).toString().padStart(2, "0")}:00`;
      const val = Math.round(20 + Math.sin(i / 2) * 10 + i * (baseMult * 3.5));
      return { timeLabel, value: Math.min(val, 98), turbidity: (val * 0.22).toFixed(1) };
    });
  }, [isCritical, scenario.level, pointsCount, timeframe]);

  return (
    <div className="relative h-48 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1123]/80 p-4">
      <div className="absolute inset-0 map-grid opacity-40" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300">River level & turbidity telemetry</span>
          {hoveredIdx !== null ? (
            <span className="font-mono text-cyan-300">
              {data[hoveredIdx].timeLabel}: <strong className="text-white">{data[hoveredIdx].value} m</strong> ({data[hoveredIdx].turbidity} NTU)
            </span>
          ) : (
            <span className="text-slate-500">Hover nodes to inspect</span>
          )}
        </div>

        <svg viewBox="0 0 480 100" className="h-28 w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="river-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={isCritical ? "#fb7185" : "#22d3ee"} stopOpacity="0.35" />
              <stop offset="100%" stopColor={isCritical ? "#fb7185" : "#22d3ee"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="44" x2="480" y2="44" stroke="#fda4af" strokeDasharray="5 6" strokeOpacity="0.45" />
          <text x="6" y="39" fill="#fda4af" fontSize="9">danger mark</text>
          
          <polyline
            points={data.map((d, index) => `${(index / (pointsCount - 1)) * 480},${100 - d.value}`).join(" ")}
            fill="none"
            stroke={isCritical ? "#fb7185" : "#22d3ee"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points={`0,100 ${data.map((d, index) => `${(index / (pointsCount - 1)) * 480},${100 - d.value}`).join(" ")} 480,100`}
            fill="url(#river-fill)"
          />

          {data.map((d, index) => {
            const cx = (index / (pointsCount - 1)) * 480;
            const cy = 100 - d.value;
            const isHovered = hoveredIdx === index;
            return (
              <g key={index} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(index)} onMouseLeave={() => setHoveredIdx(null)}>
                <circle cx={cx} cy={cy} r={isHovered ? 7 : 4} fill={isCritical ? "#fb7185" : "#22d3ee"} stroke="#0b1123" strokeWidth="2" />
                {isHovered && <circle cx={cx} cy={cy} r={12} fill="none" stroke="#67e8f9" strokeWidth="1.5" className="animate-ping" />}
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{data[0]?.timeLabel}</span>
          <span>{data[Math.floor(pointsCount / 2)]?.timeLabel}</span>
          <span>{data[pointsCount - 1]?.timeLabel}</span>
        </div>
      </div>
    </div>
  );
}

// Interactive Assam District Map
function AssamMap({ scenario, selectedDistrict, onSelectDistrict }: { scenario: Scenario; selectedDistrict: string; onSelectDistrict: (d: string) => void }) {
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1020] p-4">
      <div className="absolute inset-0 map-grid opacity-30" />
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <MapPinned className="h-3.5 w-3.5 text-cyan-300" /> Click node to isolate telemetry
      </div>
      
      <svg viewBox="0 0 520 300" className="relative z-[1] mt-5 h-[250px] w-full" role="img" aria-label="Interactive Assam district risk map">
        <path d="M130 62 C175 28 221 45 256 37 C302 26 333 44 366 52 C395 60 440 53 469 79 C491 99 465 119 475 140 C486 164 457 175 438 191 C419 208 402 228 367 235 C330 242 315 267 275 258 C245 251 215 264 188 245 C163 227 140 213 117 193 C91 171 71 141 83 117 C95 93 105 79 130 62Z" fill="#101a31" stroke="#33456d" strokeWidth="2" />
        <path d="M96 110 C145 126 177 103 210 119 C248 138 279 128 305 110 C334 91 375 95 410 123 C429 138 442 162 463 174" fill="none" stroke="#1d7189" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        
        {scenario.districts.map((d) => {
          const isSelected = selectedDistrict === d.name;
          const style = severityStyles[d.level];
          return (
            <g key={d.name} className="cursor-pointer transition hover:opacity-80" onClick={() => onSelectDistrict(d.name)}>
              <circle cx={d.coords.cx} cy={d.coords.cy} r={isSelected ? "16" : "9"} fill={d.level === "critical" ? "#fb7185" : d.level === "high" ? "#fb923c" : "#22d3ee"} fillOpacity={isSelected ? "0.35" : "0.2"} />
              <circle cx={d.coords.cx} cy={d.coords.cy} r="5" fill={d.level === "critical" ? "#fb7185" : d.level === "high" ? "#fb923c" : "#22d3ee"} stroke="#09101f" strokeWidth="2.5" />
              <text x={d.coords.cx + 12} y={d.coords.cy - 2} fill={isSelected ? "#67e8f9" : "#cbd5e1"} fontSize={isSelected ? "12" : "10"} fontWeight={isSelected ? "700" : "600"}>
                {d.name}
              </text>
              <text x={d.coords.cx + 12} y={d.coords.cy + 11} fill="#64748b" fontSize="8">
                {d.score} · {d.level}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-slate-500">
        <span>Selected: <strong className="text-cyan-300">{selectedDistrict}</strong></span>
        <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> telemetry active</span>
      </div>
    </div>
  );
}

function Sidebar({ onNav }: { onNav: (label: string) => void }) {
  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-white/[0.07] bg-[#080d1b] px-4 py-5 lg:flex">
      <div className="flex items-center gap-3 px-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
          <ShieldCheck className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 ring-4 ring-[#080d1b]" />
        </div>
        <div>
          <div className="font-display text-[17px] font-bold tracking-tight text-white">Assam Health Watch</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">NHM · EARLY WARNING</div>
        </div>
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
        {[{ label: "Data sources", icon: Database }, { label: "Alert rules", icon: Bell }, { label: "Settings", icon: Settings2 }].map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => onNav(label)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200">
            <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />{label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> platform status</div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">All ingestion streams are operational. Last offline queue cleared 11 min ago.</p>
        <button onClick={() => toast.success("All 23 sources responded", { description: "Telemetry health check completed just now." })} className="mt-3 flex items-center gap-1 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Run health check <ArrowUpRight className="h-3.5 w-3.5" /></button>
      </div>
    </aside>
  );
}

export default function Home() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("flood");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Majuli");
  const [actionFilter, setActionFilter] = useState<"all" | "pending" | "completed">("all");
  const [timeframe, setTimeframe] = useState<"12h" | "24h" | "7d">("12h");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulator controls
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simRiver, setSimRiver] = useState<number>(2.0);
  const [simTurbidity, setSimTurbidity] = useState<number>(18.4);
  const [simOtc, setSimOtc] = useState<number>(210);

  const scenario = scenarios[scenarioKey];

  // Sync simulator sliders on scenario change
  useEffect(() => {
    setSimRiver(scenario.river);
    setSimTurbidity(scenario.turbidity);
    setSimOtc(scenario.otc);
  }, [scenarioKey, scenario]);

  // Dynamic Risk Score calculation based on simulator values
  const simulatedScore = useMemo(() => {
    const base = 15;
    const riverContrib = Math.max(0, simRiver * 18);
    const turbidityContrib = (simTurbidity / 20) * 35;
    const otcContrib = (simOtc / 250) * 30;
    return Math.min(100, Math.round(base + riverContrib + turbidityContrib + otcContrib));
  }, [simRiver, simTurbidity, simOtc]);

  const simulatedLevel = getScoreSeverity(simulatedScore);
  const severity = severityStyles[simulatedLevel];

  // Filter actions
  const filteredActions = useMemo(() => {
    return scenario.actions.filter((a) => {
      const isDone = completedActions.includes(a.id);
      if (actionFilter === "pending") return !isDone;
      if (actionFilter === "completed") return isDone;
      return true;
    });
  }, [scenario.actions, completedActions, actionFilter]);

  // Selected District Data
  const currentDistrictData = useMemo(() => {
    return scenario.districts.find((d) => d.name === selectedDistrict) || scenario.districts[0];
  }, [scenario.districts, selectedDistrict]);

  // Keyboard shortcut for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function changeScenario(next: ScenarioKey) {
    setScenarioKey(next);
    setAcknowledged(false);
    setCompletedActions([]);
    toast.info(`Loaded ${scenarios[next].label}`, { description: scenarios[next].context });
  }

  function handleNav(label: string) {
    setMobileOpen(false);
    if (label !== "Overview") {
      toast(`${label} view active`, { description: `Filtering control deck for ${label}.` });
    }
  }

  function toggleAction(id: string, title: string) {
    if (completedActions.includes(id)) {
      setCompletedActions((curr) => curr.filter((i) => i !== id));
      toast.info("Action marked pending", { description: title });
    } else {
      setCompletedActions((curr) => [...curr, id]);
      toast.success("Action completed", { description: title });
    }
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return scenario.districts;
    return scenario.districts.filter(
      (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scenario.districts, searchQuery]);

  return (
    <div className="noise min-h-screen bg-[#080d1b] text-slate-200">
      <div className="flex min-h-screen">
        <Sidebar onNav={handleNav} />

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#080d1b] p-5 shadow-2xl lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="font-display font-bold text-white">Assam Health Watch</span>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <nav className="mt-8 space-y-1">
                {navItems.map(({ label, icon: Icon, active }) => (
                  <button key={label} onClick={() => handleNav(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-cyan-300/10 text-cyan-100" : "text-slate-400 hover:text-slate-200"}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Search / Command Palette Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 backdrop-blur-md bg-slate-950/80 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1327] p-4 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  type="text"
                  placeholder="Search districts, signals or pathogens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                {searchResults.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      setSelectedDistrict(d.name);
                      setSearchOpen(false);
                      toast.info(`Isolated ${d.name}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-white/[0.05]"
                  >
                    <div>
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-[10px] text-slate-400">{d.details}</div>
                    </div>
                    <RiskPill level={d.level} compact />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080d1b]/90 backdrop-blur-xl">
            <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
              <div className="flex items-center gap-3">
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 pulse-dot" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Operational view
                    </span>
                  </div>
                  <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Community health command center
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 hover:border-white/20 md:flex">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search districts...</span>
                  <kbd className="ml-4 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd>
                </button>
                
                {/* Simulator Toggle Button */}
                <button
                  onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    isSimulatorOpen ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{isSimulatorOpen ? "Close Simulator" : "What-If Simulator"}</span>
                </button>

                <button onClick={() => toast("No new notifications", { description: "Watch desk up to date." })} className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-300" />
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-9">
            {/* Interactive "What-If" Simulator Drawer */}
            {isSimulatorOpen && (
              <section className="mb-6 rounded-2xl border border-cyan-300/30 bg-cyan-950/20 p-5 backdrop-blur-lg">
                <div className="flex items-center justify-between border-b border-cyan-300/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-display font-semibold text-white">Live Environmental & Outbreak Simulator</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-200">Realtime model recalculation</span>
                </div>
                <div className="mt-4 grid gap-6 md:grid-cols-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>River Deviation (σ)</span>
                      <strong className="text-cyan-300">{simRiver > 0 ? `+${simRiver}` : simRiver}σ</strong>
                    </div>
                    <input type="range" min="-1" max="4" step="0.1" value={simRiver} onChange={(e) => setSimRiver(parseFloat(e.target.value))} className="mt-2 w-full accent-cyan-300 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Water Turbidity (NTU)</span>
                      <strong className="text-cyan-300">{simTurbidity} NTU</strong>
                    </div>
                    <input type="range" min="2" max="50" step="0.5" value={simTurbidity} onChange={(e) => setSimTurbidity(parseFloat(e.target.value))} className="mt-2 w-full accent-cyan-300 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>OTC Sales Spike (%)</span>
                      <strong className="text-cyan-300">+{simOtc}%</strong>
                    </div>
                    <input type="range" min="0" max="400" step="10" value={simOtc} onChange={(e) => setSimOtc(parseInt(e.target.value))} className="mt-2 w-full accent-cyan-300 cursor-pointer" />
                  </div>
                </div>
              </section>
            )}

            {/* Overview Hero Section */}
            <section className="fade-up flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-6 xl:flex-row xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Signal className="h-3.5 w-3.5" /> 23 sources online
                  </span>
                </div>
                <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  See the signal before it becomes an outbreak.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  AI-assisted early warning for Assam’s flood-prone communities. Adjust parameters or switch preset scenarios.
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 xl:items-end">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Preset Simulation Scenarios</div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
                  {(["baseline", "flood", "pipeline"] as ScenarioKey[]).map((key) => (
                    <button key={key} onClick={() => changeScenario(key)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${scenarioKey === key ? "bg-cyan-300 text-slate-950 shadow-[0_5px_18px_rgba(103,232,249,0.22)]" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"}`}>
                      {scenarios[key].shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Dynamic Metrics Grid */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Risk Index */}
              <div className="glass-card fade-up delay-1 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">State Risk Index <Info className="h-3 w-3 text-slate-500" /></div>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="font-display text-4xl font-semibold tracking-tight text-white">{simulatedScore}</span>
                      <span className="mb-1 text-sm text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${severity.bg} ${severity.text}`}>
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full ${severity.bar} transition-all duration-500`} style={{ width: `${simulatedScore}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                    <span>0 safe</span>
                    <span>40 watch</span>
                    <span>70 critical</span>
                  </div>
                </div>
              </div>

              {/* Selected District Card */}
              <div className="glass-card fade-up delay-2 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Isolated District</div>
                  <MapPinned className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-display text-2xl font-semibold text-white">{currentDistrictData.name}</div>
                    <div className="text-xs text-slate-400">{currentDistrictData.details}</div>
                  </div>
                  <RiskPill level={currentDistrictData.level} compact />
                </div>
              </div>

              {/* Signals Processed */}
              <div className="glass-card fade-up delay-3 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Signals Processed</div>
                  <Database className="h-4 w-4 text-violet-300" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-display text-4xl font-semibold tracking-tight text-white">1,284</span>
                  <span className="mb-1 text-xs text-emerald-300">+12.8%</span>
                </div>
                <div className="mt-3">
                  <Sparkline variant={simulatedLevel === "safe" ? "safe" : simulatedLevel === "high" ? "high" : "critical"} />
                </div>
              </div>

              {/* Interactive Response Checklist Header */}
              <div className="glass-card fade-up delay-4 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active Tasks</div>
                  <Inbox className="h-4 w-4 text-amber-300" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-display text-4xl font-semibold tracking-tight text-white">
                    {scenario.actions.length - completedActions.length}
                  </span>
                  <span className="mb-1 text-xs text-slate-400">of {scenario.actions.length} remaining</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full bg-cyan-300 transition-all duration-300"
                    style={{ width: `${(completedActions.length / Math.max(1, scenario.actions.length)) * 100}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Map & Model Visualizer */}
            <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
              <div className="glass-card fade-up delay-2 overflow-hidden rounded-2xl">
                <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <RiskPill level={simulatedLevel} />
                      <span className="text-[10px] text-slate-400">{scenario.updated}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white">{scenario.location}</h3>
                    <p className="mt-1 max-w-xl text-sm leading-5 text-slate-400">
                      {scenario.context}. {scenario.summary}
                    </p>
                  </div>
                  <button onClick={() => changeScenario(scenarioKey)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Model
                  </button>
                </div>
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <AssamMap scenario={scenario} selectedDistrict={selectedDistrict} onSelectDistrict={setSelectedDistrict} />
                  
                  <div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.035] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">
                        <CircleAlert className="h-3.5 w-3.5" /> Model Forecast
                      </div>
                      <div className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">{scenario.window}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Predicted outbreak window</p>
                      <div className="my-4 h-px bg-white/[0.07]" />
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Pathogen Profile</div>
                      <div className="mt-1 text-xs font-semibold text-slate-200">{scenario.pathogen}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-rose-200">
                      <Zap className="h-3.5 w-3.5" /> XAI confidence 0.89
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Response Action Checklist */}
              <div className="glass-card fade-up delay-3 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                    <h3 className="font-display font-semibold text-white">Field Response Plan</h3>
                    <div className="flex gap-1 rounded-lg border border-white/10 p-0.5 text-[10px]">
                      {(["all", "pending", "completed"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setActionFilter(f)}
                          className={`rounded px-2 py-1 capitalize transition ${
                            actionFilter === f ? "bg-cyan-300/20 text-cyan-200 font-bold" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {filteredActions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">No response tasks match this filter.</div>
                    ) : (
                      filteredActions.map((action) => {
                        const isDone = completedActions.includes(action.id);
                        return (
                          <div
                            key={action.id}
                            onClick={() => toggleAction(action.id, action.title)}
                            className={`group cursor-pointer rounded-xl border p-3 transition ${
                              isDone ? "border-emerald-500/20 bg-emerald-500/5 opacity-60" : "border-white/[0.08] bg-white/[0.02] hover:border-cyan-300/30"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition ${isDone ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-slate-600 group-hover:border-cyan-300"}`}>
                                {isDone && <Check className="h-3.5 w-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`text-xs font-semibold ${isDone ? "line-through text-slate-400" : "text-slate-200"}`}>{action.title}</div>
                                <div className="mt-1 text-[11px] text-slate-400">{action.detail}</div>
                                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                  <span>{action.owner}</span>
                                  <span className="font-semibold text-amber-300">Due: {action.due}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Response & Telemetry Grid */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
              {/* XAI Section */}
              <div className="glass-card fade-up delay-3 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Explainable AI</div>
                    <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Why the model is watching this</h3>
                  </div>
                  <button onClick={() => toast.success("XAI Attribution Report Generated")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                    Export XAI <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-5 space-y-4">
                  {scenario.drivers.map(({ name, value, detail, contribution, icon: Icon }, index) => (
                    <div key={name} className="group">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-cyan-200 transition group-hover:bg-cyan-300/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-200">{name}</span>
                            <span className="text-sm font-semibold text-white">{value}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-4 text-[11px] text-slate-400">
                            <span className="truncate">{detail}</span>
                            <span className="shrink-0 font-semibold text-slate-300">{contribution}% contribution</span>
                          </div>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                            <div className={`h-full rounded-full transition-all duration-700 ${index === 0 && simulatedLevel === "critical" ? "bg-rose-300" : "bg-cyan-300"}`} style={{ width: `${contribution * 2}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Chart Section with Timeframe Selector */}
              <div className="glass-card fade-up delay-4 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Environmental Telemetry</div>
                    <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-white">Hydrological trend analysis</h3>
                  </div>
                  <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[10px]">
                    {(["12h", "24h", "7d"] as const).map((t) => (
                      <button key={t} onClick={() => setTimeframe(t)} className={`rounded px-2 py-0.5 ${timeframe === t ? "bg-cyan-300/20 font-bold text-cyan-200" : "text-slate-400"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <RiverChart scenario={scenario} timeframe={timeframe} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Floating Alert Widget */}
      <div className="fixed bottom-5 right-5 z-20 max-w-[calc(100vw-2.5rem)] sm:max-w-sm">
        <div className={`flex items-start gap-3 rounded-2xl border bg-[#11192c]/95 p-3.5 shadow-2xl backdrop-blur-xl transition ${acknowledged ? "border-emerald-300/20" : "border-rose-300/20"}`}>
          <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${acknowledged ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"}`}>
            {acknowledged ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{acknowledged ? "Alert tracked" : "Attention required"}</div>
            <div className="mt-1 text-xs font-semibold leading-5 text-slate-200">{acknowledged ? "Response desk has acknowledged this signal." : `${scenario.location} has a ${simulatedLevel} risk signal.`}</div>
            {!acknowledged && (
              <button onClick={() => { setAcknowledged(true); toast.success("Alert Acknowledged"); }} className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200">
                Acknowledge alert
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
