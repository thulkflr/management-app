'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3,
    ArrowUpRight, ArrowDownRight, Lightbulb, FolderKanban,
    Users, Clock, CheckSquare, Camera, Calendar, Sparkles,
    ArrowRight, Zap, Gamepad2
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import NumberTicker from '@/components/ui/number-ticker';
import { calculateProfits } from '@/services/profitCalculator';
import ShutterSpeedGame from '@/components/ShutterSpeedGame';
import SnakeGame from '@/components/SnakeGame';

// ── Animation variants ──────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(5px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
};

// ── Normalize Checklist Packed Status ─────────────────────────────────────────
function normalizePacked(item) {
    if (!item) return false;
    const val = item.isPacked ?? item.completed ?? item.packed ?? item.status;
    if (typeof val === 'boolean') return val;
    if (val == null) return false;
    const s = String(val).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === '1' || s === 'packed' || s === 'done' || s === 'completed';
}

// ── Status color maps ───────────────────────────────────────────────────────
const PROJECT_COLORS = {
    'In Progress': '#3b82f6', 'Active': '#3b82f6',
    'Completed': '#10b981', 'Done': '#10b981', 'Complete': '#10b981',
    'Planning': '#f59e0b', 'Pre-Production': '#f59e0b',
    'On Hold': '#eab308', 'Paused': '#eab308',
    'Cancelled': '#ef4444',
};
const IDEA_COLORS = {
    'Concept': '#f59e0b', 'Draft': '#f59e0b',
    'In Progress': '#3b82f6', 'In Review': '#8b5cf6',
    'Done': '#10b981', 'Approved': '#10b981',
    'Archived': '#6b7280', 'Rejected': '#ef4444',
};
const fallbackColor = '#c5a022';

// ── GrowthChart (SVG) ───────────────────────────────────────────────────────
function GrowthChart({ transactions = [] }) {
    const months = useMemo(() => {
        const rawTxs = Array.isArray(transactions) ? transactions : [];
        const now = new Date();
        const map = {};

        // Pre-fill the last 6 calendar months (including current month)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const fullLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            map[key] = { key, label, fullLabel, income: 0, expense: 0 };
        }

        // Fill transaction totals
        rawTxs.forEach(tx => {
            if (!tx || !tx.date) return;
            const d = new Date(tx.date);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (map[key]) {
                const amt = Math.abs(Number(String(tx.amount).replace(/[^0-9.-]+/g, '')) || 0);
                if (tx.type === 'income')  map[key].income  += amt;
                if (tx.type === 'expense') map[key].expense += amt;
            }
        });

        return Object.values(map);
    }, [transactions]);

    const maxVal = Math.max(...months.flatMap(m => [m.income, m.expense]), 100);

    const W = 540, H = 210;
    const PL = 55, PR = 15, PT = 22, PB = 40;
    const chartW = W - PL - PR;
    const chartH = H - PT - PB;

    const colW = chartW / months.length;
    const barW = Math.min(22, colW * 0.32);

    const barTop = (val) => PT + chartH - (val / maxVal) * chartH;
    const barHeight = (val) => (val / maxVal) * chartH;
    const fmt = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`;

    const gridPcts = [0.25, 0.5, 0.75, 1];

    return (
        <div style={{ color: 'var(--foreground)' }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
                    </linearGradient>
                </defs>

                <style>{`
                    .gc-grid  { stroke: currentColor; opacity: 0.08; }
                    .gc-axis  { stroke: currentColor; opacity: 0.15; }
                    .gc-label { fill: currentColor; opacity: 0.4; font-family: inherit; }
                    .gc-val   { fill: currentColor; opacity: 0.75; font-family: inherit; }
                `}</style>

                {gridPcts.map((pct) => {
                    const y = PT + chartH * (1 - pct);
                    return (
                        <g key={pct}>
                            <line x1={PL} y1={y} x2={W - PR} y2={y} className="gc-grid" strokeDasharray="3 3" />
                            <text x={PL - 6} y={y + 3} textAnchor="end" className="gc-label" fontSize="9" fontWeight="bold">
                                {fmt(maxVal * pct)}
                            </text>
                        </g>
                    );
                })}

                <line x1={PL} y1={PT + chartH} x2={W - PR} y2={PT + chartH} className="gc-axis" strokeWidth="1" />

                {months.map((m, idx) => {
                    const colX = PL + idx * colW;
                    const incX = colX + colW / 2 - barW - 2;
                    const expX = colX + colW / 2 + 2;

                    const incH = barHeight(m.income);
                    const incY = barTop(m.income);

                    const expH = barHeight(m.expense);
                    const expY = barTop(m.expense);

                    return (
                        <g key={m.key} className="group/bar cursor-pointer">
                            <rect x={colX} y={PT} width={colW} height={chartH} fill="transparent" />

                            {/* Income Bar */}
                            <rect x={incX} y={incY} width={barW} height={Math.max(incH, 2)} rx="4" fill="url(#incomeGrad)" className="transition-all duration-200 group-hover/bar:brightness-125" />
                            <text x={incX + barW / 2} y={Math.max(incY - 5, PT + 8)} textAnchor="middle" className="gc-val opacity-0 group-hover/bar:opacity-100 transition-opacity" fontSize="8" fontWeight="black">
                                {m.income > 0 ? fmt(m.income) : ''}
                            </text>

                            {/* Expense Bar */}
                            <rect x={expX} y={expY} width={barW} height={Math.max(expH, 2)} rx="4" fill="url(#expenseGrad)" className="transition-all duration-200 group-hover/bar:brightness-125" />
                            <text x={expX + barW / 2} y={Math.max(expY - 5, PT + 8)} textAnchor="middle" className="gc-val opacity-0 group-hover/bar:opacity-100 transition-opacity" fontSize="8" fontWeight="black">
                                {m.expense > 0 ? fmt(m.expense) : ''}
                            </text>

                            {/* Month Label */}
                            <text x={colX + colW / 2} y={H - 10} textAnchor="middle" className="gc-label" fontSize="9.5" fontWeight="bold">
                                {m.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ── Helper Widgets ──────────────────────────────────────────────────────────
function StatusBreakdown({ items = [], colorMap = {}, emptyText = 'No data' }) {
    const raw = Array.isArray(items) ? items : [];
    const counts = useMemo(() => {
        const map = {};
        raw.forEach(item => {
            const st = item.status || item.category || 'Other';
            map[st] = (map[st] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [raw]);

    const total = raw.length;
    if (total === 0) return <p className="text-center py-8 text-foreground/20 text-sm italic">{emptyText}</p>;

    return (
        <div className="space-y-3">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5 p-0.5 gap-0.5">
                {counts.map(([status, count]) => {
                    const color = colorMap[status] || fallbackColor;
                    const pct = ((count / total) * 100).toFixed(1);
                    return (
                        <div key={status} style={{ width: `${pct}%`, backgroundColor: color }} className="h-full rounded-full transition-all duration-500 opacity-90 hover:opacity-100" title={`${status}: ${count} (${pct}%)`} />
                    );
                })}
            </div>
            <div className="space-y-2 pt-1">
                {counts.map(([status, count]) => {
                    const color = colorMap[status] || fallbackColor;
                    const pct = Math.round((count / total) * 100);
                    return (
                        <div key={status} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-bold text-foreground/70">{status}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                                <span className="font-black text-foreground">{count}</span>
                                <span className="text-[10px] text-foreground/30 font-sans">({pct}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RecentTransactions({ transactions = [] }) {
    const raw = Array.isArray(transactions) ? transactions : [];
    const sorted = useMemo(() => {
        return [...raw]
            .filter(t => t && t.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [raw]);

    if (sorted.length === 0) return <p className="text-center py-8 text-foreground/20 text-sm italic">No transactions yet</p>;

    return (
        <div className="space-y-2">
            {sorted.map(tx => {
                const isIncome = tx.type === 'income';
                const isCapital = tx.type === 'capital';
                const amt = Math.abs(Number(String(tx.amount).replace(/[^0-9.-]+/g, '')) || 0);
                return (
                    <div key={tx.id || Math.random()} className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border hover:border-brand-gold/20 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isCapital ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {isIncome ? <ArrowUpRight size={14} /> : isCapital ? <Wallet size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground leading-none mb-1 group-hover:text-brand-gold transition-colors">{tx.category || tx.description || 'Transaction'}</p>
                                <p className="text-[9px] text-foreground/30 font-medium">{tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-black tabular ${isIncome ? 'text-emerald-400' : isCapital ? 'text-brand-gold' : 'text-foreground/70'}`}>
                            {tx.type === 'expense' ? '-' : '+'}${amt.toLocaleString()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function RecentProjects({ projects = [] }) {
    const raw = Array.isArray(projects) ? projects : [];
    const recent = useMemo(() => {
        return [...raw]
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 4);
    }, [raw]);

    if (recent.length === 0) return <p className="text-center py-8 text-foreground/20 text-sm italic">No projects yet</p>;

    return (
        <div className="space-y-2.5">
            {recent.map(p => {
                const color = PROJECT_COLORS[p.status] || fallbackColor;
                return (
                    <div key={p.id || Math.random()} className="p-3 rounded-xl bg-background border border-card-border hover:border-brand-gold/20 transition-colors group flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-gold transition-colors">{p.title}</h4>
                            <p className="text-[9px] text-foreground/35 font-medium mt-0.5">{p.category || 'General'}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-white/5 flex-shrink-0" style={{ color, backgroundColor: `${color}15` }}>
                            {p.status || 'Active'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ChecklistProgress({ checklist = [] }) {
    const raw = Array.isArray(checklist) ? checklist : [];
    const total = raw.length;
    const completed = useMemo(() => raw.filter(normalizePacked).length, [raw]);
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Gear Checklist</p>
                    <p className="text-xl font-black text-foreground tracking-tight mt-0.5">{completed} <span className="text-xs font-normal text-foreground/40">/ {total} items ready</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center font-black text-brand-gold text-sm shadow-inner">
                    {pct}%
                </div>
            </div>

            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="bg-gradient-to-r from-brand-gold/70 to-brand-gold h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>

            <div className="space-y-2 pt-1">
                {raw.length === 0 ? (
                    <p className="text-center py-4 text-foreground/20 text-xs italic">No gear items added</p>
                ) : (
                    raw.slice(0, 4).map(item => {
                        const isDone = normalizePacked(item);
                        return (
                            <div key={item.id || item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-background border border-card-border">
                                <span className={`font-bold truncate max-w-[180px] ${isDone ? 'line-through text-foreground/30' : 'text-foreground/80'}`}>
                                    {item.name || item.title || 'Gear Item'}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex-shrink-0 ${isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {isDone ? 'Packed' : 'Needed'}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ── Dynamic Operational Components ───────────────────────────────────────────
function UpcomingShootBanner({ projects = [] }) {
    const raw = Array.isArray(projects) ? projects : [];
    const upcoming = useMemo(() => {
        if (raw.length === 0) return null;
        const valid = raw.filter(p => p && p.date && p.status !== 'completed' && p.status !== 'Completed');
        if (valid.length === 0) return null;
        return [...valid].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    }, [raw]);

    if (!upcoming) return null;

    const shootDate = new Date(upcoming.date);
    const isValid = shootDate instanceof Date && !isNaN(shootDate.getTime());
    const dateFormatted = isValid
        ? shootDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
        : 'Scheduled';
    const timeFormatted = isValid
        ? shootDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-card-bg to-card-bg p-6 md:p-7 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold flex-shrink-0 shadow-lg shadow-brand-gold/10">
                        <Camera size={24} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold text-[9px] font-black uppercase tracking-widest border border-brand-gold/25">
                                Next Scheduled Session
                            </span>
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                                {upcoming.category || 'General'}
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                            {upcoming.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1.5 text-brand-gold font-black">
                                <Calendar size={13} /> {dateFormatted} {timeFormatted ? `at ${timeFormatted}` : ''}
                            </span>
                            {upcoming.createdBy && (
                                <span className="flex items-center gap-1 text-foreground/40">
                                    • Photographer: <strong className="text-foreground/80">{upcoming.createdBy}</strong>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Link
                    href="/projects"
                    className="flex items-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-[1.03] active:scale-95 transition-all self-stretch md:self-auto justify-center"
                >
                    View Projects <ArrowRight size={14} />
                </Link>
            </div>
        </motion.div>
    );
}

function QuickLaunchpad() {
    const shortcuts = [
        { label: 'Project Hub', desc: 'Active shoots & events', href: '/projects', icon: FolderKanban, color: 'text-brand-gold', bg: 'bg-brand-gold/10', border: 'border-brand-gold/20' },
        { label: 'Creative Ideas', desc: 'Explore concept catalog', href: '/ideas', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        { label: 'Gear Checklist', desc: 'Equipment readiness', href: '/checklist', icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        { label: 'Tasks Board', desc: 'Production workflow', href: '/tasks', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    ];

    return (
        <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                    <Sparkles size={13} className="text-brand-gold" /> Studio Quick Launchpad
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {shortcuts.map(sc => {
                    const Icon = sc.icon;
                    return (
                        <Link key={sc.label} href={sc.href}
                            className={`group p-4 rounded-2xl bg-card-bg border border-card-border hover:${sc.border} hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`w-9 h-9 rounded-xl ${sc.bg} border ${sc.border} flex items-center justify-center ${sc.color} group-hover:scale-110 transition-transform`}>
                                    <Icon size={18} />
                                </div>
                                <ArrowUpRight size={14} className="text-foreground/20 group-hover:text-brand-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-foreground group-hover:text-brand-gold transition-colors leading-tight">
                                    {sc.label}
                                </h3>
                                <p className="text-[9px] font-bold text-foreground/35 mt-0.5 leading-snug">
                                    {sc.desc}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ── Interactive Arcade Bar ──────────────────────────────────────────────────
function ArcadeZone() {
    const [activeTab, setActiveTab] = useState('snake'); // 'snake' | 'shutter'

    return (
        <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                    <Gamepad2 size={15} className="text-emerald-400" /> Member Arcade & Break Room
                </h2>
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card-bg border border-card-border">
                    <button
                        onClick={() => setActiveTab('snake')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'snake'
                                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                : 'text-foreground/40 hover:text-foreground'
                        }`}
                    >
                        🐍 Atari Snake
                    </button>
                    <button
                        onClick={() => setActiveTab('shutter')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'shutter'
                                ? 'bg-brand-gold text-black shadow-md shadow-brand-gold/20'
                                : 'text-foreground/40 hover:text-foreground'
                        }`}
                    >
                        📸 Shutter Speed
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {activeTab === 'snake' ? <SnakeGame /> : <ShutterSpeedGame />}
            </div>
        </motion.div>
    );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
    const { data, loading, totalIncome, totalExpenses, totalCapital, netProfit, remainingMoney } = useAppContext();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'Admin';
    const membersList = Array.isArray(data.members) ? data.members : [];
    const profitDistributions = useMemo(() => calculateProfits(membersList, netProfit), [membersList, netProfit]);
    const profitByPartner = useMemo(() =>
        profitDistributions.reduce((map, item) => ({ ...map, [item.partnerId]: item }), {}),
        [profitDistributions]
    );

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const firstName = session?.user?.name?.split(' ')[0] ?? '';

    // Non-Admin Operational KPIs
    const operationalKpis = useMemo(() => {
        const projectsList = Array.isArray(data.projects) ? data.projects : [];
        const checklistList = Array.isArray(data.checklist) ? data.checklist : [];
        const ideasList = Array.isArray(data.ideas) ? data.ideas : [];

        const activeProjectsCount = projectsList.filter(p => p.status === 'in_progress' || p.status === 'planned' || p.status === 'In Progress' || p.status === 'Planning').length;
        const totalChecklist = checklistList.length;
        const doneChecklist = checklistList.filter(normalizePacked).length;
        const gearPct = totalChecklist === 0 ? 0 : Math.round((doneChecklist / totalChecklist) * 100);

        return [
            { label: 'Active Shoots', value: activeProjectsCount, icon: FolderKanban, color: 'text-brand-gold', accent: 'var(--brand-gold)', note: 'Shoots in pipeline' },
            { label: 'Gear Readiness', value: gearPct, isPct: true, icon: CheckSquare, color: 'text-emerald-400', accent: '#10b981', note: `${doneChecklist}/${totalChecklist} items ready` },
            { label: 'Creative Ideas', value: ideasList.length, icon: Lightbulb, color: 'text-amber-400', accent: '#f59e0b', note: 'Cataloged concepts' },
            { label: 'Total Sessions', value: projectsList.length, icon: Camera, color: 'text-sky-400', accent: '#38bdf8', note: 'All-time projects' },
        ];
    }, [data.projects, data.checklist, data.ideas]);

    if (loading) return (
        <div className="h-full p-5 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-9 w-56 bg-surface-raised rounded-xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-surface-raised rounded-2xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
                {[0, 200, 400].map(d => (
                    <div key={d} className="h-52 bg-surface-raised rounded-3xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    );

    const financialKpis = [
        { label: 'Revenue',    value: totalIncome,    icon: TrendingUp,   color: 'text-emerald-400', accent: '#10b981', note: 'Total income' },
        { label: 'Expenses',   value: totalExpenses,  icon: TrendingDown, color: 'text-red-400',     accent: '#ef4444', note: 'Total costs' },
        { label: 'Capital',    value: totalCapital,   icon: Users,        color: 'text-brand-gold',  accent: 'var(--brand-gold)', note: 'Partner fund' },
        { label: 'Cash',       value: remainingMoney, icon: Wallet,       color: 'text-sky-400',     accent: '#38bdf8', note: 'On hand' },
        { label: 'Net Profit', value: netProfit,      icon: BarChart3,
          color: netProfit >= 0 ? 'text-brand-gold' : 'text-red-400',
          accent: netProfit >= 0 ? 'var(--brand-gold)' : '#ef4444',
          note: netProfit >= 0 ? 'Positive return' : 'Loss territory',
          hero: true },
    ];

    return (
        <div className="h-full overflow-y-auto p-5 md:p-8 custom-scrollbar">
            <motion.div className="max-w-5xl mx-auto space-y-7" variants={stagger} initial="hidden" animate="show">

                {/* Header */}
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border pb-4">
                    <div>
                        <p className="text-[10px] font-black text-foreground/25 uppercase tracking-[0.3em]">
                            {greeting}{firstName ? `, ${firstName}` : ''}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                            {isAdmin ? 'Business' : 'Studio'} <span className="text-brand-gold italic">Overview</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${isAdmin ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/25' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'}`}>
                            {isAdmin ? '🛡️ Admin Workspace' : '📸 Member Studio'}
                        </span>
                    </div>
                </motion.div>

                {/* Admin Financial KPI Grid */}
                {isAdmin && (
                    <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {financialKpis.map((kpi) => {
                            const Icon = kpi.icon;
                            const absVal = Math.abs(kpi.value);
                            return (
                                <motion.div key={kpi.label} variants={fadeUp}
                                    className={`relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/20 ${kpi.hero ? 'col-span-2 lg:col-span-1 glow-gold' : ''}`}
                                >
                                    <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full" style={{ background: `${kpi.accent}09` }} />
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 border border-white/[0.06]" style={{ background: `${kpi.accent}12` }}>
                                        <Icon size={15} className={kpi.color} />
                                    </div>
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                                    <div className={`text-2xl font-black tracking-tighter ${kpi.hero ? kpi.color : 'text-foreground'}`}>
                                        <NumberTicker value={absVal} prefix={kpi.value < 0 ? '-$' : '$'} decimals={2} duration={1.2} />
                                    </div>
                                    <p className={`text-[9px] font-bold mt-1.5 italic opacity-50 ${kpi.color}`}>{kpi.note}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Non-Admin Operational KPI Grid */}
                {!isAdmin && (
                    <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {operationalKpis.map((kpi) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} variants={fadeUp}
                                    className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/20"
                                >
                                    <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full" style={{ background: `${kpi.accent}09` }} />
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 border border-white/[0.06]" style={{ background: `${kpi.accent}12` }}>
                                        <Icon size={16} className={kpi.color} />
                                    </div>
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                                    <div className="text-2xl font-black tracking-tighter text-foreground">
                                        <NumberTicker value={kpi.value} suffix={kpi.isPct ? '%' : ''} duration={1.2} />
                                    </div>
                                    <p className={`text-[9px] font-bold mt-1.5 italic opacity-50 ${kpi.color}`}>{kpi.note}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* SECTION 1: Next Scheduled Session & Quick Launchpad */}
                <div className="space-y-4 pt-1">
                    <UpcomingShootBanner projects={data.projects} />
                    <QuickLaunchpad />
                </div>

                {/* SECTION 2: Member Arcade & Break Room (Atari Snake + Shutter Speed) */}
                <ArcadeZone />

                {/* SECTION 3: Financial Analytics (Admin Only) */}
                {isAdmin && (
                    <div className="space-y-5 pt-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                            <BarChart3 size={15} className="text-brand-gold" /> Financial Intelligence & Analytics
                        </h2>

                        <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden shadow-xl">
                            <div className="px-6 pt-5 pb-4 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-black text-foreground tracking-tight">Revenue vs Expenses</h3>
                                    <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Last 6 months · monthly breakdown</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm" style={{ background: '#10b981', opacity: 0.8 }} />
                                        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Income</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm" style={{ background: '#ef4444', opacity: 0.75 }} />
                                        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Expense</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <GrowthChart transactions={data.transactions} />
                            </div>
                        </motion.div>

                        <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                                <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-foreground tracking-tight">Recent Transactions</h3>
                                        <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Latest 5 movements</p>
                                    </div>
                                    <Clock size={14} className="text-foreground/20" />
                                </div>
                                <div className="p-3">
                                    <RecentTransactions transactions={data.transactions} />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                                <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-foreground tracking-tight">Partner Distribution</h3>
                                        <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Capital-based profit share</p>
                                    </div>
                                    <DollarSign size={14} className="text-foreground/20" />
                                </div>
                                <div className="p-4 space-y-2">
                                    {membersList.length === 0 ? (
                                        <p className="text-center py-8 text-foreground/20 text-sm italic">No partners</p>
                                    ) : (
                                        membersList.map(member => {
                                            const distribution = profitByPartner[member.id] || { percentage: 0, profit: 0 };
                                            const profitAmount = distribution.profit;
                                            const capitalPercentage = Number((distribution.percentage * 100).toFixed(2));
                                            const isPos = profitAmount >= 0;
                                            return (
                                                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border hover:border-brand-gold/20 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center font-black text-brand-gold text-sm group-hover:bg-brand-gold group-hover:text-black transition-all flex-shrink-0">
                                                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground leading-none mb-0.5">{member.name}</p>
                                                            <p className="text-[8px] font-black text-foreground/25 uppercase tracking-widest">{capitalPercentage}% capital</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-black tabular ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPos ? '' : '-'}$<NumberTicker value={Math.abs(profitAmount)} decimals={2} duration={1} />
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}

                {/* SECTION 4: Studio Operations Grid */}
                <div className="space-y-3 pt-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                        <FolderKanban size={15} className="text-sky-400" /> Active Operations & Production
                    </h2>

                    <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                            <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center gap-2">
                                <FolderKanban size={14} className="text-brand-gold/60" />
                                <div>
                                    <h3 className="text-sm font-black text-foreground tracking-tight">Recent Projects</h3>
                                    <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{Array.isArray(data.projects) ? data.projects.length : 0} total</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <RecentProjects projects={data.projects} />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                            <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center gap-2">
                                <Lightbulb size={14} className="text-brand-gold/60" />
                                <div>
                                    <h3 className="text-sm font-black text-foreground tracking-tight">Ideas</h3>
                                    <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{Array.isArray(data.ideas) ? data.ideas.length : 0} concepts</p>
                                </div>
                            </div>
                            <div className="p-5">
                                <StatusBreakdown items={data.ideas} colorMap={IDEA_COLORS} emptyText="No ideas yet" />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                            <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center gap-2">
                                <CheckSquare size={14} className="text-brand-gold/60" />
                                <div>
                                    <h3 className="text-sm font-black text-foreground tracking-tight">Gear Checklist</h3>
                                    <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Equipment readiness</p>
                                </div>
                            </div>
                            <div className="p-5">
                                <ChecklistProgress checklist={data.checklist} />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

            </motion.div>
        </div>
    );
}
