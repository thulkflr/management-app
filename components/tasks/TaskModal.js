// components/tasks/TaskModal.js
'use client';

import { useState } from 'react';
import { X, Calendar, User, AlignLeft, Tag, Flag, Trash2, Clock } from 'lucide-react';
import { TASK_TYPES, TASK_PRIORITIES } from '@/constants/taskConstants';
import { useTasks } from '@/context/TasksContext';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import TaskChecklist from './TaskChecklist';
import TaskAttachments from './TaskAttachments';
import CommentsSection from './CommentsSection';
import ConfirmDialog from '@/components/ConfirmDialog';
import Dropdown from '@/components/ui/Dropdown';

const parseJSON = (str, fallback) => {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

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
        checklist: parseJSON(task?.checklist, []),
        attachments: parseJSON(task?.attachments, []),
    });

    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!formData.title.trim()) {
            setActiveTab('details');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                checklist: JSON.stringify(formData.checklist),
                attachments: JSON.stringify(formData.attachments),
            };

            if (isNew) {
                await addTask(payload);
            } else {
                await updateTask(task.id, payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setConfirmConfig({
            title: 'Delete task',
            message: 'Delete this task? This cannot be undone.',
            confirmLabel: 'Delete Task',
            onConfirm: async () => {
                try {
                    await deleteTask(task.id);
                    setConfirmConfig(null);
                    onClose();
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    return (
        <>
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-black/72 backdrop-blur-xl animate-in fade-in duration-200" onClick={onClose} />
            
            <div className="relative bg-card-bg/95 backdrop-blur-2xl w-full max-w-5xl max-h-[92dvh] sm:max-h-[88vh] rounded-t-[2rem] sm:rounded-[28px] shadow-[0_32px_110px_rgba(0,0,0,0.62)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300 border border-white/10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/8 to-transparent" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent" />
                {/* Modal Header */}
                <div className="relative z-10 p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.025]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl border shadow-lg shadow-black/10 ${isNew ? 'bg-brand-gold/12 border-brand-gold/25 text-brand-gold' : 'bg-white/5 border-white/10 text-brand-gold'}`}>
                            <Tag size={20} />
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-tight">
                            {isNew ? 'Create New Task' : 'Task Details'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button 
                                onClick={handleDelete}
                                className="p-2 text-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl border border-transparent hover:border-red-400/20 transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 text-foreground/45 hover:text-foreground hover:bg-white/8 rounded-xl border border-transparent hover:border-white/10 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
                    {/* Main Content Area */}
                    <div className="flex-1 p-5 md:p-8 border-r border-white/8">
                        <div className="mb-8 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-1 p-1 bg-white/[0.045] border border-white/8 rounded-2xl w-max shadow-inner">
                                {[
                                    { id: 'details', label: 'Details' },
                                    { id: 'checklist', label: 'Checklist', count: formData.checklist.length },
                                    { id: 'files', label: 'Files', count: formData.attachments.length },
                                    { id: 'comments', label: 'Comments', hide: isNew }
                                ].filter(t => !t.hide).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeTab === tab.id 
                                            ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
                                            : 'text-foreground/45 hover:text-foreground hover:bg-white/5'
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-black/20' : 'bg-white/10'}`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'details' && (
                            <form id="task-form" onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-2 ml-1">Task Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="What needs to be done?"
                                        className="w-full text-xl md:text-2xl font-black text-foreground placeholder:text-foreground/25 bg-white/[0.035] border border-white/8 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-2 ml-1 flex items-center gap-2">
                                        <AlignLeft size={12} /> Description
                                    </label>
                                    <textarea 
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Add more details about this task..."
                                        className="w-full bg-white/[0.035] border border-white/10 rounded-2xl p-4 text-sm font-medium text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all resize-none"
                                    />
                                </div>
                            </form>
                        )}

                        {activeTab === 'checklist' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <TaskChecklist 
                                    items={formData.checklist} 
                                    onChange={(newList) => setFormData({...formData, checklist: newList})} 
                                />
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <TaskAttachments 
                                    attachments={formData.attachments} 
                                    onChange={(newFiles) => setFormData({...formData, attachments: newFiles})} 
                                />
                            </div>
                        )}

                        {activeTab === 'comments' && !isNew && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <CommentsSection taskId={task.id} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-full md:w-80 bg-white/[0.025] p-5 md:p-8 space-y-6 md:space-y-8 border-t md:border-t-0 border-white/8">
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-3 flex items-center gap-2">
                                <Tag size={12} /> Status
                            </label>
                            <Dropdown
                                value={formData.status}
                                onChange={(value) => setFormData({...formData, status: value})}
                                options={columns.map(s => ({ value: s.id, label: s.label }))}
                                placeholder="Select status"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:gap-6">
                            <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-3 flex items-center gap-2">
                                    <Clock size={12} /> Task Type
                                </label>
                                <Dropdown
                                    value={formData.type}
                                    onChange={(value) => setFormData({...formData, type: value})}
                                    options={TASK_TYPES.map(t => ({ value: t.id, label: t.label }))}
                                    placeholder="Select task type"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-3 flex items-center gap-2">
                                    <Flag size={12} /> Priority
                                </label>
                                <Dropdown
                                    value={formData.priority}
                                    onChange={(value) => setFormData({...formData, priority: value})}
                                    options={Object.values(TASK_PRIORITIES).map(p => ({ value: p.id, label: p.label }))}
                                    placeholder="Select priority"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-3 flex items-center gap-2">
                                    <User size={12} /> Assignee
                                </label>
                                <Dropdown
                                    value={formData.assignee}
                                    onChange={(value) => setFormData({...formData, assignee: value})}
                                    options={[{ value: '', label: 'Unassigned' }, ...members.map(m => ({ value: m.name || m.username, label: m.name || m.username }))]}
                                    placeholder="Select assignee"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45 mb-3 flex items-center gap-2">
                                    <Calendar size={12} /> Due Date
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    className="w-full bg-background/70 border border-white/10 rounded-2xl p-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        {!isNew && (
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[9px] md:text-[10px] text-foreground/45 font-bold uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-xs text-foreground font-bold">{task.createdAt ? format(new Date(task.createdAt), 'PPP p') : '-'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 p-4 md:p-6 border-t border-white/10 bg-white/[0.025] flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 md:py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground bg-white/5 border border-white/8 hover:border-white/15 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gradient-to-br from-[#e4c34f] to-brand-gold text-black px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0"
                    >
                        {isSaving && <Clock className="animate-spin" size={14} />}
                        {isNew ? 'Create Task' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
        <ConfirmDialog
            isOpen={!!confirmConfig}
            title={confirmConfig?.title}
            message={confirmConfig?.message}
            confirmLabel={confirmConfig?.confirmLabel}
            onCancel={() => setConfirmConfig(null)}
            onConfirm={confirmConfig?.onConfirm}
        />
        </>
    );
}
