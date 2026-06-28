// app/projects/page.js
'use client';
import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';
import { FolderKanban, Camera, CalendarDays, User2, Plus, X } from 'lucide-react';

const INITIAL_FORM_DATA = {
    title: '',
    description: '',
    category: 'Event',
    status: 'planned',
    date: new Date().toISOString().slice(0, 16),
    createdBy: ''
};

const STATUS_CONFIG = {
    planned:     { label: 'Planned',     color: 'text-brand-gold   bg-brand-gold/10  border-brand-gold/20'  },
    in_progress: { label: 'In Progress', color: 'text-blue-400     bg-blue-400/10    border-blue-400/20'    },
    completed:   { label: 'Completed',   color: 'text-emerald-400  bg-emerald-400/10 border-emerald-400/20' },
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
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</label>
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold">
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
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
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const stats = useMemo(() => ({
        total: data.projects.length,
        planned: data.projects.filter(p => p.status === 'planned').length,
        active: data.projects.filter(p => p.status === 'in_progress').length,
        done: data.projects.filter(p => p.status === 'completed').length,
    }), [data.projects]);

    const filtered = useMemo(() => statusFilter === 'all'
        ? data.projects
        : data.projects.filter(p => p.status === statusFilter),
        [data.projects, statusFilter]);

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

    const handleDelete = async (project) => {
        if (confirm(`Delete "${project.title}"?`)) {
            try { await deleteRecord('Projects', project.id); }
            catch (err) { alert('❌ ' + err.message); }
        }
    };

    const openEdit = (project) => {
        setFormData({ ...project });
        setModalConfig({ isOpen: true, type: 'edit', data: project });
    };

    const openView = (project) => setModalConfig({ isOpen: true, type: 'view', data: project });

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-brand-gold/10 rounded-xl" />
            <div className="flex gap-3">{[1,2,3,4].map(i => <div key={i} className="h-20 flex-1 bg-brand-gold/10 rounded-2xl" />)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-44 bg-brand-gold/10 rounded-3xl" />)}</div>
        </div>
    );

    const FILTERS = [
        { key: 'all',         label: 'All',         count: stats.total   },
        { key: 'planned',     label: 'Planned',     count: stats.planned },
        { key: 'in_progress', label: 'In Progress', count: stats.active  },
        { key: 'completed',   label: 'Completed',   count: stats.done    },
    ];

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-7 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                <Camera size={18} />
                            </span>
                            Projects
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

                {/* Status filters */}
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setStatusFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                statusFilter === f.key
                                    ? 'bg-brand-gold text-black border-brand-gold shadow-lg shadow-brand-gold/20'
                                    : 'border-card-border text-foreground/40 hover:border-brand-gold/30 hover:text-foreground/70'
                            }`}>
                            {f.label}
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${statusFilter === f.key ? 'bg-black/20' : 'bg-white/5'}`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-24 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                            <FolderKanban size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-sm">No projects yet</p>
                        </div>
                    ) : filtered.map(project => {
                        const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.planned;
                        return (
                            <div key={project.id}
                                className="bg-card-bg rounded-3xl border border-card-border hover:border-brand-gold/25 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-300 overflow-hidden group flex flex-col">

                                {/* Top bar - status color strip */}
                                <div className={`h-0.5 w-full ${project.status === 'completed' ? 'bg-emerald-500/60' : project.status === 'in_progress' ? 'bg-blue-500/60' : 'bg-brand-gold/40'}`} />

                                <div className="p-5 flex flex-col flex-1">
                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-base text-foreground group-hover:text-brand-gold transition-colors leading-snug truncate">
                                                {project.title}
                                            </h3>
                                            <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2 py-0.5 rounded border border-brand-gold/15 italic">
                                                {project.category}
                                            </span>
                                        </div>
                                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${st.color}`}>
                                            {st.label}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {project.description && (
                                        <p className="text-xs text-foreground/45 leading-relaxed font-medium line-clamp-2 mb-4 italic">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-[10px] font-black">
                                                {project.createdBy?.charAt(0)?.toUpperCase() || <User2 size={12} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest leading-none">
                                                    {project.createdBy || 'Unassigned'}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <CalendarDays size={9} className="text-foreground/20" />
                                                    <p className="text-[9px] text-foreground/25 font-medium">
                                                        {project.date ? new Date(project.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <ActionButtons onView={() => openView(project)} onEdit={() => openEdit(project)} onDelete={() => handleDelete(project)} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

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
                                    <p className="text-sm font-black text-foreground">
                                        {modalConfig.data.date ? new Date(modalConfig.data.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
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
