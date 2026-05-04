// app/ideas/page.js
'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Lightbulb, Plus, X, Star, Tag, User, MessageSquare } from 'lucide-react';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';

const INITIAL_FORM_DATA = {
    title: '',
    description: '',
    category: 'Portrait',
    tags: '',
    rating: 5,
    createdBy: ''
};

export default function Ideas() {
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
                await updateRecord('Ideas', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Ideas', formData);
            }
            setShowForm(false);
            setFormData(INITIAL_FORM_DATA);
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (idea) => {
        if (confirm(`Are you sure you want to delete "${idea.title}"?`)) {
            try {
                await deleteRecord('Ideas', idea.id);
            } catch (err) {
                alert('❌ فشل الحذف: ' + err.message);
            }
        }
    };

    const openEdit = (idea) => {
        setFormData({ ...idea });
        setModalConfig({ isOpen: true, type: 'edit', data: idea });
    };

    const openView = (idea) => {
        setModalConfig({ isOpen: true, type: 'view', data: idea });
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Photography Ideas</h1>
                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Inspiration and creative plans for future shoots</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData(INITIAL_FORM_DATA);
                        setModalConfig({ isOpen: false, type: null, data: null });
                    }}
                    className="w-full sm:w-auto bg-brand-gold text-black px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel' : 'Add New Idea'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-10 rounded-3xl border border-card-border shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-6 duration-500">
                    <div className="flex items-center gap-3 border-b border-card-border pb-4">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                            <Lightbulb size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Submit New Insight</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                                <MessageSquare size={16} className="text-brand-gold" /> Title
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Neon Night Portraits"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                                <User size={16} className="text-brand-gold" /> Contributed By
                            </label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={formData.createdBy}
                                onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground/70 text-foreground">Detailed Concept</label>
                        <textarea
                            placeholder="Explain the vision, lighting setup, or general idea..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all h-32 resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70">Theme/Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option>Portrait</option>
                                <option>Landscape</option>
                                <option>Street</option>
                                <option>Commercial</option>
                                <option>Abstract</option>
                                <option>Nature</option>
                                <option>Cinematic</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                                <Tag size={16} className="text-brand-gold" /> Tags
                            </label>
                            <input
                                type="text"
                                placeholder="night, low-light, color"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70">Potential (1-5)</label>
                            <div className="flex items-center gap-3 bg-background p-3 rounded-2xl border border-card-border">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: num })}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${formData.rating >= num ? 'bg-brand-gold/20 text-brand-gold scale-110 shadow-sm' : 'text-foreground/20 hover:text-brand-gold'
                                            }`}
                                    >
                                        <Star size={20} fill={formData.rating >= num ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={isSaving}
                        type="submit"
                        className="bg-foreground text-background p-5 rounded-2xl w-full font-extrabold text-lg shadow-2xl hover:opacity-90 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving && <Loader size={20} />}
                        {isSaving ? 'Preserving...' : 'Preserve Idea'}
                    </button>
                </form>
            )}

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(!data.ideas || data.ideas.length === 0) ? (
                    <div className="col-span-full text-center py-32 bg-card-bg rounded-[2.5rem] border border-dashed border-card-border text-foreground/20">
                        <div className="bg-brand-gold/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-gold/20">
                            <Lightbulb size={40} />
                        </div>
                        <p className="italic text-lg font-medium">No creative ideas cataloged yet. Start the spark!</p>
                    </div>
                ) : (
                    data.ideas.map(idea => (
                        <div key={idea.id} className="bg-card-bg p-6 rounded-[2rem] shadow-sm border border-card-border hover:shadow-2xl hover:border-brand-gold/30 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="relative z-10 space-y-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-[0.2em] rounded-md border border-brand-gold/10 italic">
                                                {idea.category}
                                            </span>
                                            <div className="flex text-brand-gold opacity-40">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} fill={i < Number(idea.rating) ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                        <h3 className="font-black text-lg text-foreground group-hover:text-brand-gold transition-colors leading-tight truncate">
                                            {idea.title}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold/30 group-hover:bg-brand-gold group-hover:text-black transition-all duration-500 shadow-sm border border-brand-gold/10">
                                        <Lightbulb size={20} />
                                    </div>
                                </div>

                                {idea.description && (
                                    <p className="text-xs text-foreground/50 leading-relaxed font-medium line-clamp-2 italic opacity-60">
                                        &quot;{idea.description}&quot;
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {(idea.tags || "").split(',').filter(t => t.trim()).map((tag, idx) => (
                                        <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-white/5 text-foreground/40 text-[9px] font-black uppercase tracking-widest rounded-lg border border-card-border">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-card-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black text-[10px] border border-brand-gold/20 shadow-inner">
                                            {idea.createdBy?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <span className="text-[9px] text-foreground/30 font-black uppercase tracking-[0.2em]">{idea.createdBy || 'General'}</span>
                                    </div>
                                    <ActionButtons
                                        onView={() => openView(idea)}
                                        onEdit={() => openEdit(idea)}
                                        onDelete={() => handleDelete(idea)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AppModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Idea' : 'Idea Details'}
            >
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70">Contributed By</label>
                                <input
                                    type="text"
                                    value={formData.createdBy}
                                    onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70">Detailed Concept</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all h-32 resize-none"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70">Theme/Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                                >
                                    <option>Portrait</option>
                                    <option>Landscape</option>
                                    <option>Street</option>
                                    <option>Commercial</option>
                                    <option>Abstract</option>
                                    <option>Nature</option>
                                    <option>Cinematic</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70">Potential (1-5)</label>
                                <div className="flex items-center gap-2 bg-background p-3 rounded-2xl border border-card-border">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: num })}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formData.rating >= num ? 'bg-brand-gold/20 text-brand-gold' : 'text-foreground/20'}`}
                                        >
                                            <Star size={16} fill={formData.rating >= num ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="bg-brand-gold text-black p-5 rounded-2xl w-full font-extrabold text-lg shadow-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving && <Loader size={20} />}
                            {isSaving ? 'Updating...' : 'Update Idea'}
                        </button>
                    </form>
                ) : modalConfig.data && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-start border-b border-card-border pb-6">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-foreground leading-tight">{modalConfig.data.title}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-black uppercase tracking-widest rounded-full border border-brand-gold/10 italic">
                                        {modalConfig.data.category}
                                    </span>
                                    <div className="flex text-brand-gold">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Number(modalConfig.data.rating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-3xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shadow-sm border border-brand-gold/10">
                                <Lightbulb size={32} />
                            </div>
                        </div>

                        {modalConfig.data.description && (
                            <div className="space-y-3">
                                <p className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em]">Detailed Vision</p>
                                <p className="text-foreground/70 leading-relaxed text-lg font-medium bg-white/5 p-6 rounded-3xl border border-card-border italic">
                                    &quot;{modalConfig.data.description}&quot;
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em]">Creator</p>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-card-border">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black border border-brand-gold/10">
                                        {modalConfig.data.createdBy?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{modalConfig.data.createdBy || 'Anonymous'}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em]">Keywords</p>
                                <div className="flex flex-wrap gap-2">
                                    {(modalConfig.data.tags || "").split(',').filter(t => t.trim()).map((tag, idx) => (
                                        <span key={idx} className="px-3 py-2 bg-background border border-card-border rounded-xl text-foreground/50 text-xs font-bold flex items-center gap-2">
                                            <Tag size={12} className="text-brand-gold/40" />
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AppModal>
        </div>
    );
}
