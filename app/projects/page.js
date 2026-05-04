// app/projects/page.js
'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';

const INITIAL_FORM_DATA = {
    title: '',
    description: '',
    category: 'Event',
    status: 'planned',
    date: new Date().toISOString().slice(0, 16),
    createdBy: ''
};

export default function Projects() {
    const { data, loading, addRecord, updateRecord, deleteRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Projects', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Projects', formData);
            }
            setShowForm(false);
            setFormData(INITIAL_FORM_DATA);
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (project) => {
        if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
            try {
                await deleteRecord('Projects', project.id);
            } catch (err) {
                alert('❌ فشل الحذف: ' + err.message);
            }
        }
    };

    const openEdit = (project) => {
        setFormData({ ...project });
        setModalConfig({ isOpen: true, type: 'edit', data: project });
    };

    const openView = (project) => {
        setModalConfig({ isOpen: true, type: 'view', data: project });
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <div className="h-10 w-48 bg-brand-gold/10 animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-brand-gold/10 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Active Projects</h1>
                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Management and tracking of ongoing shoots</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData(INITIAL_FORM_DATA);
                        setModalConfig({ isOpen: false, type: null, data: null });
                    }}
                    className="w-full sm:w-auto bg-brand-gold text-black px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : '+ New Project'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-10 rounded-3xl border border-card-border shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-6 duration-300">
                    <h2 className="text-xl font-black text-foreground tracking-tight">Project Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Project Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Summer Wedding"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Creator</label>
                            <input
                                type="text"
                                placeholder="Photographer Name"
                                value={formData.createdBy}
                                onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Description</label>
                        <textarea
                            placeholder="Project scope and details..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition h-28 resize-none text-sm font-bold"
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            >
                                <option>Event</option>
                                <option>School Graduation</option>
                                <option>University Graduation</option>
                                <option>Family</option>
                                <option>Portrait</option>
                                <option>Commercial</option>
                                <option>Wedding</option>
                                <option>Product</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold appearance-none"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                        </div>
                    </div>
                    <button
                        disabled={isSaving}
                        type="submit"
                        className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader size={18} />}
                        {isSaving ? 'Saving...' : 'Save Project'}
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.projects.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-card-bg rounded-2xl border border-card-border text-foreground/40 italic">
                        No projects listed yet.
                    </div>
                ) : (
                    data.projects.map(project => (
                        <div key={project.id} className="bg-card-bg p-6 rounded-[2rem] shadow-sm border border-card-border hover:shadow-xl hover:border-brand-gold/30 transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-brand-gold transition-colors truncate">{project.title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/10 italic">
                                                {project.category}
                                            </span>
                                            <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                                                {new Date(project.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                                        }`}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-xs text-foreground/50 leading-relaxed font-medium line-clamp-2 bg-white/5 p-3 rounded-xl border border-card-border">
                                        {project.description}
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-card-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-[10px] font-black text-brand-gold border border-brand-gold/20 shadow-inner">
                                        {project.createdBy?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{project.createdBy || 'Draft'}</span>
                                </div>
                                <ActionButtons
                                    onView={() => openView(project)}
                                    onEdit={() => openEdit(project)}
                                    onDelete={() => handleDelete(project)}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AppModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Project' : 'Project Details'}
            >
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Project Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Creator</label>
                                <input
                                    type="text"
                                    value={formData.createdBy}
                                    onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition h-28 resize-none text-sm font-bold"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                >
                                    <option>Event</option>
                                    <option>School Graduation</option>
                                    <option>University Graduation</option>
                                    <option>Family</option>
                                    <option>Portrait</option>
                                    <option>Commercial</option>
                                    <option>Wedding</option>
                                    <option>Product</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                        </div>
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader size={18} />}
                            {isSaving ? 'Updating...' : 'Update Project'}
                        </button>
                    </form>
                ) : modalConfig.data && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-card-border pb-6">
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{modalConfig.data.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/10 italic">
                                        {modalConfig.data.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${modalConfig.data.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        modalConfig.data.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                                        }`}>
                                        {modalConfig.data.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/10">
                                <FolderKanban size={24} />
                            </div>
                        </div>
                        {modalConfig.data.description && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Scope/Description</p>
                                <p className="text-sm font-medium text-foreground/70 leading-relaxed bg-white/5 p-4 rounded-2xl border border-card-border italic">
                                    &quot;{modalConfig.data.description}&quot;
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-card-border">
                                <p className="text-[10px] font-black text-foreground/30 uppercase mb-1 tracking-widest">Creator</p>
                                <p className="text-sm font-black text-brand-gold">{modalConfig.data.createdBy || 'Unknown'}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-card-border">
                                <p className="text-[10px] font-black text-foreground/30 uppercase mb-1 tracking-widest">Scheduled</p>
                                <p className="text-sm font-black text-foreground font-mono">{new Date(modalConfig.data.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </AppModal>
        </div>
    );
}
import { FolderKanban } from 'lucide-react';