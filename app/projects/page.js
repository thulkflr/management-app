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
            <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Projects</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition"
                >
                    {showForm ? 'Cancel' : '+ New Project'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-slate-800">New Project</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Project Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Smith Wedding 2026"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Created By</label>
                            <input
                                type="text"
                                placeholder="Photographer Name"
                                value={formData.createdBy}
                                onChange={e => setFormData({ ...formData, createdBy: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Description</label>
                        <textarea
                            placeholder="Project details..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition h-24 resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
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
                            <label className="text-sm font-semibold text-slate-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white p-3.5 rounded-xl w-full font-bold shadow-lg hover:bg-black transition active:scale-95">
                        Save Project
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.projects.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100 text-slate-400 italic">
                        No projects listed yet.
                    </div>
                ) : (
                    data.projects.map(project => (
                        <div key={project.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition truncate">{project.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
                                                {project.category}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">•</span>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {new Date(project.date).toLocaleDateString()} {new Date(project.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                                )}

                                {project.createdBy && (
                                    <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {project.createdBy.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium">{project.createdBy}</span>
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