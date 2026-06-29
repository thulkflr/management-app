// app/ideas/page.js
'use client';
import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Lightbulb, Plus, X, Star, Tag, User } from 'lucide-react';
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

const CATEGORIES = ['Portrait', 'Landscape', 'Street', 'Commercial', 'Abstract', 'Nature', 'Cinematic'];

const StarRating = ({ value, onChange }) => (
    <div className="flex items-center gap-1.5 bg-background p-3 rounded-2xl border border-card-border">
        {[1, 2, 3, 4, 5].map(num => (
            <button key={num} type="button" onClick={() => onChange(num)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${value >= num ? 'bg-brand-gold/20 text-brand-gold scale-110' : 'text-foreground/20 hover:text-brand-gold/60'}`}>
                <Star size={18} fill={value >= num ? 'currentColor' : 'none'} />
            </button>
        ))}
    </div>
);

const IdeaFormFields = ({ formData, setFormData }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Title</label>
                <input required type="text" placeholder="e.g. Neon Night Portraits"
                    value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Contributed By</label>
                <input type="text" placeholder="Your name"
                    value={formData.createdBy} onChange={e => setFormData(p => ({ ...p, createdBy: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
        </div>
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Concept</label>
            <textarea placeholder="Lighting setup, mood, visual references..."
                value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition h-28 resize-none text-sm font-bold" />
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
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Tags</label>
                <input type="text" placeholder="night, low-light, color..."
                    value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Potential (1–5)</label>
                <StarRating value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} />
            </div>
        </div>
    </>
);

export default function Ideas() {
    const { data, loading, addRecord, updateRecord, deleteRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set((data.ideas || []).map(i => i.category).filter(Boolean));
        return ['All', ...Array.from(cats).sort()];
    }, [data.ideas]);

    const filtered = useMemo(() =>
        activeCategory === 'All'
            ? (data.ideas || [])
            : (data.ideas || []).filter(i => i.category === activeCategory),
        [data.ideas, activeCategory]
    );

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
            alert('❌ ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (idea) => {
        if (confirm(`Delete "${idea.title}"?`)) {
            try { await deleteRecord('Ideas', idea.id); }
            catch (err) { alert('❌ ' + err.message); }
        }
    };

    const openEdit = (idea) => {
        setFormData({ ...idea });
        setModalConfig({ isOpen: true, type: 'edit', data: idea });
    };

    const openView = (idea) => setModalConfig({ isOpen: true, type: 'view', data: idea });

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-52 bg-brand-gold/10 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-48 bg-brand-gold/10 rounded-3xl" />)}
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-7 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                                <Lightbulb size={18} />
                            </span>
                            Creative <span className="text-brand-gold italic">Ideas</span>
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {(data.ideas || []).length} concept{(data.ideas || []).length !== 1 ? 's' : ''} cataloged
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setFormData(INITIAL_FORM_DATA); setModalConfig({ isOpen: false, type: null, data: null }); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Idea'}
                    </button>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-base font-black text-foreground uppercase tracking-widest">New Idea</h2>
                        <IdeaFormFields formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Saving...' : 'Save Idea'}
                        </button>
                    </form>
                )}

                {/* Category filter */}
                {categories.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                    activeCategory === cat
                                        ? 'bg-brand-gold text-black border-brand-gold shadow-lg shadow-brand-gold/20'
                                        : 'border-card-border text-foreground/40 hover:border-brand-gold/30 hover:text-foreground/70'
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-28 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                            <Lightbulb size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-sm">No ideas yet</p>
                            <p className="text-xs mt-1 font-medium">Start capturing your creative vision.</p>
                        </div>
                    ) : filtered.map(idea => (
                        <div key={idea.id} className="bg-card-bg rounded-3xl border border-card-border hover:border-brand-gold/25 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-300 overflow-hidden group relative flex flex-col">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/4 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                            <div className="p-5 flex flex-col flex-1 space-y-4">
                                {/* Category + stars */}
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 bg-brand-gold/8 text-brand-gold text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-gold/15 italic">
                                        {idea.category}
                                    </span>
                                    <div className="flex items-center gap-0.5 text-brand-gold/50">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={11} fill={i < Number(idea.rating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="font-black text-lg text-foreground group-hover:text-brand-gold transition-colors leading-snug">
                                    {idea.title}
                                </h3>

                                {/* Description */}
                                {idea.description && (
                                    <p className="text-xs text-foreground/45 leading-relaxed font-medium line-clamp-2 italic">
                                        &quot;{idea.description}&quot;
                                    </p>
                                )}

                                {/* Tags */}
                                {idea.tags && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {String(idea.tags).split(',').filter(t => t.trim()).map((tag, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-white/4 text-foreground/35 text-[9px] font-black uppercase tracking-widest rounded-lg border border-card-border">
                                                <Tag size={8} className="text-brand-gold/30" />
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-black text-[10px]">
                                            {idea.createdBy?.charAt(0)?.toUpperCase() || <User size={10} />}
                                        </div>
                                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                            {idea.createdBy || 'Anonymous'}
                                        </span>
                                    </div>
                                    <ActionButtons onView={() => openView(idea)} onEdit={() => openEdit(idea)} onDelete={() => handleDelete(idea)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AppModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Idea' : 'Idea Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <IdeaFormFields formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Idea'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const idea = modalConfig.data;
                    return (
                        <div className="space-y-5">
                            <div className="flex justify-between items-start pb-5 border-b border-card-border">
                                <div className="space-y-2 flex-1 pr-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/15 italic">
                                            {idea.category}
                                        </span>
                                        <div className="flex text-brand-gold">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Number(idea.rating) ? 'currentColor' : 'none'} />)}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground leading-tight">{idea.title}</h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center text-brand-gold flex-shrink-0">
                                    <Lightbulb size={26} />
                                </div>
                            </div>

                            {idea.description && (
                                <p className="text-sm text-foreground/60 leading-relaxed italic bg-white/3 p-4 rounded-2xl border border-card-border">
                                    &quot;{idea.description}&quot;
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Creator</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-black text-sm">
                                            {idea.createdBy?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <p className="text-sm font-black text-foreground">{idea.createdBy || 'Anonymous'}</p>
                                    </div>
                                </div>
                                {idea.tags && (
                                    <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Keywords</p>
                                        <div className="flex flex-wrap gap-1">
                                            {String(idea.tags).split(',').filter(t => t.trim()).map((tag, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-background border border-card-border rounded-lg text-foreground/50 text-[10px] font-bold">
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
