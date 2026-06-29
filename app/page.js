'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3,
    ArrowUpRight, ArrowDownRight, Lightbulb, FolderKanban,
    Users, Clock, CheckSquare,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import NumberTicker from '@/components/ui/number-ticker';

// ── Animation variants ──────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(5px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
};

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
// Uses CSS currentColor so labels adapt to both light/dark mode.
function GrowthChart({ transactions }) {
    const months = useMemo(() => {
        const map = {};
        transactions.forEach(tx => {
            if (!tx.date) return;
            const d = new Date(tx.date);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!map[key]) map[key] = { income: 0, expense: 0 };
            const amt = Math.abs(Number(tx.amount) || 0);
            if (tx.type === 'income')  map[key].income  += amt;
            if (tx.type === 'expense') map[key].expense += amt;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([key, v]) => ({
                label: new Date(key + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                fullLabel: new Date(key + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' }),
                income: v.income,
                expense: v.expense,
            }));
    }, [transactions]);

    if (months.length === 0) return (
        <div className="h-36 flex items-center justify-center text-foreground/20 text-sm italic">
            No transaction data yet
        </div>
    );

    const maxVal = Math.max(...months.flatMap(m => [m.income, m.expense]), 1);

    // SVG dimensions
    const W = 540, H = 200;
    const PL = 52, PR = 12, PT = 16, PB = 40;
    const chartW = W - PL - PR;
    const chartH = H - PT - PB;
    const xAxisY = PT + chartH;

    const colW = chartW / months.length;
    const barW = Math.min(26, colW * 0.30);
    const gap = 5;

    const barTop = (val) => PT + chartH - (val / maxVal) * chartH;
    const barHeight = (val) => (val / maxVal) * chartH;
    const fmt = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`;

    // Y-axis grid ticks at 25/50/75/100%
    const gridPcts = [0.25, 0.5, 0.75, 1];

    return (
        // color: var(--foreground) makes currentColor work for SVG text/lines
        <div style={{ color: 'var(--foreground)' }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <style>{`
                    .gc-grid  { stroke: currentColor; opacity: 0.07; }
                    .gc-axis  { stroke: currentColor; opacity: 0.15; }
                    .gc-label { fill: currentColor; opacity: 0.35; font-family: inherit; }
                    .gc-val   { fill: currentColor; opacity: 0.55; font-family: inherit; }
                `}</style>

                {/* Y-axis grid lines + labels */}
                {gridPcts.map(pct => {
                    const lineY = PT + chartH * (1 - pct);
                    return (
                        <g key={pct}>
                            <line x1={PL} y1={lineY} x2={W - PR} y2={lineY}
                                className="gc-grid" strokeWidth="1" strokeDasharray="3 4" />
                            <text x={PL - 6} y={lineY + 4} textAnchor="end"
                                fontSize="9" className="gc-label">
                                {fmt(maxVal * pct)}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis baseline */}
                <line x1={PL} y1={xAxisY} x2={W - PR} y2={xAxisY}
                    className="gc-axis" strokeWidth="1" />

                {/* Bars per month */}
                {months.map((m, i) => {
                    const cx = PL + i * colW + colW / 2;
                    const incH  = barHeight(m.income);
                    const expH  = barHeight(m.expense);
                    const incTop = barTop(m.income);
                    const expTop = barTop(m.expense);

                    return (
                        <g key={m.label}>
                            {/* Income bar */}
                            <rect
                                x={cx - barW - gap / 2} y={incTop}
                                width={barW} height={incH} rx="3"
                                fill="#10b981" opacity="0.80"
                            >
                                <title>{m.fullLabel} · Income: {fmt(m.income)}</title>
                            </rect>

                            {/* Income value label (only if tall enough) */}
                            {incH > 22 && (
                                <text x={cx - barW / 2 - gap / 2} y={incTop - 5}
                                    textAnchor="middle" fontSize="8" className="gc-val">
                                    {fmt(m.income)}
                                </text>
                            )}

                            {/* Expense bar */}
                            <rect
                                x={cx + gap / 2} y={expTop}
                                width={barW} height={expH} rx="3"
                                fill="#ef4444" opacity="0.72"
                            >
                                <title>{m.fullLabel} · Expenses: {fmt(m.expense)}</title>
                            </rect>

                            {/* Expense value label */}
                            {expH > 22 && (
                                <text x={cx + barW / 2 + gap / 2} y={expTop - 5}
                                    textAnchor="middle" fontSize="8" className="gc-val">
                                    {fmt(m.expense)}
                                </text>
                            )}

                            {/* Month label below x-axis */}
                            <text x={cx} y={xAxisY + 16}
                                textAnchor="middle" fontSize="9" className="gc-label">
                                {m.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ── RecentTransactions ──────────────────────────────────────────────────────
function RecentTransactions({ transactions }) {
    const recent = useMemo(() => (
        [...transactions]
            .filter(tx => tx.date || tx.description)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 5)
    ), [transactions]);

    const typeStyle = {
        income:  { label: 'Income',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ArrowUpRight },
        expense: { label: 'Expense', color: 'text-red-400',     bg: 'bg-red-400/10',     icon: ArrowDownRight },
        capital: { label: 'Capital', color: 'text-brand-gold',  bg: 'bg-brand-gold/10',  icon: DollarSign },
    };

    return (
        <div className="space-y-1.5">
            {recent.length === 0 && (
                <p className="text-center py-8 text-foreground/20 text-sm italic">No transactions yet</p>
            )}
            {recent.map(tx => {
                const s = typeStyle[tx.type] || typeStyle.expense;
                const Icon = s.icon;
                const d = tx.date ? new Date(tx.date) : null;
                const dateStr = d && !isNaN(d) ? d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
                return (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                            <Icon size={14} className={s.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-foreground truncate">{tx.description || '—'}</p>
                            <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest">{dateStr}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-black tabular ${s.color}`}>
                                {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount || 0).toLocaleString()}
                            </p>
                            <span className={`text-[8px] font-black uppercase tracking-wider ${s.color} opacity-60`}>{s.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── RecentProjects ──────────────────────────────────────────────────────────
function RecentProjects({ projects }) {
    const recent = useMemo(() => [...projects].slice(-3).reverse(), [projects]);

    // Compact status summary
    const statusCounts = useMemo(() => {
        const map = {};
        projects.forEach(p => { const s = p.status || 'Unknown'; map[s] = (map[s] || 0) + 1; });
        return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 4);
    }, [projects]);

    if (projects.length === 0) return (
        <p className="text-center py-8 text-foreground/20 text-xs italic">No projects yet</p>
    );

    return (
        <div className="space-y-1.5">
            {recent.map(project => {
                const color = PROJECT_COLORS[project.status] || fallbackColor;
                return (
                    <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate leading-snug">
                                {project.title || 'Untitled'}
                            </p>
                            <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest truncate">
                                {project.client || project.category || '—'}
                            </p>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ color, background: `${color}18` }}>
                            {project.status || '?'}
                        </span>
                    </div>
                );
            })}

            {/* Status summary pills */}
            {statusCounts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-card-border mt-1">
                    {statusCounts.map(([status, count]) => (
                        <span key={status} className="flex items-center gap-1.5 text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PROJECT_COLORS[status] || fallbackColor }} />
                            {count} {status}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Ideas StatusBreakdown ───────────────────────────────────────────────────
function StatusBreakdown({ items, colorMap, emptyText }) {
    const groups = useMemo(() => {
        const map = {};
        items.forEach(item => {
            const s = item.status || 'Unknown';
            map[s] = (map[s] || 0) + 1;
        });
        return Object.entries(map).sort(([, a], [, b]) => b - a);
    }, [items]);

    if (groups.length === 0) return (
        <p className="text-center py-6 text-foreground/20 text-xs italic">{emptyText}</p>
    );

    const total = items.length;
    return (
        <div className="space-y-3">
            {groups.map(([status, count]) => {
                const color = colorMap[status] || fallbackColor;
                const pct = Math.round((count / total) * 100);
                return (
                    <div key={status}>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-[10px] font-black text-foreground/55 uppercase tracking-widest">{status}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-foreground/40">{count}</span>
                                <span className="text-[9px] font-black text-foreground/20">{pct}%</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color, opacity: 0.8 }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── ChecklistProgress ───────────────────────────────────────────────────────
function ChecklistProgress({ checklist }) {
    const { total, packed, sections } = useMemo(() => {
        const isPacked = (v) => v === true || v === 'true' || v === 'TRUE' || v === '1';
        const sectionMap = {};
        checklist.forEach(item => {
            const sec = String(item.category || 'General').trim();
            if (!sectionMap[sec]) sectionMap[sec] = { total: 0, packed: 0 };
            sectionMap[sec].total++;
            if (isPacked(item.isPacked)) sectionMap[sec].packed++;
        });
        const sections = Object.entries(sectionMap).sort(([, a], [, b]) => b.total - a.total).slice(0, 5);
        const total = checklist.length;
        const packed = checklist.filter(i => isPacked(i.isPacked)).length;
        return { total, packed, sections };
    }, [checklist]);

    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

    if (total === 0) return (
        <p className="text-center py-6 text-foreground/20 text-xs italic">No checklist items yet</p>
    );

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Overall</span>
                    <span className="text-[11px] font-black text-brand-gold tabular">{packed}/{total}</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                        style={{ background: pct === 100 ? '#10b981' : 'var(--brand-gold)', opacity: 0.85 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    />
                </div>
                <p className="text-right text-[9px] font-black text-foreground/20 mt-1">{pct}% packed</p>
            </div>
            {sections.map(([sec, { total: st, packed: sp }]) => {
                const spct = Math.round((sp / st) * 100);
                return (
                    <div key={sec}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest truncate max-w-[65%]">{sec}</span>
                            <span className="text-[9px] font-black text-foreground/25">{sp}/{st}</span>
                        </div>
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-brand-gold/60 transition-all duration-700" style={{ width: `${spct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
    const { data, loading, totalIncome, totalExpenses, totalCapital, netProfit, remainingMoney } = useAppContext();
    const { data: session } = useSession();

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const firstName = session?.user?.name?.split(' ')[0] ?? '';

    if (loading) return (
        <div className="h-full p-5 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-9 w-56 bg-surface-raised rounded-xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" />
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-28 bg-surface-raised rounded-2xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
                {[0, 200, 400].map(d => (
                    <div key={d} className="h-52 bg-surface-raised rounded-3xl animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    );

    const kpis = [
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
            <motion.div className="max-w-5xl mx-auto space-y-6" variants={stagger} initial="hidden" animate="show">

                {/* Header */}
                <motion.div variants={fadeUp} className="space-y-0.5">
                    <p className="text-[10px] font-black text-foreground/25 uppercase tracking-[0.3em]">
                        {greeting}{firstName ? `, ${firstName}` : ''}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                        Business <span className="text-brand-gold italic">Overview</span>
                    </h1>
                </motion.div>

                {/* KPI Grid */}
                <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {kpis.map((kpi) => {
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

                {/* Growth Chart */}
                <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                    <div className="px-6 pt-5 pb-4 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-black text-foreground tracking-tight">Revenue vs Expenses</h2>
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

                {/* Row: Recent Transactions + Partner Distribution */}
                <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                        <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-foreground tracking-tight">Recent Transactions</h2>
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
                                <h2 className="text-sm font-black text-foreground tracking-tight">Partner Distribution</h2>
                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Equity-based profit share</p>
                            </div>
                            <DollarSign size={14} className="text-foreground/20" />
                        </div>
                        <div className="p-4 space-y-2">
                            {data.members.length === 0 ? (
                                <p className="text-center py-8 text-foreground/20 text-sm italic">No partners</p>
                            ) : (
                                data.members.map(member => {
                                    const share = netProfit * (Number(member.sharePercentage) / 100);
                                    const isPos = share >= 0;
                                    return (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border hover:border-brand-gold/20 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center font-black text-brand-gold text-sm group-hover:bg-brand-gold group-hover:text-black transition-all flex-shrink-0">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground leading-none mb-0.5">{member.name}</p>
                                                    <p className="text-[8px] font-black text-foreground/25 uppercase tracking-widest">{member.sharePercentage}% equity</p>
                                                </div>
                                            </div>
                                            <p className={`text-sm font-black tabular ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isPos ? '' : '-'}$<NumberTicker value={Math.abs(share)} decimals={2} duration={1} />
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Row: Projects + Ideas + Checklist */}
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <motion.div variants={fadeUp} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                        <div className="px-5 pt-5 pb-4 border-b border-card-border flex items-center gap-2">
                            <FolderKanban size={14} className="text-brand-gold/60" />
                            <div>
                                <h2 className="text-sm font-black text-foreground tracking-tight">Recent Projects</h2>
                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{data.projects.length} total</p>
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
                                <h2 className="text-sm font-black text-foreground tracking-tight">Ideas</h2>
                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{data.ideas.length} concepts</p>
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
                                <h2 className="text-sm font-black text-foreground tracking-tight">Gear Checklist</h2>
                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">Equipment readiness</p>
                            </div>
                        </div>
                        <div className="p-5">
                            <ChecklistProgress checklist={data.checklist} />
                        </div>
                    </motion.div>
                </motion.div>

            </motion.div>
        </div>
    );
}
