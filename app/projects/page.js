// app/projects/page.js
'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Projects() {
    const { data, loading, addRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Event',
        status: 'planned',
        date: new Date().toISOString().slice(0, 16), // Default to current date/time in YYYY-MM-DDTHH:mm format
        createdBy: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRecord('Projects', {
                ...formData,
            });
            setShowForm(false);
            setFormData({
                title: '',
                description: '',
                category: 'Event',
                status: 'planned',
                date: new Date().toISOString().slice(0, 16),
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
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-brand-gold/10 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Projects</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-brand-gold text-black px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : '+ New Project'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card-bg p-5 md:p-8 rounded-2xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-foreground">New Project</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Project Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Smith Wedding 2026"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Created By</label>
                            <input
                                type="text"
                                placeholder="Photographer Name"
                                value={formData.createdBy}
                                onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground/70">Description</label>
                        <textarea
                            placeholder="Project details..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition h-24 resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            >
                                <option>School Graduation</option>
                                <option>University Graduation</option>
                                <option>Wedding</option>
                                <option>Portrait</option>
                                <option>Commercial</option>
                                <option>Event</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                    </div>
                    <button type="submit" className="bg-foreground text-background p-3.5 rounded-xl w-full font-bold shadow-lg hover:opacity-90 transition active:scale-95">
                        Save Project
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
                        <div key={project.id} className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border hover:shadow-xl hover:border-brand-gold/30 transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-foreground group-hover:text-brand-gold transition-colors truncate">{project.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/10 italic">
                                                {project.category}
                                            </span>
                                            <span className="text-[10px] font-medium text-foreground/40">•</span>
                                            <span className="text-[10px] font-medium text-foreground/40">
                                                {new Date(project.date).toLocaleDateString()} {new Date(project.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                                        }`}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>
                                )}

                                {project.createdBy && (
                                    <div className="pt-3 border-t border-card-border flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-brand-gold/10 flex items-center justify-center text-[10px] font-bold text-brand-gold border border-brand-gold/20">
                                            {project.createdBy.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[11px] text-foreground/50 font-medium">{project.createdBy}</span>
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