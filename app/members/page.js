// app/members/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Loader from '@/components/Loader';
import Dropdown from '@/components/ui/Dropdown';
import { Users2, Plus, X, Mail, TrendingUp, Landmark, Search, SlidersHorizontal, Tag } from 'lucide-react';
import { calculateProfits } from '@/services/profitCalculator';

const PAGE_SIZE = 10;
const INITIAL_FORM = { name: '', role: '', email: '' };

const ROLES = [
    'Photographer', 'Videographer', 'Editor', 'Assistant', 'Manager', 'Partner',
    'Social Media Manager', 'Marketing', 'Content Creator', 'Designer', 'Sales', 'Accountant',
];

function MemberForm({ formData, setFormData }) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Full Name</label>
                    <input required type="text" placeholder="e.g. Ahmad Khaled"
                        value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Role</label>
                    <input type="text" list="roles-list" placeholder="e.g. Photographer"
                        value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                    <datalist id="roles-list">{ROLES.map(r => <option key={r} value={r} />)}</datalist>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Email</label>
                <input type="email" placeholder="member@example.com"
                    value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
        </div>
    );
}

export default function Members() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { data, loading, addRecord, updateRecord, deleteRecord, netProfit } = useAppContext();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'Admin') {
            router.replace('/?denied=members');
        }
    }, [status, session, router]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // filters
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const profitDistributions = useMemo(() => calculateProfits(data.members, netProfit), [data.members, netProfit]);
    const profitByPartner = useMemo(() =>
        profitDistributions.reduce((map, item) => ({ ...map, [item.partnerId]: item }), {}),
        [profitDistributions]
    );
    const totalInvestedCapital = useMemo(() =>
        data.members.reduce((sum, m) => sum + Number(m.totalInvestedAmount || 0), 0),
        [data.members]
    );

    const distinctRoles = useMemo(() => {
        const set = new Set(data.members.map(m => m.role).filter(Boolean));
        return Array.from(set).sort();
    }, [data.members]);

    // reset to page 1 when any filter changes
    useEffect(() => { setCurrentPage(1); }, [query, roleFilter]);

    const sortedMembers = useMemo(() =>
        [...data.members].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        [data.members]
    );

    const filteredMembers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sortedMembers.filter(m => {
            if (q) {
                const hay = `${m.name || ''} ${m.email || ''} ${m.role || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            if (roleFilter !== 'all' && (m.role || 'Unassigned') !== roleFilter) return false;
            return true;
        });
    }, [sortedMembers, query, roleFilter]);

    const hasFilters  = !!(query || roleFilter !== 'all');
    const activeCount = [query, roleFilter !== 'all'].filter(Boolean).length;
    const totalPages  = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
    const paginated   = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const clearFilters = () => { setQuery(''); setRoleFilter('all'); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Members', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Members', formData);
            }
            setShowForm(false);
            setFormData(INITIAL_FORM);
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (member) => {
        setConfirmConfig({
            title: 'Delete member',
            message: `Delete "${member.name}"? This cannot be undone.`,
            confirmLabel: 'Delete Member',
            onConfirm: async () => {
                try { await deleteRecord('Members', member.id); setConfirmConfig(null); }
                catch (err) { alert('❌ ' + err.message); }
            },
        });
    };

    const openEdit = (member) => {
        setFormData({ name: member.name || '', role: member.role || '', email: member.email || '' });
        setModalConfig({ isOpen: true, type: 'edit', data: member });
    };

    const openView = (member) => setModalConfig({ isOpen: true, type: 'view', data: member });

    if (status === 'loading') return null;
    if (status === 'authenticated' && session?.user?.role !== 'Admin') return null;

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-40 bg-brand-gold/10 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-brand-gold/10 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-brand-gold/10 rounded-3xl" />
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                                <Users2 size={18} />
                            </span>
                            Team <span className="text-brand-gold italic">Members</span>
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {data.members.length} members · ${totalInvestedCapital.toLocaleString()} invested capital
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setFormData(INITIAL_FORM); setModalConfig({ isOpen: false, type: null, data: null }); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Member'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Users2 size={14} className="text-brand-gold" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Members</p>
                        </div>
                        <p className="text-xl font-black text-foreground">{data.members.length}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Landmark size={14} className="text-brand-gold" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Capital Invested</p>
                        </div>
                        <p className="text-xl font-black text-brand-gold">${totalInvestedCapital.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-red-500/15 border border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className={netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Net Profit</p>
                        </div>
                        <p className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${Number(netProfit || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-base font-black text-foreground uppercase tracking-widest">New Member</h2>
                        <MemberForm formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Saving...' : 'Add Member'}
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
                                placeholder="Search members..."
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
                        <div className="bg-card-bg rounded-3xl border border-card-border p-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1.5">
                                <Tag size={11} /> Role
                            </p>
                            <Dropdown
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={[{ value: 'all', label: 'All Roles' }, ...distinctRoles.map(r => ({ value: r, label: r }))]}
                                placeholder="Filter role"
                            />
                        </div>
                    )}
                </div>

                {/* List header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-foreground/50 uppercase tracking-widest">
                        {hasFilters ? 'Filtered Results' : 'All Members'}
                    </h2>
                    {filteredMembers.length > 0 && (
                        <p className="text-[10px] font-black text-foreground/25 uppercase tracking-widest">
                            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Empty states */}
                {data.members.length === 0 ? (
                    <div className="py-28 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                        <Users2 size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No members yet</p>
                        <p className="text-xs mt-1 font-medium">Add team members to track roles and invested capital.</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="py-20 bg-card-bg rounded-3xl border border-card-border text-center text-foreground/30">
                        <Search size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No results found</p>
                        {hasFilters && (
                            <button onClick={clearFilters} className="mt-4 text-xs font-black text-brand-gold/60 hover:text-brand-gold transition underline underline-offset-2">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-3">
                            {paginated.map(member => {
                                const distribution = profitByPartner[member.id] || { percentage: 0, profit: 0 };
                                const capitalPercentage = Number((distribution.percentage * 100).toFixed(2));
                                const profitAmount = distribution.profit;
                                return (
                                    <div key={member.id} className="bg-card-bg p-4 rounded-2xl border border-card-border hover:border-brand-gold/20 transition-all group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-sm font-black flex-shrink-0">
                                                {member.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-sm text-foreground truncate group-hover:text-brand-gold transition-colors">{member.name}</p>
                                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mt-0.5">{member.role || 'Partner'}</p>
                                            </div>
                                            <p className={`font-black text-sm whitespace-nowrap ${profitAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                ${profitAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-card-border">
                                            <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Share {capitalPercentage}%</span>
                                            <ActionButtons onView={() => openView(member)} onEdit={() => openEdit(member)} onDelete={() => handleDelete(member)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block bg-card-bg rounded-3xl border border-card-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-background/40 border-b border-card-border">
                                    <tr>
                                        {['Member', 'Role', 'Profit Share', 'Balance', ''].map((h, i) => (
                                            <th key={i} className={`p-4 font-black text-foreground/30 uppercase tracking-widest text-[9px] ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {paginated.map(member => {
                                        const distribution = profitByPartner[member.id] || { percentage: 0, profit: 0 };
                                        const capitalPercentage = Number((distribution.percentage * 100).toFixed(2));
                                        const profitAmount = distribution.profit;
                                        return (
                                            <tr key={member.id} className="hover:bg-background/40 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black flex-shrink-0">
                                                            {member.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-foreground group-hover:text-brand-gold transition-colors truncate">{member.name}</p>
                                                            {member.email && (
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <Mail size={9} className="text-foreground/20 flex-shrink-0" />
                                                                    <p className="text-[10px] text-foreground/30 font-medium truncate">{member.email}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border text-foreground/50 bg-white/3 border-card-border">
                                                        {member.role || 'Partner'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-brand-gold w-10 flex-shrink-0">{capitalPercentage}%</span>
                                                        <div className="h-1.5 w-24 rounded-full bg-background border border-card-border overflow-hidden">
                                                            <div className="h-full bg-brand-gold rounded-full transition-all duration-500" style={{ width: `${Math.min(capitalPercentage, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`p-4 text-right font-black ${profitAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    ${profitAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButtons onView={() => openView(member)} onEdit={() => openEdit(member)} onDelete={() => handleDelete(member)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
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

            <ConfirmDialog
                isOpen={!!confirmConfig}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                confirmLabel={confirmConfig?.confirmLabel}
                onCancel={() => setConfirmConfig(null)}
                onConfirm={confirmConfig?.onConfirm}
            />

            {/* Modals */}
            <AppModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Member' : 'Member Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <MemberForm formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Member'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const m = modalConfig.data;
                    const distribution = profitByPartner[m.id] || { percentage: 0, profit: 0 };
                    const capitalPercentage = Number((distribution.percentage * 100).toFixed(2));
                    const profitAmount = distribution.profit;
                    return (
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 pb-5 border-b border-card-border">
                                <div className="w-20 h-20 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-3xl font-black">
                                    {m.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">{m.name}</h3>
                                    <p className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">{m.role || 'Partner'}</p>
                                    {m.email && (
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <Mail size={12} className="text-brand-gold/50" />
                                            <p className="text-xs text-foreground/50 font-medium">{m.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Profit Share</p>
                                    <p className="text-2xl font-black text-brand-gold">{capitalPercentage}%</p>
                                    <div className="mt-2 h-1 rounded-full bg-background border border-card-border overflow-hidden">
                                        <div className="h-full bg-brand-gold" style={{ width: `${Math.min(capitalPercentage, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Estimated Balance</p>
                                    <p className={`text-2xl font-black ${profitAmount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        ${profitAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
