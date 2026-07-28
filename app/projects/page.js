// app/projects/page.js
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Loader from '@/components/Loader';
import Dropdown from '@/components/ui/Dropdown';
import {
    FolderKanban, Camera, CalendarDays, Plus, X,
    Search, SlidersHorizontal, Tag, Clock, CheckCircle2
} from 'lucide-react';

const PAGE_SIZE = 10;

const INITIAL_FORM_DATA = {
    title: '',
    description: '',
    category: 'Event',
    status: 'planned',
    date: new Date().toISOString().slice(0, 16),
    createdBy: ''
};

const STATUS_CONFIG = {
    planned:     { label: 'Planned',     color: 'text-brand-gold   bg-brand-gold/10  border-brand-gold/20',  dot: 'bg-brand-gold'   },
    in_progress: { label: 'In Progress', color: 'text-blue-400     bg-blue-400/10    border-blue-400/20',    dot: 'bg-blue-400'     },
    completed:   { label: 'Completed',   color: 'text-emerald-400  bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400'  },
};

const CATEGORIES = ['Event', 'School Graduation', 'University Graduation', 'Family', 'Portrait', 'Commercial', 'Wedding', 'Product'];

const FormFields = ({ formData, setFormData }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Project Title</label>
                <input required type="text" placeholder="e.g. Summer Wedding"
                    value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Photographer</label>
                <input type="text" placeholder="Name"
                    value={formData.createdBy} onChange={e => setFormData(p => ({ ...p, createdBy: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
        </div>
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Description</label>
            <textarea placeholder="Project scope and details..." value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition h-24 resize-none text-sm font-bold" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Category</label>
                <Dropdown
                    value={formData.category}
                    onChange={value => setFormData(p => ({ ...p, category: value }))}
                    options={CATEGORIES}
                    placeholder="Select category"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</label>
                <Dropdown
                    value={formData.status}
                    onChange={value => setFormData(p => ({ ...p, status: value }))}
                    options={[
                        { value: 'planned', label: 'Planned' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                    ]}
                    placeholder="Select status"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Date & Time</label>
                <input type="datetime-local" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
        </div>
    </>
);

export default function Projects() {
    const { data, loading, addRecord, updateRecord, deleteRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [confirmConfig, setConfirmConfig] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // filters
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const stats = useMemo(() => ({
        total: data.projects.length,
        planned: data.projects.filter(p => p.status === 'planned').length,
        active: data.projects.filter(p => p.status === 'in_progress').length,
        done: data.projects.filter(p => p.status === 'completed').length,
    }), [data.projects]);

    // reset to page 1 when any filter changes
    useEffect(() => { setCurrentPage(1); }, [query, statusFilter, categoryFilter, dateFrom, dateTo]);

    const sortedProjects = useMemo(() =>
        [...data.projects].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
        [data.projects]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sortedProjects.filter(p => {
            if (q) {
                const hay = `${p.title || ''} ${p.description || ''} ${p.createdBy || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
            const d = p.date ? p.date.slice(0, 10) : '';
            if (dateFrom && d < dateFrom) return false;
            if (dateTo   && d > dateTo)   return false;
            return true;
        });
    }, [sortedProjects, query, statusFilter, categoryFilter, dateFrom, dateTo]);

    const hasFilters  = !!(query || statusFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo);
    const activeCount = [query, statusFilter !== 'all', categoryFilter !== 'all', dateFrom, dateTo].filter(Boolean).length;
    const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const clearFilters = () => { setQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setDateFrom(''); setDateTo(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Projects', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Projects', formData);
                setShowForm(false);
                setFormData(INITIAL_FORM_DATA);
            }
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (project) => {
        setConfirmConfig({
            title: 'Delete project',
            message: `Delete "${project.title}"? This cannot be undone.`,
            confirmLabel: 'Delete Project',
            onConfirm: async () => {
                try { await deleteRecord('Projects', project.id); setConfirmConfig(null); }
                catch (err) { alert('❌ ' + err.message); }
            },
        });
    };

    const openEdit = (project) => {
        setFormData({ ...project });
        setModalConfig({ isOpen: true, type: 'edit', data: project });
    };

    const openView = (project) => setModalConfig({ isOpen: true, type: 'view', data: project });

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-brand-gold/10 rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-brand-gold/10 rounded-2xl" />)}</div>
            <div className="h-64 bg-brand-gold/10 rounded-3xl" />
        </div>
    );

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                                <Camera size={18} />
                            </span>
                            Project <span className="text-brand-gold italic">Hub</span>
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {stats.total} total · {stats.active} active
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setFormData(INITIAL_FORM_DATA); setModalConfig({ isOpen: false, type: null, data: null }); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Project'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <FolderKanban size={14} className="text-foreground/50" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Total</p>
                        </div>
                        <p className="text-xl font-black text-foreground">{stats.total}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag size={14} className="text-brand-gold" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Planned</p>
                        </div>
                        <p className="text-xl font-black text-brand-gold">{stats.planned}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={14} className="text-blue-400" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">In Progress</p>
                        </div>
                        <p className="text-xl font-black text-blue-400">{stats.active}</p>
                    </div>
                    <div className="bg-card-bg p-4 rounded-2xl border border-card-border">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Completed</p>
                        </div>
                        <p className="text-xl font-black text-emerald-400">{stats.done}</p>
                    </div>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-base font-black text-foreground uppercase tracking-widest">New Project</h2>
                        <FormFields formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Saving...' : 'Save Project'}
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
                                placeholder="Search projects..."
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
                            {/* Status pills */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { key: 'all',         label: 'All'         },
                                        { key: 'planned',     label: 'Planned'     },
                                        { key: 'in_progress', label: 'In Progress' },
                                        { key: 'completed',   label: 'Completed'   },
                                    ].map(opt => (
                                        <button key={opt.key} onClick={() => setStatusFilter(opt.key)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                                statusFilter === opt.key
                                                    ? 'bg-brand-gold text-black border-brand-gold'
                                                    : 'border-card-border text-foreground/40 hover:border-brand-gold/30 hover:text-foreground/70'
                                            }`}>
                                            {opt.key !== 'all' && (
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_CONFIG[opt.key]?.dot || 'bg-foreground/30'}`} />
                                            )}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Category filter */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1.5">
                                        <Tag size={11} /> Category
                                    </p>
                                    <Dropdown
                                        value={categoryFilter}
                                        onChange={setCategoryFilter}
                                        options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                                        placeholder="Filter category"
                                    />
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
                </div>

                {/* List header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-foreground/50 uppercase tracking-widest">
                        {hasFilters ? 'Filtered Results' : 'All Projects'}
                    </h2>
                    {filtered.length > 0 && (
                        <p className="text-[10px] font-black text-foreground/25 uppercase tracking-widest">
                            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Empty states */}
                {data.projects.length === 0 ? (
                    <div className="py-28 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                        <FolderKanban size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No projects yet</p>
                    </div>
                ) : filtered.length === 0 ? (
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
                            {paginated.map(project => {
                                const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.planned;
                                return (
                                    <div key={project.id} className="bg-card-bg p-4 rounded-2xl border border-card-border hover:border-brand-gold/20 transition-all group">
                                        <div className="flex justify-between items-start gap-3 mb-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-sm text-foreground truncate group-hover:text-brand-gold transition-colors">{project.title}</p>
                                                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2 py-0.5 rounded border border-brand-gold/15 italic">{project.category}</span>
                                            </div>
                                            <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${st.color}`}>{st.label}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-card-border">
                                            <div className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                                {project.createdBy || 'Unassigned'} · {formatDate(project.date)}
                                            </div>
                                            <ActionButtons onView={() => openView(project)} onEdit={() => openEdit(project)} onDelete={() => handleDelete(project)} />
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
                                        {['Project', 'Photographer', 'Date', 'Status', ''].map((h, i) => (
                                            <th key={i} className={`p-4 font-black text-foreground/30 uppercase tracking-widest text-[9px] ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {paginated.map(project => {
                                        const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.planned;
                                        return (
                                            <tr key={project.id} className="hover:bg-background/40 transition-colors group">
                                                <td className="p-4 max-w-[260px]">
                                                    <p className="font-bold text-foreground group-hover:text-brand-gold transition-colors truncate">{project.title}</p>
                                                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2 py-0.5 rounded border border-brand-gold/15 italic">{project.category}</span>
                                                </td>
                                                <td className="p-4 text-foreground/40 font-medium text-xs">
                                                    {project.createdBy || <span className="text-foreground/20 italic">Unassigned</span>}
                                                </td>
                                                <td className="p-4 text-foreground/30 font-mono text-[11px]">{formatDate(project.date)}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${st.color}`}>
                                                        <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionButtons onView={() => openView(project)} onEdit={() => openEdit(project)} onDelete={() => handleDelete(project)} />
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
                title={modalConfig.type === 'edit' ? 'Edit Project' : 'Project Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormFields formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Project'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const st = STATUS_CONFIG[modalConfig.data.status] || STATUS_CONFIG.planned;
                    return (
                        <div className="space-y-5">
                            <div className="flex justify-between items-start pb-5 border-b border-card-border">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground leading-tight">{modalConfig.data.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/15 italic">{modalConfig.data.category}</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${st.color}`}>{st.label}</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center text-brand-gold">
                                    <Camera size={22} />
                                </div>
                            </div>
                            {modalConfig.data.description && (
                                <p className="text-sm text-foreground/60 leading-relaxed italic bg-white/3 p-4 rounded-2xl border border-card-border">
                                    &quot;{modalConfig.data.description}&quot;
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Photographer</p>
                                    <p className="text-sm font-black text-brand-gold">{modalConfig.data.createdBy || '—'}</p>
                                </div>
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-sm font-black text-foreground">{formatDate(modalConfig.data.date)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
