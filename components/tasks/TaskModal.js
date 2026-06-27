// components/tasks/TaskModal.js
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, AlignLeft, Tag, Flag, Trash2, Send, Clock } from 'lucide-react';
import { TASK_STATUSES, TASK_TYPES, TASK_PRIORITIES } from '@/constants/taskConstants';
import { useTasks } from '@/context/TasksContext';
import { useAppContext } from '@/context/AppContext';
import CommentsSection from './CommentsSection';
import { format } from 'date-fns';

export default function TaskModal({ task, onClose }) {
    const isNew = !task?.id;
    const { addTask, updateTask, deleteTask, columns } = useTasks();
    const { data: globalData } = useAppContext();
    const members = globalData?.members || [];

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || (columns[0]?.id || 'planning'),
        type: task?.type || 'photography-session',
        priority: task?.priority || 'medium',
        assignee: task?.assignee || '',
        dueDate: task?.dueDate || '',
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isNew) {
                await addTask(formData);
            } else {
                await updateTask(task.id, formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(task.id);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${isNew ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            <Tag size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {isNew ? 'Create New Task' : 'Task Details'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button 
                                onClick={handleDelete}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                    {/* Main Content Area */}
                    <div className="flex-1 p-8 border-r border-slate-100">
                        <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Task Title</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="What needs to be done?"
                                    className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none p-0 focus:ring-0"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1 flex items-center gap-2">
                                    <AlignLeft size={12} /> Description
                                </label>
                                <textarea 
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Add more details about this task..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                />
                            </div>
                        </form>

                        {!isNew && <CommentsSection taskId={task.id} />}
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-full md:w-80 bg-slate-50/50 p-8 space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <Tag size={12} /> Status
                            </label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer"
                            >
                                {columns.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <Clock size={12} /> Task Type
                                </label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer"
                                >
                                    {TASK_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <Flag size={12} /> Priority
                                </label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer"
                                >
                                    {Object.values(TASK_PRIORITIES).map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <User size={12} /> Assignee
                                </label>
                                <select 
                                    value={formData.assignee}
                                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.name || m.username}>{m.name || m.username}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <Calendar size={12} /> Due Date
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        {!isNew && (
                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-xs text-slate-600 font-bold">{task.createdAt ? format(new Date(task.createdAt), 'PPP p') : '-'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        form="task-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-gold text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        {isSaving && <Clock className="animate-spin" size={14} />}
                        {isNew ? 'Create Task' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
