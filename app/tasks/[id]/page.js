'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CommentsSection from '@/components/tasks/CommentsSection';
import { TASK_PRIORITIES, TASK_TYPES } from '@/constants/taskConstants';
import { Calendar, Clock, User, Tag, Flag, AlignLeft, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTasks } from '@/context/TasksContext';

export default function TaskDetailPage() {
    const { id } = useParams();
    const { tasks, boardColumns } = useTasks();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tasks.length > 0) {
            const found = tasks.find(t => t.id === id);
            setTask(found || null);
            setLoading(false);
        }
    }, [tasks, id]);

    // Get readable status from column ID
    const getStatusLabel = (statusId) => {
        const col = boardColumns.find(c => c.id === statusId);
        return col ? col.label : statusId;
    };

    if (loading) return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-brand-gold" />
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/30">Loading task...</p>
                </div>
            </div>
        </div>
    );

    if (!task) return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <p className="text-lg font-black text-foreground/40">Task not found</p>
                <Link href="/tasks" className="px-6 py-3 bg-brand-gold text-black rounded-xl font-bold hover:opacity-90 transition">
                    ← Back to Tasks
                </Link>
            </div>
        </div>
    );

    const priority = TASK_PRIORITIES[task.priority?.toUpperCase()] || TASK_PRIORITIES.MEDIUM;
    const taskType = TASK_TYPES.find(t => t.id === task.type) || TASK_TYPES[0];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Navigation & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/tasks"
                        className="p-2.5 bg-card-bg border border-card-border rounded-xl text-foreground/40 hover:text-brand-gold hover:border-brand-gold/30 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold opacity-60 mb-1">Task Management / Details</p>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight line-clamp-1">{task.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Task Description Card */}
                        <div className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
                                    <AlignLeft size={16} />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Description</h2>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                                    {task.description || 'No description provided for this task.'}
                                </p>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8 shadow-sm">
                            <CommentsSection taskId={task.id} />
                        </div>
                    </div>

                    {/* Metadata Sidebar (Right Column) */}
                    <div className="space-y-6">
                        <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-sm space-y-8">
                            {/* Status */}
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 flex items-center gap-2">
                                    <Tag size={12} className="text-brand-gold" /> Status
                                </label>
                                <div className="bg-background border border-card-border rounded-2xl p-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground">{getStatusLabel(task.status)}</span>
                                    <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(197,160,34,0.5)] animate-pulse" />
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 flex items-center gap-2">
                                        <Flag size={12} className="text-brand-gold" /> Priority
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${priority.bg} ${priority.color}`}>
                                            {priority.label}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 flex items-center gap-2">
                                        <Clock size={12} className="text-brand-gold" /> Task Type
                                    </label>
                                    <div className="text-sm font-bold text-foreground bg-background border border-card-border rounded-xl px-4 py-2 inline-block">
                                        ⚡ {taskType.label}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 flex items-center gap-2">
                                        <User size={12} className="text-brand-gold" /> Assignee
                                    </label>
                                    <div className="flex items-center gap-3 bg-background border border-card-border rounded-2xl p-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20 shadow-inner">
                                            <User size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-foreground uppercase tracking-tight">{task.assignee || 'Unassigned'}</p>
                                            <p className="text-[9px] font-bold text-foreground/30 uppercase">Team Member</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 flex items-center gap-2">
                                        <Calendar size={12} className="text-brand-gold" /> Due Date
                                    </label>
                                    <div className="text-sm font-bold text-foreground">
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMMM do, yyyy') : 'No deadline set'}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Metadata */}
                            <div className="pt-6 border-t border-card-border flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-foreground/30 uppercase tracking-widest">Task ID</span>
                                    <span className="font-mono text-brand-gold">{task.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-foreground/30 uppercase tracking-widest">Created</span>
                                    <span className="text-foreground font-bold">{task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-brand-gold rounded-3xl p-6 text-black shadow-2xl shadow-brand-gold/20 flex flex-col items-center text-center group cursor-pointer hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-3 group-hover:bg-black/20 transition-colors">
                                <Flag size={24} />
                            </div>
                            <h3 className="font-black uppercase tracking-tighter text-sm mb-1">Production View</h3>
                            <p className="text-[10px] font-bold opacity-70 leading-tight">View related production assets and media for this task</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
