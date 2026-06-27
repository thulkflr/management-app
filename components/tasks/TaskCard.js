// components/tasks/TaskCard.js
'use client';

import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { TASK_PRIORITIES, TASK_TYPES } from '@/constants/taskConstants';
import { format } from 'date-fns';

export default function TaskCard({ task, onClick }) {
    const priority = TASK_PRIORITIES[task.priority?.toUpperCase()] || TASK_PRIORITIES.MEDIUM;
    const taskType = TASK_TYPES.find(t => t.id === task.type) || TASK_TYPES[0];

    return (
        <div
            onClick={() => onClick(task)}
            className="group bg-card-bg/80 backdrop-blur-md border border-card-border p-4 rounded-3xl shadow-sm hover:shadow-xl hover:border-brand-gold/50 transition-all duration-300 cursor-pointer active:scale-95 mb-3"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${priority.bg} ${priority.color} shadow-sm`}>
                    {priority.label}
                </span>
                <span className="text-text-muted group-hover:text-brand-gold transition-colors">
                    <Clock size={14} />
                </span>
            </div>

            <h4 className="font-bold text-foreground mb-1 line-clamp-2 leading-snug group-hover:text-brand-gold transition-colors tracking-tight">
                {task.title}
            </h4>
            
            <p className="text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed font-medium opacity-80">
                {task.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-accent-slate/80 px-2.5 py-1 rounded-xl text-[10px] font-black text-text-muted uppercase tracking-tighter border border-card-border">
                    <span className="text-brand-gold">⚡</span>
                    {taskType.label}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-card-border mt-2">
                <div className="flex items-center gap-2 text-text-muted">
                    <div className="w-6 h-6 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20 shadow-inner overflow-hidden">
                        <User size={12} />
                    </div>
                    <span className="text-[10px] font-black text-foreground/80 truncate max-w-[80px] uppercase tracking-tighter">
                        {task.assignee || 'Unassigned'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-text-muted text-[10px] font-bold">
                        <Calendar size={12} className="opacity-40" />
                        {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  )}
                  {task.commentCount > 0 && (
                    <div className="flex items-center gap-1 text-text-muted text-[10px] font-bold">
                        <MessageSquare size={12} className="opacity-40" />
                        {task.commentCount}
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
}
