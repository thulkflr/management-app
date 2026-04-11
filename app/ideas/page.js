// app/ideas/page.js
'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Lightbulb, Plus, X, Star, Tag, User, MessageSquare } from 'lucide-react';

export default function Ideas() {
    const { data, loading, addRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Portrait',
        tags: '',
        rating: 5,
        createdBy: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRecord('Ideas', {
                ...formData,
            });
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                category: 'Portrait',
                tags: '',
                rating: 5,
                createdBy: ''
            });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        }
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
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Photography Ideas</h1>
                    <p className="text-foreground/40 mt-1 font-medium text-lg">Inspiration and creative plans for future shoots</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
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
                    <button type="submit" className="bg-foreground text-background p-5 rounded-2xl w-full font-extrabold text-lg shadow-2xl hover:opacity-90 transition-all active:scale-[0.98] mt-4">
                        Preserve Idea
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
                        <div key={idea.id} className="bg-card-bg p-8 rounded-[2.5rem] shadow-sm border border-card-border hover:shadow-2xl hover:border-brand-gold/30 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden">
                            {/* Accent Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3 max-w-[75%]">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/10 italic">
                                                {idea.category}
                                            </span>
                                            <div className="flex text-brand-gold">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < Number(idea.rating) ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                        <h3 className="font-black text-2xl text-foreground group-hover:text-brand-gold transition-colors leading-tight">
                                            {idea.title}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold/40 group-hover:bg-brand-gold group-hover:text-black transition-all duration-500 shadow-sm border border-brand-gold/10">
                                        <Lightbulb size={24} />
                                    </div>
                                </div>

                                {idea.description && (
                                    <p className="text-foreground/60 leading-relaxed font-medium">
                                        {idea.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {(idea.tags || "").split(',').filter(t => t.trim()).map((tag, idx) => (
                                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-background text-foreground/50 text-[11px] font-bold rounded-xl border border-card-border hover:border-brand-gold/40 hover:text-brand-gold transition-all">
                                            <Tag size={12} className="text-brand-gold/40" />
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>

                                {idea.createdBy && (
                                    <div className="pt-6 border-t border-card-border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black text-xs border border-brand-gold/20 shadow-inner">
                                                {idea.createdBy.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Creator</span>
                                                <span className="text-sm text-foreground/80 font-black tracking-wide">{idea.createdBy}</span>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-foreground/20 font-black uppercase tracking-widest italic">
                                            #{idea.id?.toString().slice(-4)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
