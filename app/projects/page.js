// app/projects/page.js
'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Projects() {
    const { data, loading, addRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', category: 'Wedding', status: 'planned' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRecord('Projects', {
                ...formData,
                date: new Date().toISOString().split('T')[0]
            });
            setShowForm(false);
            setFormData({ title: '', category: 'Wedding', status: 'planned' });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        }
    };

    if (loading) return <div>Loading projects...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    + New Project
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Project Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 p-2">
                                <option>Wedding</option>
                                <option>Portrait</option>
                                <option>Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 p-2">
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg w-full">Save Project</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.projects.map(project => (
                    <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <p className="text-sm text-slate-500">{project.category} • {project.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                            {project.status.replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}