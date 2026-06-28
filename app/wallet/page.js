// app/wallet/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';
import {
    Search, X, Plus, TrendingUp, TrendingDown, Landmark,
    Wallet as WalletIcon, SlidersHorizontal, CalendarDays, User2
} from 'lucide-react';

const PAGE_SIZE = 20;
const getEmptyForm = () => ({
    description: '', amount: '', type: 'income', memberId: '',
    date: new Date().toISOString().split('T')[0]
});

const TYPE_CONFIG = {
    income:   { label: 'Income',   color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
    expense:  { label: 'Expense',  color: 'text-red-400    bg-red-400/10    border-red-400/20',    dot: 'bg-red-400'    },
    capital:  { label: 'Capital',  color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20', dot: 'bg-brand-gold' },
};

export default function Wallet() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { data, loading, addRecord, updateRecord, deleteRecord, totalIncome, totalExpenses, totalCapital, netProfit } = useAppContext();

    // ── all hooks before conditional returns ──────────────────────────────
    const [showForm, setShowForm]       = useState(false);
    const [formData, setFormData]       = useState(getEmptyForm);
    const [isSaving, setIsSaving]       = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [showFilters, setShowFilters] = useState(false);

    // filters
    const [query,        setQuery]        = useState('');
    const [typeFilter,   setTypeFilter]   = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');
    const [dateFrom,     setDateFrom]     = useState('');
    const [dateTo,       setDateTo]       = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'Admin') {
            router.replace('/?denied=wallet');
        }
    }, [status, session, router]);

    // reset to page 1 when any filter changes
    useEffect(() => { setCurrentPage(1); }, [query, typeFilter, memberFilter, dateFrom, dateTo]);

    const sortedTransactions = useMemo(() =>
        [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
        [data.transactions]
    );

    const filteredTransactions = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sortedTransactions.filter(tx => {
            if (q && !(tx.description || '').toLowerCase().includes(q)) return false;
            if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
            if (memberFilter === 'general' && tx.memberId) return false;
            if (memberFilter !== 'all' && memberFilter !== 'general' && tx.memberId !== memberFilter) return false;
            if (dateFrom && tx.date < dateFrom) return false;
            if (dateTo   && tx.date > dateTo)   return false;
            return true;
        });
    }, [sortedTransactions, query, typeFilter, memberFilter, dateFrom, dateTo]);

    const filteredIncome   = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0), [filteredTransactions]);
    const filteredExpenses = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0), [filteredTransactions]);
    const filteredProfit   = filteredIncome - filteredExpenses;

    const hasFilters  = !!(query || typeFilter !== 'all' || memberFilter !== 'all' || dateFrom || dateTo);
    const activeCount = [query, typeFilter !== 'all', memberFilter !== 'all', dateFrom, dateTo].filter(Boolean).length;
    const totalPages  = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
    const paginated   = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const clearFilters = () => { setQuery(''); setTypeFilter('all'); setMemberFilter('all'); setDateFrom(''); setDateTo(''); };

    // ── handlers ──────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Transactions', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Transactions', { ...formData, date: formData.date || new Date().toISOString().split('T')[0] }, { reload: false, optimistic: true });
                setCurrentPage(1);
            }
            setShowForm(false);
            setFormData(getEmptyForm());
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (tx) => {
        if (confirm(`Delete "${tx.description}"?`)) {
            try { await deleteRecord('Transactions', tx.id); }
            catch (err) { alert('❌ ' + err.message); }
        }
    };

    const openEdit = (tx) => { setFormData({ ...tx }); setModalConfig({ isOpen: true, type: 'edit', data: tx }); };
    const openView = (tx) => setModalConfig({ isOpen: true, type: 'view', data: tx });

    // ── early returns ─────────────────────────────────────────────────────
    if (status === 'loading') return null;
    if (status === 'authenticated' && session?.user?.role !== 'Admin') return null;

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-52 bg-brand-gold/10 rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-brand-gold/10 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-brand-gold/10 rounded-3xl" />
        </div>
    );

    // ── shared form fields ────────────────────────────────────────────────
    const TxFormFields = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Description</label>
                    <input required type="text" placeholder="e.g. Wedding Shoot Payment"
                        value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Contributor</label>
                    <select value={formData.memberId} onChange={e => setFormData(p => ({ ...p, memberId: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold">
                        <option value="">General</option>
                        {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Amount ($)</label>
                    <input required type="number" min="0" step="0.01" placeholder="0.00"
                        value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Type</label>
                    <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold">
                        <option value="income">Business Income</option>
                        <option value="expense">Business Expense</option>
                        <option value="capital">Capital Contribution</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
            </div>
        </>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                <WalletIcon size={18} />
                            </span>
                            Wallet
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {data.transactions.length} transactions total
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setFormData(getEmptyForm()); setModalConfig({ isOpen: false, type: null, data: null }); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Transaction'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Income</p>
                        </div>
                        <p className="text-xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown size={14} className="text-red-400" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Expenses</p>
                        </div>
                        <p className="text-xl font-black text-red-400">${totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border border-l-2 border-l-brand-gold">
                        <div className="flex items-center gap-2 mb-2">
                            <Landmark size={14} className="text-brand-gold" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Capital</p>
                        </div>
                        <p className="text-xl font-black text-brand-gold">${totalCapital.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-red-500/15 border border-red-500/20'}`}>
                        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-2">Net Profit</p>
                        <p className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netProfit.toLocaleString()}</p>
                    </div>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-base font-black text-foreground uppercase tracking-widest">New Transaction</h2>
                        <TxFormFields />
                        <button disabled={isSaving} type="submit"
                            className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Saving...' : 'Save Transaction'}
                        </button>
                    </form>
                )}

                {/* ── Search & Filter bar ─────────────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {/* Search input */}
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search transactions..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-card-border bg-card-bg focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/70 transition">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filters toggle */}
                        <button onClick={() => setShowFilters(s => !s)}
                            className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl border font-black text-sm transition-all ${
                                showFilters || hasFilters
                                    ? 'bg-brand-gold text-black border-brand-gold shadow-lg shadow-brand-gold/20'
                                    : 'border-card-border text-foreground/50 bg-card-bg hover:border-brand-gold/30'
                            }`}>
                            <SlidersHorizontal size={15} />
                            <span className="hidden sm:inline">Filters</span>
                            {activeCount > 0 && (
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${showFilters || hasFilters ? 'bg-black/20 text-black' : 'bg-brand-gold text-black'}`}>
                                    {activeCount}
                                </span>
                            )}
                        </button>

                        {/* Clear all */}
                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-red-400/20 text-red-400 bg-red-400/5 font-black text-xs hover:bg-red-400/10 transition-all">
                                <X size={13} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Expanded filters */}
                    {showFilters && (
                        <div className="bg-card-bg rounded-3xl border border-card-border p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Type pills */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Type</p>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { key: 'all',     label: 'All'     },
                                        { key: 'income',  label: 'Income'  },
                                        { key: 'expense', label: 'Expense' },
                                        { key: 'capital', label: 'Capital' },
                                    ].map(opt => (
                                        <button key={opt.key} onClick={() => setTypeFilter(opt.key)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                                typeFilter === opt.key
                                                    ? 'bg-brand-gold text-black border-brand-gold'
                                                    : 'border-card-border text-foreground/40 hover:border-brand-gold/30 hover:text-foreground/70'
                                            }`}>
                                            {opt.key !== 'all' && (
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                    opt.key === 'income' ? 'bg-emerald-400' : opt.key === 'expense' ? 'bg-red-400' : 'bg-brand-gold'
                                                }`} />
                                            )}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Member filter */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <User2 size={11} /> Contributor
                                    </p>
                                    <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)}
                                        className="block w-full rounded-xl border border-card-border px-3 py-2.5 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold">
                                        <option value="all">All Members</option>
                                        <option value="general">General (No Member)</option>
                                        {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>

                                {/* Date from */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <CalendarDays size={11} /> From
                                    </p>
                                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                        className="block w-full rounded-xl border border-card-border px-3 py-2.5 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                                </div>

                                {/* Date to */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <CalendarDays size={11} /> To
                                    </p>
                                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                        className="block w-full rounded-xl border border-card-border px-3 py-2.5 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filtered period summary */}
                    {hasFilters && filteredTransactions.length > 0 && (
                        <div className="flex flex-wrap gap-3 px-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-foreground/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                {filteredTransactions.length} of {sortedTransactions.length} shown
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400/70">
                                <TrendingUp size={11} /> ${filteredIncome.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-red-400/70">
                                <TrendingDown size={11} /> ${filteredExpenses.toLocaleString()}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-black ${filteredProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                = ${filteredProfit.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* History header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-foreground/50 uppercase tracking-widest">
                        {hasFilters ? 'Filtered Results' : 'History'}
                    </h2>
                    {filteredTransactions.length > 0 && (
                        <p className="text-[10px] font-black text-foreground/25 uppercase tracking-widest">
                            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Empty filtered state */}
                {filteredTransactions.length === 0 && (
                    <div className="py-20 bg-card-bg rounded-3xl border border-card-border text-center text-foreground/30">
                        <Search size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No results found</p>
                        {hasFilters && (
                            <button onClick={clearFilters} className="mt-4 text-xs font-black text-brand-gold/60 hover:text-brand-gold transition underline underline-offset-2">
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {/* Mobile cards */}
                {paginated.length > 0 && (
                    <div className="md:hidden space-y-3">
                        {paginated.map(tx => {
                            const member = data.members.find(m => m.id === tx.memberId);
                            const tc = TYPE_CONFIG[tx.type] || TYPE_CONFIG.income;
                            return (
                                <div key={tx.id} className="bg-card-bg p-4 rounded-2xl border border-card-border hover:border-brand-gold/20 transition-all group">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-sm text-foreground truncate group-hover:text-brand-gold transition-colors">{tx.description}</p>
                                            <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{tx.date}</p>
                                        </div>
                                        <p className={`font-black text-base whitespace-nowrap ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-card-border">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${tc.color}`}>{tc.label}</span>
                                            {member && (
                                                <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{member.name}</span>
                                            )}
                                        </div>
                                        <ActionButtons onView={() => openView(tx)} onEdit={() => openEdit(tx)} onDelete={() => handleDelete(tx)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Desktop table */}
                {paginated.length > 0 && (
                    <div className="hidden md:block bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-background/40 border-b border-card-border">
                                <tr>
                                    {['Description', 'Contributor', 'Date', 'Type', 'Amount', ''].map((h, i) => (
                                        <th key={i} className={`p-4 font-black text-foreground/30 uppercase tracking-widest text-[9px] ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {paginated.map(tx => {
                                    const member = data.members.find(m => m.id === tx.memberId);
                                    const tc = TYPE_CONFIG[tx.type] || TYPE_CONFIG.income;
                                    return (
                                        <tr key={tx.id} className="hover:bg-background/40 transition-colors group">
                                            <td className="p-4 font-bold text-foreground group-hover:text-brand-gold transition-colors max-w-[220px] truncate">{tx.description}</td>
                                            <td className="p-4 text-foreground/40 font-medium text-xs">{member ? member.name : <span className="text-foreground/20 italic">General</span>}</td>
                                            <td className="p-4 text-foreground/30 font-mono text-[11px]">{tx.date}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${tc.color}`}>
                                                    <span className={`w-1 h-1 rounded-full ${tc.dot}`} />
                                                    {tc.label}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-black ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ActionButtons onView={() => openView(tx)} onEdit={() => openEdit(tx)} onDelete={() => handleDelete(tx)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="px-5 py-2.5 rounded-xl border border-card-border text-xs font-black text-foreground/50 hover:bg-card-bg transition disabled:opacity-30 disabled:cursor-not-allowed">
                            ← Prev
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button key={page} onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-brand-gold text-black' : 'text-foreground/30 hover:text-foreground/70'}`}>
                                        {page}
                                    </button>
                                );
                            })}
                            {totalPages > 7 && <span className="text-foreground/20 text-xs px-1">…{totalPages}</span>}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className="px-5 py-2.5 rounded-xl border border-card-border text-xs font-black text-foreground/50 hover:bg-card-bg transition disabled:opacity-30 disabled:cursor-not-allowed">
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AppModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Transaction' : 'Transaction Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <TxFormFields />
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Transaction'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const tx = modalConfig.data;
                    const member = data.members.find(m => m.id === tx.memberId);
                    const tc = TYPE_CONFIG[tx.type] || TYPE_CONFIG.income;
                    return (
                        <div className="space-y-5">
                            <div className="flex justify-between items-start pb-5 border-b border-card-border">
                                <h3 className="text-xl font-black text-foreground leading-snug pr-4">{tx.description}</h3>
                                <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tc.color}`}>{tc.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Amount</p>
                                    <p className={`text-2xl font-black ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-xl font-black text-foreground">{tx.date}</p>
                                </div>
                            </div>
                            <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Contributor</p>
                                <p className="text-base font-black text-brand-gold">{member?.name || 'General'}</p>
                            </div>
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
