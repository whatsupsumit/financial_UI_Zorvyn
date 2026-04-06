import { useState, useMemo, useReducer, createContext, useContext, useCallback, useEffect } from "react";

// ── Context & State Management ──
const AppContext = createContext();

const initialState = {
  role: "admin",
  searchQuery: "",
  categoryFilter: "all",
  typeFilter: "all",
  sortBy: "date-desc",
  darkMode: false,
  editingTx: null,
  showAddModal: false,
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case "SET_ROLE": return { ...state, role: action.payload };
    case "SET_SEARCH": return { ...state, searchQuery: action.payload };
    case "SET_CATEGORY_FILTER": return { ...state, categoryFilter: action.payload };
    case "SET_TYPE_FILTER": return { ...state, typeFilter: action.payload };
    case "SET_SORT": return { ...state, sortBy: action.payload };
    case "TOGGLE_DARK": return { ...state, darkMode: !state.darkMode };
    case "SET_EDITING": return { ...state, editingTx: action.payload };
    case "TOGGLE_ADD_MODAL": return { ...state, showAddModal: !state.showAddModal };
    default: return state;
  }
}

// ── Mock Data ──
const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Bills & Utilities", "Health", "Education", "Freelance", "Salary", "Investments"];
const CAT_COLORS = {
  "Food & Dining": "#e07a5f", Transport: "#3d85c6", Shopping: "#f4a261",
  Entertainment: "#e76f51", "Bills & Utilities": "#264653", Health: "#2a9d8f",
  Education: "#6c5ce7", Freelance: "#00b894", Salary: "#0984e3", Investments: "#6c5ce7"
};

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

const generateTransactions = (): Transaction[] => {
  const txs: Transaction[] = [
    { id: 1, date: "2026-04-05", description: "Grocery run at Fresh Market", amount: 2340, category: "Food & Dining", type: "expense" },
    { id: 2, date: "2026-04-04", description: "Monthly salary — April", amount: 85000, category: "Salary", type: "income" },
    { id: 3, date: "2026-04-04", description: "Uber to office", amount: 380, category: "Transport", type: "expense" },
    { id: 4, date: "2026-04-03", description: "Netflix subscription", amount: 649, category: "Entertainment", type: "expense" },
    { id: 5, date: "2026-04-03", description: "Electricity bill — March", amount: 1870, category: "Bills & Utilities", type: "expense" },
    { id: 6, date: "2026-04-02", description: "Freelance project payment", amount: 15000, category: "Freelance", type: "income" },
    { id: 7, date: "2026-04-02", description: "New running shoes", amount: 4500, category: "Shopping", type: "expense" },
    { id: 8, date: "2026-04-01", description: "Doctor consultation", amount: 800, category: "Health", type: "expense" },
    { id: 9, date: "2026-04-01", description: "Online course — React Advanced", amount: 2999, category: "Education", type: "expense" },
    { id: 10, date: "2026-04-01", description: "Dividend income", amount: 3200, category: "Investments", type: "income" },
    { id: 11, date: "2026-03-31", description: "Weekend brunch", amount: 1200, category: "Food & Dining", type: "expense" },
    { id: 12, date: "2026-03-30", description: "Metro card recharge", amount: 500, category: "Transport", type: "expense" },
    { id: 13, date: "2026-03-29", description: "Amazon — headphones", amount: 3200, category: "Shopping", type: "expense" },
    { id: 14, date: "2026-03-28", description: "Gym membership", amount: 1500, category: "Health", type: "expense" },
    { id: 15, date: "2026-03-27", description: "Freelance — logo design", amount: 8000, category: "Freelance", type: "income" },
    { id: 16, date: "2026-03-26", description: "Water bill", amount: 450, category: "Bills & Utilities", type: "expense" },
    { id: 17, date: "2026-03-25", description: "Birthday gift for Priya", amount: 2000, category: "Shopping", type: "expense" },
    { id: 18, date: "2026-03-24", description: "Lunch with team", amount: 960, category: "Food & Dining", type: "expense" },
    { id: 19, date: "2026-03-23", description: "Monthly salary — March", amount: 85000, category: "Salary", type: "income" },
    { id: 20, date: "2026-03-22", description: "Movie tickets", amount: 700, category: "Entertainment", type: "expense" },
    { id: 21, date: "2026-03-20", description: "Internet bill", amount: 999, category: "Bills & Utilities", type: "expense" },
    { id: 22, date: "2026-03-18", description: "Petrol", amount: 2200, category: "Transport", type: "expense" },
    { id: 23, date: "2026-03-15", description: "Mutual fund SIP", amount: 5000, category: "Investments", type: "expense" },
    { id: 24, date: "2026-03-10", description: "Dental checkup", amount: 1200, category: "Health", type: "expense" },
  ];
  return txs;
};

// ── Helpers ──
const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");
const fmtDate = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const relDate = (d: string) => {
  const today = new Date("2026-04-05");
  const date = new Date(d + "T00:00:00");
  const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return fmtDate(d);
};

// ── Icons (inline SVG) ──
const Icons = {
  wallet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"/></svg>,
  up: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  down: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  arrowIn: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
  arrowOut: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10M7 17 17 7"/></svg>,
  bulb: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
  filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
};

// ── Mini Bar Chart (SVG) ──
function MiniBarChart({ data, height = 120, dark }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(32, (280 / data.length) - 4);
  const totalW = data.length * (barW + 4);
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${height + 24}`} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const h = (d.value / max) * height;
        return (
          <g key={i} transform={`translate(${i * (barW + 4)}, 0)`}>
            <rect y={height - h} width={barW} height={h} rx={4}
              fill={d.color || (dark ? "#6366f1" : "#4f46e5")} opacity={0.85} />
            <text x={barW / 2} y={height + 14} textAnchor="middle"
              fontSize="9" fill={dark ? "#94a3b8" : "#64748b"} fontFamily="inherit">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart (SVG) ──
function DonutChart({ data, size = 160, dark }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - 20) / 2;
  const cx = size / 2, cy = size / 2;
  let cumAngle = -90;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, endAngle: start + angle, pct: ((d.value / total) * 100).toFixed(1) };
  });
  const toRad = a => (a * Math.PI) / 180;
  const arcPath = (start, end) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={arcPath(s.startAngle, s.endAngle - 0.5)}
          fill="none" stroke={s.color} strokeWidth={20} strokeLinecap="butt" />
      ))}
      <circle cx={cx} cy={cy} r={r - 16} fill={dark ? "#1e293b" : "#ffffff"} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700"
        fill={dark ? "#f1f5f9" : "#1e293b"} fontFamily="inherit">{fmt(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10"
        fill={dark ? "#94a3b8" : "#64748b"} fontFamily="inherit">total spent</text>
    </svg>
  );
}

// ── Sparkline ──
function Sparkline({ data, width = 200, height = 40, color = "#4f46e5" }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3" fill={color} />
    </svg>
  );
}

// ── Line Chart for Balance Trend ──
function BalanceTrendChart({ transactions, dark }) {
  const days = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date("2026-04-05");
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  let balance = 50000;
  const balances = days.map(day => {
    const dayTxs = transactions.filter(t => t.date === day);
    dayTxs.forEach(t => { balance += t.type === "income" ? t.amount : -t.amount; });
    return { day, balance };
  });
  const max = Math.max(...balances.map(b => b.balance));
  const min = Math.min(...balances.map(b => b.balance));
  const range = max - min || 1;
  const W = 500, H = 160, pad = { t: 10, b: 24, l: 0, r: 0 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const pts = balances.map((b, i) => ({
    x: pad.l + (i / (balances.length - 1)) * iW,
    y: pad.t + iH - ((b.balance - min) / range) * iH
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${H - pad.b} L ${pts[0].x} ${H - pad.b} Z`;
  const labelIndices = [0, 7, 15, 22, 30].filter(i => i < balances.length);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark ? "#818cf8" : "#4f46e5"} stopOpacity="0.2" />
          <stop offset="100%" stopColor={dark ? "#818cf8" : "#4f46e5"} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + iH * (1 - f)} y2={pad.t + iH * (1 - f)}
          stroke={dark ? "#334155" : "#e2e8f0"} strokeWidth="1" />
      ))}
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke={dark ? "#818cf8" : "#4f46e5"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4"
        fill={dark ? "#818cf8" : "#4f46e5"} stroke={dark ? "#1e293b" : "#fff"} strokeWidth="2" />
      {labelIndices.map(i => (
        <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fontSize="9"
          fill={dark ? "#94a3b8" : "#94a3b8"} fontFamily="inherit">
          {new Date(balances[i].day + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </text>
      ))}
    </svg>
  );
}

// ── Summary Card ──
function SummaryCard({ icon, label, value, sub, color, sparkData, dark }) {
  return (
    <div style={{
      background: dark ? "#1e293b" : "#ffffff",
      borderRadius: 16, padding: "20px 22px",
      border: `1px solid ${dark ? "#334155" : "#f1f5f9"}`,
      flex: "1 1 200px", minWidth: 200,
      display: "flex", flexDirection: "column", gap: 12,
      transition: "all 0.2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          background: color + "18", color: color
        }}>{icon}</div>
        {sparkData && <Sparkline data={sparkData} width={80} height={28} color={color} />}
      </div>
      <div>
        <div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b", marginBottom: 4, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.5px" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Add/Edit Transaction Modal ──
function TxModal({ tx, onSave, onClose, dark }) {
  const [form, setForm] = useState(tx || {
    description: "", amount: "", category: "Food & Dining", type: "expense", date: "2026-04-05"
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14, fontFamily: "inherit",
    border: `1px solid ${dark ? "#475569" : "#e2e8f0"}`,
    background: dark ? "#0f172a" : "#f8fafc", color: dark ? "#f1f5f9" : "#0f172a",
    outline: "none", boxSizing: "border-box",
  };
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: dark ? "#1e293b" : "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420,
        border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a" }}>
            {tx ? "Edit Transaction" : "New Transaction"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#94a3b8" : "#64748b" }}>{Icons.x}</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["expense", "income"].map(t => (
              <button key={t} onClick={() => set("type", t)} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", transition: "all 0.15s",
                background: form.type === t ? (t === "income" ? "#10b981" : "#ef4444") : (dark ? "#0f172a" : "#f1f5f9"),
                color: form.type === t ? "#fff" : (dark ? "#94a3b8" : "#64748b"),
              }}>{t === "income" ? "Income" : "Expense"}</button>
            ))}
          </div>
          <input placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)} style={inputStyle} />
          <input placeholder="Amount" type="number" value={form.amount} onChange={e => set("amount", e.target.value)} style={inputStyle} />
          <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
          <button onClick={() => { if (form.description && form.amount) onSave(form); }} style={{
            padding: "12px 0", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", background: dark ? "#6366f1" : "#4f46e5", color: "#fff", marginTop: 4,
            opacity: (form.description && form.amount) ? 1 : 0.5,
          }}>
            {tx ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab system ──
const TABS = ["Overview", "Transactions", "Insights"];

// ── Main App ──
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("fintrack_txs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse transactions from local storage", e);
      }
    }
    return generateTransactions();
  });
  
  useEffect(() => {
    localStorage.setItem("fintrack_txs", JSON.stringify(transactions));
  }, [transactions]);

  const [activeTab, setActiveTab] = useState("Overview");
  const dk = state.darkMode;

  const isAdmin = state.role === "admin";

  // Derived data
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense + 50000 };
  }, [transactions]);

  const filtered = useMemo(() => {
    let f = [...transactions];
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      f = f.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    if (state.categoryFilter !== "all") f = f.filter(t => t.category === state.categoryFilter);
    if (state.typeFilter !== "all") f = f.filter(t => t.type === state.typeFilter);
    const [key, dir] = state.sortBy.split("-");
    f.sort((a, b) => {
      const mul = dir === "asc" ? 1 : -1;
      if (key === "date") return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return mul * (a.amount - b.amount);
    });
    return f;
  }, [transactions, state.searchQuery, state.categoryFilter, state.typeFilter, state.sortBy]);

  const catBreakdown = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([cat, val]) => ({ label: cat, value: val, color: CAT_COLORS[cat] || "#94a3b8" }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr"];
    return months.map((m, i) => {
      const monthTxs = transactions.filter(t => {
        const d = new Date(t.date + "T00:00:00");
        return d.getMonth() === i;
      });
      const exp = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: m, value: exp || [12000, 18500, 22000, 14000][i], color: i === 3 ? (dk ? "#818cf8" : "#4f46e5") : (dk ? "#475569" : "#cbd5e1") };
    });
  }, [transactions, dk]);

  const handleAdd = useCallback((form) => {
    setTransactions(prev => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...prev]);
    dispatch({ type: "TOGGLE_ADD_MODAL" });
  }, []);

  const handleEdit = useCallback((form) => {
    setTransactions(prev => prev.map(t => t.id === state.editingTx.id ? { ...t, ...form, amount: Number(form.amount) } : t));
    dispatch({ type: "SET_EDITING", payload: null });
  }, [state.editingTx]);

  const handleDelete = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const exportCSV = () => {
    const rows = [["Date", "Description", "Amount", "Category", "Type"],
      ...transactions.map(t => [t.date, t.description, t.amount, t.category, t.type])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv";
    a.click();
  };

  const bg = dk ? "#0f172a" : "#f8fafc";
  const card = dk ? "#1e293b" : "#ffffff";
  const border = dk ? "#334155" : "#f1f5f9";
  const text1 = dk ? "#f1f5f9" : "#0f172a";
  const text2 = dk ? "#94a3b8" : "#64748b";
  const text3 = dk ? "#64748b" : "#94a3b8";

  const insights = useMemo(() => {
    const topCat = catBreakdown[0];
    const incTxs = transactions.filter(t => t.type === "income");
    const expTxs = transactions.filter(t => t.type === "expense");
    const avgExp = expTxs.length ? (expTxs.reduce((s, t) => s + t.amount, 0) / expTxs.length) : 0;
    const biggestTx = expTxs.sort((a, b) => b.amount - a.amount)[0];
    const savingsRate = totals.income > 0 ? (((totals.income - totals.expense) / totals.income) * 100).toFixed(1) : 0;
    return { topCat, avgExp, biggestTx, savingsRate, incomeStreams: incTxs.length, expCount: expTxs.length };
  }, [transactions, catBreakdown, totals]);

  return (
    <div style={{
      minHeight: "100vh", background: bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: text1, transition: "background 0.3s, color 0.3s", lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{
        background: card, borderBottom: `1px solid ${border}`, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: dk ? "#6366f1" : "#4f46e5",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff"
          }}>{Icons.wallet}</div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>Fintrack</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <select value={state.role} onChange={e => dispatch({ type: "SET_ROLE", payload: e.target.value })} style={{
            padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            border: `1px solid ${border}`, background: dk ? "#0f172a" : "#f1f5f9", color: text1, cursor: "pointer"
          }}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button onClick={() => dispatch({ type: "TOGGLE_DARK" })} style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`,
            background: dk ? "#0f172a" : "#f1f5f9", color: text2, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{dk ? Icons.sun : Icons.moon}</button>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: dk ? "#6366f1" : "#4f46e5",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            fontSize: 13, fontWeight: 700
          }}>A</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 40px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: dk ? "#1e293b" : "#f1f5f9", borderRadius: 14, padding: 4, width: "fit-content" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
              background: activeTab === tab ? (dk ? "#0f172a" : "#fff") : "transparent",
              color: activeTab === tab ? text1 : text2,
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <SummaryCard icon={Icons.wallet} label="Total Balance" value={fmt(totals.balance)}
                sub="Updated just now" color={dk ? "#818cf8" : "#4f46e5"} sparkData={[50000, 52000, 48000, 65000, 58000, 72000, totals.balance / 1000]} dark={dk} />
              <SummaryCard icon={Icons.up} label="Income" value={fmt(totals.income)}
                sub={`${transactions.filter(t => t.type === "income").length} transactions`} color="#10b981"
                sparkData={[20, 35, 28, 45, 38, 50, totals.income / 2000]} dark={dk} />
              <SummaryCard icon={Icons.down} label="Expenses" value={fmt(totals.expense)}
                sub={`${transactions.filter(t => t.type === "expense").length} transactions`} color="#ef4444"
                sparkData={[15, 22, 18, 30, 25, 20, totals.expense / 2000]} dark={dk} />
            </div>

            {/* Charts Row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{
                flex: "2 1 380px", background: card, borderRadius: 16, padding: 22,
                border: `1px solid ${border}`, minWidth: 0
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: text1 }}>Balance Trend</div>
                <div style={{ fontSize: 12, color: text2, marginBottom: 16 }}>Last 30 days</div>
                <BalanceTrendChart transactions={transactions} dark={dk} />
              </div>
              <div style={{
                flex: "1 1 260px", background: card, borderRadius: 16, padding: 22,
                border: `1px solid ${border}`, minWidth: 0
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: text1 }}>Spending by Category</div>
                <div style={{ fontSize: 12, color: text2, marginBottom: 12 }}>This period</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <DonutChart data={catBreakdown} size={150} dark={dk} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center" }}>
                    {catBreakdown.slice(0, 5).map(c => (
                      <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: text2 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 3, background: c.color }} />
                        {c.label.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: text1 }}>Monthly Expenses</div>
              <div style={{ fontSize: 12, color: text2, marginBottom: 16 }}>Comparing last 4 months</div>
              <div style={{ maxWidth: 300 }}>
                <MiniBarChart data={monthlyData} dark={dk} />
              </div>
            </div>

            {/* Recent Transactions */}
            <div style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: text1 }}>Recent Transactions</div>
                  <div style={{ fontSize: 12, color: text2 }}>Latest activity</div>
                </div>
                <button onClick={() => setActiveTab("Transactions")} style={{
                  background: "none", border: "none", fontSize: 13, color: dk ? "#818cf8" : "#4f46e5",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}>View all →</button>
              </div>
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0",
                  borderBottom: `1px solid ${border}`, gap: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: (CAT_COLORS[t.category] || "#94a3b8") + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: CAT_COLORS[t.category] || "#94a3b8", fontSize: 14
                    }}>{t.type === "income" ? "↗" : "↙"}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                      <div style={{ fontSize: 11, color: text3 }}>{t.category} · {relDate(t.date)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.type === "income" ? "#10b981" : text1, whiteSpace: "nowrap" }}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "Transactions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Toolbar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{
                flex: "1 1 200px", display: "flex", alignItems: "center", gap: 8,
                background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "0 14px",
              }}>
                <span style={{ color: text3 }}>{Icons.search}</span>
                <input value={state.searchQuery} onChange={e => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                  placeholder="Search transactions..." style={{
                    border: "none", background: "transparent", padding: "10px 0", fontSize: 13, width: "100%",
                    fontFamily: "inherit", color: text1, outline: "none"
                  }} />
              </div>
              <select value={state.categoryFilter} onChange={e => dispatch({ type: "SET_CATEGORY_FILTER", payload: e.target.value })}
                style={{
                  padding: "9px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  border: `1px solid ${border}`, background: card, color: text1, cursor: "pointer"
                }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={state.typeFilter} onChange={e => dispatch({ type: "SET_TYPE_FILTER", payload: e.target.value })}
                style={{
                  padding: "9px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  border: `1px solid ${border}`, background: card, color: text1, cursor: "pointer"
                }}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select value={state.sortBy} onChange={e => dispatch({ type: "SET_SORT", payload: e.target.value })}
                style={{
                  padding: "9px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  border: `1px solid ${border}`, background: card, color: text1, cursor: "pointer"
                }}>
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={exportCSV} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 12, border: `1px solid ${border}`,
                  background: card, color: text2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}>{Icons.download} CSV</button>
                {isAdmin && (
                  <button onClick={() => dispatch({ type: "TOGGLE_ADD_MODAL" })} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12,
                    border: "none", background: dk ? "#6366f1" : "#4f46e5", color: "#fff",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                  }}>{Icons.plus} Add</button>
                )}
              </div>
            </div>

            {/* Transaction List */}
            <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: text1 }}>No transactions found</div>
                  <div style={{ fontSize: 13, color: text2 }}>Try adjusting your filters</div>
                </div>
              ) : (
                filtered.map((t, i) => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none", gap: 12,
                    transition: "background 0.1s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: (CAT_COLORS[t.category] || "#94a3b8") + "15",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: CAT_COLORS[t.category] || "#94a3b8", fontSize: 16
                      }}>{t.type === "income" ? "↗" : "↙"}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                        <div style={{ fontSize: 12, color: text2, display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                          <span style={{
                            padding: "1px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                            background: (CAT_COLORS[t.category] || "#94a3b8") + "15",
                            color: CAT_COLORS[t.category] || "#94a3b8"
                          }}>{t.category}</span>
                          <span>{relDate(t.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? "#10b981" : text1, whiteSpace: "nowrap" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => dispatch({ type: "SET_EDITING", payload: t })} style={{
                            width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                            background: dk ? "#334155" : "#f1f5f9", color: text2,
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>{Icons.edit}</button>
                          <button onClick={() => handleDelete(t.id)} style={{
                            width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                            background: dk ? "#334155" : "#f1f5f9", color: "#ef4444",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>{Icons.trash}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ fontSize: 12, color: text3, textAlign: "center" }}>
              Showing {filtered.length} of {transactions.length} transactions
              {!isAdmin && <span> · Switch to Admin role to edit</span>}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "Insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* Top Spending */}
              <div style={{
                flex: "1 1 300px", background: card, borderRadius: 16, padding: 22,
                border: `1px solid ${border}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ color: "#e07a5f" }}>{Icons.bulb}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: text1 }}>Top Spending Category</span>
                </div>
                {insights.topCat && (
                  <div>
                    <div style={{
                      display: "inline-block", padding: "6px 14px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                      background: (CAT_COLORS[insights.topCat.label] || "#94a3b8") + "18",
                      color: CAT_COLORS[insights.topCat.label]
                    }}>{insights.topCat.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: text1, letterSpacing: "-0.5px" }}>{fmt(insights.topCat.value)}</div>
                    <div style={{ fontSize: 12, color: text2, marginTop: 4 }}>
                      {((insights.topCat.value / totals.expense) * 100).toFixed(1)}% of total spending
                    </div>
                    <div style={{ marginTop: 16 }}>
                      {catBreakdown.slice(0, 5).map(c => (
                        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ flex: 1, fontSize: 12, color: text2, whiteSpace: "nowrap" }}>{c.label}</div>
                          <div style={{ flex: 2, height: 6, borderRadius: 3, background: dk ? "#334155" : "#f1f5f9", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, width: `${(c.value / catBreakdown[0].value) * 100}%`, background: c.color, transition: "width 0.5s" }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: text1, minWidth: 60, textAlign: "right" }}>{fmt(c.value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div style={{
                flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 16
              }}>
                {[
                  { label: "Savings Rate", value: `${insights.savingsRate}%`, sub: "of income saved this period", color: "#10b981", icon: "📈" },
                  { label: "Avg. Transaction", value: fmt(insights.avgExp), sub: `across ${insights.expCount} expenses`, color: dk ? "#818cf8" : "#4f46e5", icon: "📊" },
                  { label: "Biggest Expense", value: insights.biggestTx ? fmt(insights.biggestTx.amount) : "—", sub: insights.biggestTx?.description || "", color: "#ef4444", icon: "💸" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: card, borderRadius: 16, padding: 20, border: `1px solid ${border}`,
                    display: "flex", alignItems: "center", gap: 16
                  }}>
                    <div style={{ fontSize: 28 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: text2, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: text1, letterSpacing: "-0.3px" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: text3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Comparison */}
            <div style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: text1 }}>Monthly Expense Comparison</div>
              <div style={{ fontSize: 12, color: text2, marginBottom: 16 }}>How your spending stacks up</div>
              <div style={{ maxWidth: 320 }}>
                <MiniBarChart data={monthlyData} height={140} dark={dk} />
              </div>
              <div style={{
                marginTop: 16, padding: "14px 16px", borderRadius: 12,
                background: dk ? "#0f172a" : "#f8fafc", fontSize: 13, color: text2, lineHeight: 1.6
              }}>
                💡 Your April spending is trending{" "}
                <strong style={{ color: "#10b981" }}>lower</strong> than March — a good sign. Keep an eye on {insights.topCat?.label || "spending"} as it accounts for the biggest chunk.
              </div>
            </div>

            {/* Income vs Expense */}
            <div style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: text1 }}>Income vs Expenses</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 12, color: text2, marginBottom: 6 }}>Income</div>
                  <div style={{ height: 10, borderRadius: 5, background: dk ? "#334155" : "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 5, background: "#10b981", width: `${(totals.income / (totals.income + totals.expense)) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", marginTop: 6 }}>{fmt(totals.income)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 12, color: text2, marginBottom: 6 }}>Expenses</div>
                  <div style={{ height: 10, borderRadius: 5, background: dk ? "#334155" : "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 5, background: "#ef4444", width: `${(totals.expense / (totals.income + totals.expense)) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", marginTop: 6 }}>{fmt(totals.expense)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {state.showAddModal && <TxModal onSave={handleAdd} onClose={() => dispatch({ type: "TOGGLE_ADD_MODAL" })} dark={dk} />}
      {state.editingTx && <TxModal tx={state.editingTx} onSave={handleEdit} onClose={() => dispatch({ type: "SET_EDITING", payload: null })} dark={dk} />}
    </div>
  );
}
